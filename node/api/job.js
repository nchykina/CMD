//var cfg = require('../config/config');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];

var file_api = require('./file');

var models = require('../models');
var util = require('util');

var http = require('http');

var mkdirp = require('mkdirp'); //ensure dir exists
var path = require('path');
var fs = require('fs');

var request = require('request');

var extend = require('node.extend'); //merge JavaScript objects 

var q = require('q'); //Q promise framework

var io = require('../io').emitter;

var job_create = function (req, res) {
    if (!req.user) {
        res.status(403).json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.body.jobtype) {
        res.status(404).json({success: false, msg: 'Not job type specified'});
        return;
    }

    if (req.body.jobparams) {
        if (req.body.jobparams['jobtype']) {
            res.status(404).json({success: false, msg: 'Do not even try to'});
            return;
        }

        if (req.body.jobparams['owner']) {
            res.status(404).json({success: false, msg: 'Nasty parameters will not pass'});
            return;
        }

        if (req.body.jobparams['status']) {
            res.status(404).json({success: false, msg: 'Nope'});
            return;
        }

        if (req.body.jobparams['date_created']) {
            res.status(404).json({success: false, msg: 'Nope'});
            return;
        }
    }

    var jobObj = {
        jobtype: req.body.jobtype,
        date_created: Date.now(),
        status: 'new',
        owner_id: req.user.id,
        steps: []
    };

    extend(jobObj, req.body.jobparams);

    if (jobObj.jobtype === 'dna_reseq') {
        var job_obj = new dna_reseq_job(jobObj);
        job_obj.create_steps();
    }

    models.sequelize.transaction(function (t) {
        return models.Job.create(
                jobObj,
                {
                    include:
                            [
                                {
                                    model: models.Step,
                                    as: 'steps'
                                },
                                {
                                    model: models.File,
                                    as: 'files',
                                    through: {
                                        attributes: ['filenum', 'filetype']
                                    }
                                }
                            ],
                    transaction: t
                })
                .then(function (job) {
                    job.work_dir = config.storage_root + path.sep + 'jobs' + path.sep + job.id;
                    return job.save({transaction: t})
                            .then(function (job) {

                                if (req.body.jobfiles) {
                                    var promises = models.Sequelize.Promise.map(req.body.jobfiles, function (jobfile) {
                                        return models.File.findOne({where: {id: jobfile.fileid}, transaction: t})
                                                .then(function (file) {
                                                    if (!file) {
                                                        throw new Error('unknown fileid ' + jobfile.fileid + ' passed. Rolling back');
                                                    }

                                                    return job.addFile(file, {filenum: jobfile.filenum, filetype: 'input', transaction: t});
                                                });
                                    });

                                    return models.Sequelize.Promise.all(promises)
                                            .then(function (all_res) {
                                                return models.Job.findOne({
                                                    where: {id: job.id},
                                                    include: [
                                                        {
                                                            model: models.File,
                                                            as: 'files',
                                                            through: {
                                                                attributes: ['filenum', 'filetype']
                                                            }
                                                        },
                                                        {
                                                            model: models.Step,
                                                            as: 'steps'
                                                        }],
                                                    transaction: t
                                                })
                                                        .then(function (job_ret) {
                                                            job_ret.files.sort(function (a, b) {
                                                                return a.JobFile.filenum - b.JobFile.filenum;
                                                            });

                                                            return job_ret;
                                                        });
                                            });

                                } else {
                                    job.files = [];

                                    return job;
                                }
                            });
                });

    })
            .then(function (job) {
                res.status(200).json({success: true, msg: 'Successfuly created new job', job: job});
            })
            .catch(function (err) {
                console.error('job_create: ' + err);
                res.status(500).json({success: false, msg: 'Failed to create job: ' + err});
            });

}

