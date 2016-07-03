//var cfg = require('../config/config');
var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var models = require('../models');

var mkdirp = require('mkdirp'); //ensure dir exists
var path = require('path');
var fs = require('fs');

var request = require('request');

var extend = require('node.extend'); //merge JavaScript objects 

var q = require('q'); //Q promise framework

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
        job_dna_reseq_create_steps(jobObj);
    }

    models.Job.create(
            jobObj,
            {
                include:
                        [{model: models.Step,
                                as: 'steps'}]
            })
            .then(function (job) {
                res.status(200).json({success: true, msg: 'Successfuly created new job', job: job});
            })
            .catch(function (err) {
                console.error('job_create: ' + err);
                res.status(500).json({success: false, msg: 'Failed to create job'});
            });
}

var job_dna_reseq_create_steps = function (job) {
    job.steps[0] = {
        command: 'sleep 120',
        arguments: ['120'],
        cpu: 1,
        memory: 1024,
        status: 'new',
        singularity_deploy_id: ''
    }
}

var job_create_or_update = function (req, res) {
    if (!req.user) {
        res.json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.body.jobtype) {
        res.json({success: false, msg: 'Not job type specified'});
        return;
    }

    var queryparams = {owner: req.user.id, jobtype: req.body.jobtype, status: 'new'};

    if (req.body.jobparams) {
        if (req.body.jobparams['jobtype']) {
            res.json({success: false, msg: 'Do not even try to'});
            return;
        }

        if (req.body.jobparams['owner']) {
            res.json({success: false, msg: 'Nasty parameters will not pass'});
            return;
        }

        if (req.body.jobparams['status']) {
            res.json({success: false, msg: 'Nope'});
            return;
        }
    }


    extend(queryparams, req.body.jobparams);

    models.Job.findOne(queryparams)
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

var job_update = function (job) {
    return job.save();
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
            console.error('failed to create request: ' + response.body.message);
            return defer.reject({msg: 'Failed to create singularity request'});
        } else {
            //console.log(response.statusCode + " - " + response.body);

            var req_deploy = {
                deploy: {
                    requestId: sing_id,
                    command: step.command,
                    arguments: step.arguments,
                    id: sing_id,
                    containerInfo: {
                        type: "DOCKER",
                        docker: {
                            image: "schikin/ngs:latest"
                        },
                        volumes: [
                            {
                                hostPath: job_path,
                                containerPath: '/work',
                                mode: 'RW'
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
                            console.log('successfully posted job to singularity');
                            console.log(step);
                            if (response.activeDeploy) {
                                step.singularity_deploy_id = response.activeDeploy.id;
                            } else if (response.pendingDeploy) {
                                step.singularity_deploy_id = response.pendingDeploy.id;
                            }

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

var job_get = function (req, res) {
    if (!req.user) {
        res.json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.params.id) {
        res.json({success: false, msg: 'No jobid specified'});
        return;
    }



    models.Job.findById(req.params.id)
            .then(function (job) {
                return res.json({success: true, job: job});
            })
            .catch(function (err) {
                return res.json({success: true, msg: 'Lookup failed'});
            });
}

function copy_file(source, target) {
    var defer = q.defer();

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        q.reject(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        q.reject(err);
    });
    wr.on("close", function (ex) {
        q.resolve();
    });
    rd.pipe(wr);

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

                        job.work_folder = config.storage_root + path.sep + 'jobs' + path.sep + job.id;

                        mkdirp(job.work_folder, function (err) {
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

                                    q.allSettled(
                                            [copy_file(job.files[0].phys_path, job.work_dir + path.sep + '1.fastq'),
                                                copy_file(job.files[1].phys_path, job.work_dir + path.sep + '2.fastq')])
                                            .then(function (copy_res) {
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
                if(!ret.err) {
                    res.status(200).json({success: true, msg: ret.msg, job: ret.job});
                }
                else {
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
                    console.log('successfully hooked to singularity'); // Show the HTML for the Google homepage. 
                    sing_hookid = response.body;
                    console.log('hookid: ' + sing_hookid);

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

        var jobid = taskid.substring(0, i1);
        var stepid = taskid.substring(i1 + 1, i2);

        console.log('TASK ' + taskid);
        console.log('status change to ' + state);

        models.sequelize.transaction(function (t) {
            return models.Job.findById(jobid,
                    {transaction: t,
                        include: [
                            {
                                model: models.Step,
                                as: 'steps'
                            }
                        ]}).then(function (job) {
                var cstate = job.steps[stepid].status;

                if (state === 'TASK_LAUNCHED') {
                    switch (cstate) {
                        case 'submitted':
                            job.steps[stepid].status = 'started';
                            break;
                        default:
                            console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
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
                            console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
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
                            console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
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
                            console.log('skipping wrong task status update order - current status: ' + cstate + ' new status: ' + state);
                            break;
                    }
                }

                return job.save();

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

var bindFunction = function (router) {
    /* TODO: insert auth middleware */
    router.post('/job/create', job_create);
    router.post('/job/create_or_update', job_create_or_update);
    router.get('/job/get/:id', job_get);
    //router.put('/job/update/{id}', job_update);
    //router.delete('/job/delete/{id}', job_delete);
    router.put('/job/submit/:id', job_submit);
    //router.post('/job/submit_file/:id/:filenum', job_submit_file);
    router.use('/job/hook', sing_hook);
    sing_bind();
};

module.exports = {
    bind: bindFunction
};