var dna_reseq_job = function (job) {
    var self = this;

    self.job_model = job;

    self.output_files = ['1_fastqc.html', '2_fastqc.html', 'result.sam'];

    this.upload_input = function () {
        return q.all(
                [
                    copy_file(self.job_model.files[0].phys_path, self.job_model.id, '1.fastq'),
                    copy_file(self.job_model.files[1].phys_path, self.job_model.id, '2.fastq')
                ])
    }

    this.download_result = function (options) {
        var defer = q.defer();

        if (!options) {
            options = {};
        }

        var download_promises = [];
        
        var download_file = function(out_file) {
            var prm = q.defer();
            var start_time = Date.now();
            var url = config.file_agent_url + '/' + self.job_model.id + '/' + out_file;
            var file_path = self.job_model.work_dir + path.sep + out_file;
            var file = fs.createWriteStream(file_path);
            var req = http.get(url, function (response) {
                if (response.statusCode < 200 || response.statusCode > 299) { // (I don't know if the 3xx responses come here, if so you'll want to handle them appropriately
                    prm.reject(response.statusCode);
                } else {
                    response.pipe(file);
                    file.on('finish', function () {
                        file.close(function () {
                            end_time = Date.now();
                            prm.resolve({path: file_path, name: out_file, filesize: file.bytesWritten, start_time: start_time, end_time: end_time});
                        });  // close() is async, call cb after close completes.
                    });
                    
                    file.on('error', function (err) { // Handle errors
                        //fs.unlink(file_path); // Delete the file async. (But we don't check the result)
                        prm.reject(err);
                    });
                }
            });
            
            req.on('error', function(err) {
                prm.reject(err);
            });
            
            return prm.promise;
        }

        for (var i in self.output_files) {
            download_promises.push(download_file(self.output_files[i]));
        }

        q.all(download_promises)
                .then(function (files) {
                    var inner_prm = [];
                    var t = null;
                    var trn_prm = null;

                    var save_files = function (t) {
                        for (var i in files) {
                            inner_prm.push(
                                    file_api.file_create(
                                            {
                                                owner_id: self.job_model.owner_id,
                                                name: util.format('job_%d_%s',self.job_model.id,files[i].name),
                                                path: files[i].path,
                                                start_time: files[i].start_time,
                                                end_time: files[i].end_time,
                                                filesize: files[i].filesize,
                                                status: 'ok',
                                                transaction: t
                                            })
                                    .then(function (file) {
                                        return self.job_model.addFile(file.id, {filenum: file.id, filetype: 'output', transaction: t});
                                    })
                                    );
                        }

                        return q.all(inner_prm);

                    }

                    if (!options.transaction) {
                        trn_prm = models.sequelize.transaction(save_files);
                    } else {
                        trn_prm = save_files(t);
                    }

                    trn_prm.then(function (res) {
                        defer.resolve(res);
                    })
                            .catch(function (err) {
                                console.error(err);
                                defer.reject(err);
                            });
                })
                .catch(function (err) {
                    console.error(err);
                    defer.reject(err);
                });

        return defer.promise;
    }

    this.create_steps = function () {
        self.job_model.steps = [{
                command: '/ngs/fastqc /work/1.fastq /work/2.fastq',
                cpu: 1,
                memory: 1024,
                status: 'new',
                order: 1
            },
            {
                command: '/ngs/bwa mem -t 2 /ngs_lib/chr1/chr1.fa /work/1.fastq /work/2.fastq > /work/result.sam',
                cpu: 2,
                memory: 2048,
                status: 'new',
                order: 2
            },
        ];
    }
};

var job_dna_reseq_create_steps = function (job) {

}

/*
 * Set files
 */

var job_update = function (req, res) {
    if (!req.user) {
        res.status(403).json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.params.id) {
        res.status(404).json({success: false, msg: 'Not job id specified'});
        return;
    }

    if (!req.body.jobfile) {
        res.status(500).json({success: false, msg: 'File update need to be specified'});
        return;
    }

    var jobfile = req.body.jobfile;

    models.sequelize.transaction(function (t) {
        return models.Job.findOne({
            where: {id: req.params.id, owner_id: req.user.id},
            include: [
                {
                    model: models.File,
                    as: 'files',
                    through: {
                        attributes: ['filenum', 'filetype']
                    }
                }]
        })
                .then(function (job) {
                    for (var i in job.files) {
                        if (job.files[i].JobFile.filenum === jobfile.filenum) {
                            return job.removeFile(job.files[i], {transaction: t})
                                    .then(function (newjob) {
                                        return job.addFile(jobfile.fileid, {filenum: jobfile.filenum, filetype: 'input', transaction: t});
                                    });
                        }
                    }

                    //if not found
                    return job.addFile(jobfile.fileid, {filenum: jobfile.filenum, filetype: 'input', transaction: t});
                });
    })
            .then(function (tr_res) {
                res.status(200).json({success: true, msg: 'ok'});
            })
            .catch(function (err) {
                console.error('job_update: ' + err);
                res.status(500).json({success: false, msg: 'Internal error'});
            });
}

var job_select_or_create = function (req, res) {
    if (!req.user) {
        res.status(403).json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.body.jobtype) {
        res.status(404).json({success: false, msg: 'Not job type specified'});
        return;
    }

    var queryparams = {owner_id: req.user.id, jobtype: req.body.jobtype, status: 'new'};

    if (req.body.jobparams) {
        if (req.body.jobparams['jobtype']) {
            res.json({success: false, msg: 'Do not even try to'});
            return;
        }

        if (req.body.jobparams['owner_id']) {
            res.json({success: false, msg: 'Nasty parameters will not pass'});
            return;
        }

        if (req.body.jobparams['status']) {
            res.json({success: false, msg: 'Nope'});
            return;
        }
    }


    extend(queryparams, req.body.jobparams);

    models.Job.findOne({
        where: queryparams,
        include: [
            {
                model: models.File,
                as: 'files',
                through: {
                    attributes: ['filenum', 'filetype']
                }
            }]
    })
            .then(function (job) {
                if (job) {
                    res.status(200).json({success: true, msg: 'Returning orphaned job. Abandoning your jobs is bad for society. And hurts your karma too', job: job});
                } else {
                    job_create(req, res);
                }
            })
            .catch(function (err) {
                console.error('job_create_or_update: ' + err);
                res.status(500).json({success: true, msg: 'Database error'});
            });
}

var job_submit_step = function (job, stepnum, t) {
    var step = job.steps[stepnum];
    var defer = q.defer();

    var job_path = job.work_dir;

    var sing_id = job.id + '_' + stepnum + '_' + Date.now();
    
    

    //create a request
    request.post({
        url: config.singularity.api_url + '/api/requests',
        body: {
            id: sing_id,
            requestType: 'RUN_ONCE',
            owners: ['none']
        },
        json: true
    }, function (error, response, body) {

        if (!(!error && response.statusCode >= 200 && response.statusCode < 300)) {
            console.error('failed to create request: ' + response);
            return defer.reject({msg: 'Failed to create singularity request'});
        } else {
            
            console.log(util.format('deploying job %d_%d',job.id,stepnum));

            var req_deploy = {
                deploy: {
                    requestId: sing_id,
                    command: '/bin/sh',
                    arguments: ['-c', util.format('%s', step.command)],
                    id: sing_id,
                    containerInfo: {
                        type: "DOCKER",
                        docker: {
                            image: "schikin/ngs:latest"
                        },
                        volumes: [
                            {
                                hostPath: util.format(config.singularity.work_dir_format, job.id),
                                containerPath: '/work',
                                mode: 'RW'
                            },                            
                            {
                                hostPath: config.singularity.ngs_lib_host,
                                containerPath: '/ngs_lib',
                                mode: 'RO'
                            }                        
                        ]                        
                        
                    },
                    resources: {
                        cpus: step.cpu,
                        memoryMb: step.memory,
                        numPorts: 0
                    }
                }
            };

            request.post({
                url: config.singularity.api_url + '/api/deploys',
                body: req_deploy,
                json: true
            },
                    function (error, response, body) {
                        var err1;

                        if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                            //console.log('successfully posted job to singularity');
                            //console.log(step);
                            step.taskid = sing_id;

                            step.status = 'submitted';
                            job.status = 'submitted';

                            err1 = false;
                        } else {
                            step.status = 'failed';
                            job.status = 'failed';
                            console.error('could not post to singularity');
                            console.error(response.body);

                            err1 = true;
                        }

                        //TODO: fire socket.IO update
                        return job.save({transaction: t}).then(function () {
                            return step.save({transaction: t}).then(function () {
                                if (err1) {
                                    return defer.resolve({msg: 'Failed to submit job', err: true});
                                } else {
                                    return defer.resolve({msg: 'Successfuly submitted new job', err: false});
                                }
                            })
                        })
                                .catch(function () {
                                    return defer.reject({msg: 'Failed to save job submission status'});
                                });

                    });
        }
    });

    return defer.promise;
}

var job_list = function (req, res) {
    if (!req.user) {
        res.status(403).json({success: false, msg: 'Unauthenticated'});
        return;
    }

    models.Job.findAll({
        where: {owner_id: req.user.id},
        include: [
            {
                model: models.File,
                as: 'files',
                through: {
                    attributes: ['filenum', 'filetype']
                }
            },
            {
                model: models.Step,
                as: 'steps'
            }],
        order: ['files', 'filenum']

    })
            .then(function (jobs) {
                return res.status(200).json({success: true, jobs: jobs});
            })
            .catch(function (err) {
                console.error('job_list: ' + err);
                return res.status(500).json({success: true, msg: 'Database failed'});
            });
}

var job_get = function (req, res) {
    if (!req.user) {
        res.status(403).json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.params.id) {
        res.status(404).json({success: false, msg: 'No jobid specified'});
        return;
    }

    models.Job.findOne({
        where: {id: req.params.id, owner_id: req.user.id},
        include: [
            {
                model: models.File,
                as: 'files',
                through: {
                    attributes: ['filenum', 'filetype']
                }
            },
            {
                model: models.Step,
                as: 'steps'
            }],
        order: ['files', 'filenum']

    })
            .then(function (job) {
                return res.status(200).json({success: true, job: job});
            })
            .catch(function (err) {
                return res.status(500).json({success: true, msg: 'Database failed'});
            });
}

function copy_file(source, jobid, target) {
    var defer = q.defer();

    var url = config.file_agent_url;

    var req = request.post(url, function (err, resp, body) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve();
        }
    });
    var form = req.form();

    form.append('filedata', fs.createReadStream(source));
    form.append('filename', target);
    form.append('jobid', jobid);

    return defer.promise;
}

var job_submit = function (req, res, next) {
    if (!req.params.id) {
        res.json({success: false, msg: 'No jobid specified'});
    } else {

        models.sequelize.transaction(function (t) {
            return models.Job.findById(req.params.id, {
                include: [
                    {model: models.Step,
                        as: 'steps'},
                    {model: models.File,
                        as: 'files'}
                ], transaction: t})
                    .then(function (job) {

                        var defer = q.defer();

                        mkdirp(job.work_dir, function (err) {
                            if (err) {
                                job.status = 'failed';
                                return job.save({transaction: t})
                                        .then(function (file) {
                                            res.status(500).json({success: false, msg: 'Failed to create storage'});
                                            defer.resolve(file);
                                        })
                                        .catch(function (err) {
                                            defer.reject(err);
                                        });
                            } else {
                                /* TODO: rewrite this ugly hardcode to use one class for every jobtype */
                                if (job.jobtype === 'dna_reseq') {
                                    if (job.files.length !== 2) {
                                        job.status = 'failed';
                                        console.error('job_submit: wrong number of arguments');
                                        return job.save({transaction: t})
                                                .then(function (file) {
                                                    res.status(500).json({success: false, msg: 'This job needs 2 input files'});
                                                    defer.resolve(file);
                                                })
                                                .catch(function (err) {
                                                    defer.reject(err);
                                                });
                                    }

                                    var job_hardcode = new dna_reseq_job(job);

                                    job_hardcode.upload_input()
                                            .then(function (copy_res) {
                                                io.to("job_"+job.id).emit("job_file_submit","finished");
                                                job_really_submit(job, req, res, next, defer, t);
                                            })
                                            .catch(function (err) {
                                                job.status = 'failed';
                                                return job.save({transaction: t})
                                                        .then(function (file) {
                                                            defer.resolve(file);
                                                            res.status(500).json({success: false, msg: 'Failed to prepare job for execution'});
                                                        })
                                                        .catch(function (err) {
                                                            defer.reject(err);
                                                        });
                                            })
                                } else {
                                    defer.reject('unknown jobtype');
                                }
                            }

                        });

                        return defer.promise;
                    });
        }
        )
                .catch(function (err) {
                    res.status(500).json({success: false, msg: 'Internal error'});
                    console.error('job_submit: ' + err);
                }

                );
    }
}

/* Really do Singularity/Mesos magic here
 * Warning: this function does not call next() thus leaving the request in queue until result got from Singularity
 */
var job_really_submit = function (job, req, res, next, defer, t) {
    job_submit_step(job, 0, t).then(
            function (ret) {
                if (!ret.err) {
                    io.to("job_"+job.id).emit("job_update",job);
                    res.status(200).json({success: true, msg: ret.msg, job: ret.job});
                } else {
                    res.status(500).json({success: false, msg: ret.msg});
                }

                defer.resolve();
            }
    ).catch(function (ret) {
        res.status(500).json({success: false, msg: ret.msg});
        defer.reject(ret.msg);
    });
}

/* Register with Singularity
 * 
 */
var sing_bind = function () {
    var sing_hookid = '';

    request.post({
        url: config.singularity.api_url + '/api/webhooks',
        body: {
            type: 'TASK',
            uri: config.singularity.my_url + '/api/job/hook'
        },
        json: true
    },
            function (error, response, body) {
                if (!error && response.statusCode >= 200 && response.statusCode < 300) {
                    //console.log('successfully hooked to singularity'); // Show the HTML for the Google homepage. 
                    //sing_hookid = response.body;
                    //console.log('hookid: ' + sing_hookid);

                    //process.on('')
                } else {
                    console.error('could not attach to singularity cluster. execution will not be possible');
                    console.error(error);
                    console.error(response);
                }

            });
}

/* This hook is called by Singularity to report back on deploy status
 * 
 */
var sing_hook = function (req, res) {
    //console.log('job update from singularity');
    if (!req.body.task) {
        //console.log('deploy singularity junk - skipping, we only care about tasks');
        res.status(200).send('ok, got it');
    } else {
        //console.log(req.body);        
        var state = req.body.taskUpdate.taskState;
        var taskid = req.body.taskUpdate.taskId.deployId;

        var i1 = taskid.indexOf('_');
        var i2 = taskid.indexOf('_', i1 + 1);

        var jobid = parseInt(taskid.substring(0, i1));
        var stepid = parseInt(taskid.substring(i1 + 1, i2));

        console.log('TASK ' + taskid + ' status change to ' + state);

        models.sequelize.transaction(function (t) {
            return models.Job.findOne(
                    {
                        where: {id: jobid},
                        transaction: t,
                        include: [
                            {
                                model: models.Step,
                                as: 'steps'
                            }
                        ],
                        order: ['steps', 'order']})
                    .then(function (job) {

                        if (!job) {
                            return 'job not found, but its ok';
                        }

                        if (!job.steps) {
                            return 'job not found, but its ok';
                        }

                        if (!job.steps[stepid]) {
                            return 'job not found, but its ok';
                        }

                        var cstate = job.steps[stepid].status;

                        var step = job.steps[stepid];

                        if (state === 'TASK_LAUNCHED') {
                            switch (cstate) {
                                case 'submitted':
                                    job.steps[stepid].status = 'started';
                                    break;
                                default:
                                    //console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
                                    break;
                            }
                        }

                        if (state === 'TASK_RUNNING') {
                            switch (cstate) {
                                case 'submitted':
                                case 'started':
                                    job.steps[stepid].status = 'running';
                                    break;
                                default:
                                    //console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
                                    break;
                            }
                        }

                        if (state === 'TASK_FINISHED') {
                            switch (cstate) {
                                case 'submitted':
                                case 'started':
                                case 'running':
                                    job.steps[stepid].status = 'finished';
                                    break;
                                default:
                                    //console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
                                    break;
                            }
                        }

                        if (state === 'TASK_FAILED') {
                            switch (cstate) {
                                case 'submitted':
                                case 'started':
                                case 'running':
                                    job.steps[stepid].status = 'failed';
                                    break;
                                default:
                                    //console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
                                    break;
                            }
                        }

                        return step.save({transaction: t}).then(function () {
                            //TODO: this does not respect transactional logic. if transaction rolls back - the client will still think that step was updated
                            io.to("job_"+job.id).emit("step_update",step);

                            var prm;

                            if (job.steps.length > stepid + 1) {
                                if (step.status === 'failed') {
                                    job.status = 'failed';
                                    prm = job.save({transaction: t});
                                } else if (step.status === 'finished') {
                                    prm = job_submit_step(job, stepid + 1, t);
                                } else {
                                    var defer = q.defer();
                                    defer.resolve();
                                    prm = defer.promise;
                                }
                            } else {
                                if (step.status === 'failed') {
                                    job.status = 'failed';
                                    prm = job.save({transaction: t});
                                } else if (step.status === 'finished') {

                                    /* download results before completing */
                                    var job_obj = new dna_reseq_job(job);

                                    prm = job_obj.download_result({transaction: t})
                                            .then(function (res) {
                                                console.log(res);
                                                job.status = 'finished';
                                                return job.save({transaction: t});
                                            })
                                            .catch(function (err) {
                                                console.error('sing_hook (download result): ' + err);
                                                job.status = 'failed';
                                                return job.save({transaction: t});
                                            })
                                } else {
                                    var defer = q.defer();
                                    defer.resolve();
                                    prm = defer.promise;
                                }
                            }
                            
                            io.to("job_"+job.id).emit("job_update",job);

                            return prm;
                        });
                    });
        })
                .then(function (result) {
                    res.status(200).send('ok, got it');
                })
                .catch(function (err) {
                    console.error("sing_hook: " + err);
                    res.status(500).send('processing error');
                });
    }
}

var http_bind_function = function (router) {
    /* TODO: insert auth middleware */
    router.post('/job', job_create);
    router.get('/job/:id', job_get);
    router.get('/job', job_list);
    router.put('/job/:id', job_update);
    router.post('/job/create_or_update', job_select_or_create);
    //router.delete('/job/delete/{id}', job_delete);
    router.put('/job/submit/:id', job_submit);
    //router.post('/job/submit_file/:id/:filenum', job_submit_file);
    router.use('/job/hook', sing_hook);
    sing_bind();
};

var io_bind_function = function(socket){
    socket.on('subscribe_job_request', function(jobid){
        console.log('subscribe request: '+jobid)
       models.Job.findOne({
        where: {id: jobid}})
                .then(function(job){
                    if(!job){
                        return socket.emit('subscribe_job_response',{success: false, jobid: jobid, message: 'no job found'});                        
                    }
                    
                    if(job.owner_id!==socket.request.session.passport.user){
                        return socket.emit('subscribe_job_response',{success: false, jobid: jobid, message: 'access denied'});
                    }
                    
                    socket.join(util.format('job_%d',jobid),function(err){
                        if(err){
                            return socket.emit('subscribe_job_response',{success: false, jobid: jobid, message: err});
                        }
                        else {
                            return socket.emit('subscribe_job_response', {success: true, jobid: jobid});
                        }                        
                    });
        })
    });
    
    socket.on('unsubscribe_job_request', function(jobid){
       models.Job.findOne({
        where: {id: jobid}})
                .then(function(job){
                    if(!job){
                        return socket.emit('unsubscribe_job_response',{success: false, jobid: jobid, message: 'no job found'});                        
                    }
                    
                    if(job.owner_id!==socket.request.session.passport.user){
                        return socket.emit('unsubscribe_job_response',{success: false, jobid: jobid, message: 'access denied'});
                    }
                    
                    socket.leave(util.format('job_%d',jobid),function(err){
                        if(err){
                            return socket.emit('unsubscribe_job_response',{success: false, jobid: jobid, message: err});
                        }
                        else {
                            return socket.emit('unsubscribe_job_response', {success: true, jobid: jobid});
                        }                        
                    });
        })
    });
}

module.exports = {
    bind: http_bind_function,
    io_bind: io_bind_function
};
