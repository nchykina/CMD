var Job = require('../models/job').model;
var JobFile = require('../models/jobfile').model;
var cfg = require('../config/config');
var path = require('path');
var fs = require('fs');

var request = require('request');
var singularity = require('../config/singularity');

var extend = require('node.extend'); //merge JavaScript objects 
var mkdirp = require('mkdirp'); //ensure dir exists

var q = require('q'); //Q promise framework

var multer = require('multer'); //file uploading middleware

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, req.upload_folder);
    },
    filename: function (req, file, cb) {
        cb(null, req.upload_file);
    }

});

var upload = multer({storage: storage}).single('data');

var job_create = function (req, res) {
    if (!req.user) {
        res.json({success: false, msg: 'Unauthenticated'});
        return;
    }

    if (!req.body.jobtype) {
        res.json({success: false, msg: 'Not job type specified'});
        return;
    }

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

        if (req.body.jobparams['date_created']) {
            res.json({success: false, msg: 'Nope'});
            return;
        }
    }

    var jobObj = {
        jobtype: req.body.jobtype,
        date_created: Date.now(),
        status: 'new',
        owner: req.user.id,
        steps: []
    };

    extend(jobObj, req.body.jobparams);

    if (jobObj.jobtype === 'dna_reseq') {
        job_dna_reseq_create_steps(jobObj);
    }

    var newJob = new Job(jobObj);

    newJob.save(function (err) {
        if (err) {
            res.json({success: false, msg: 'Failed to create job'});
            console.log(err);
        } else {
            res.json({success: true, msg: 'Successfuly created new job', job: newJob});
        }
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

    Job.findOne(queryparams, function (err, job) {
        if (err) {
            res.json({success: false, msg: 'Lookup error'});
        } else if (!job) {
            job_create(req, res);
        } else {
            res.json({success: true, msg: 'Returning orphaned job. Abandoning your jobs is bad for society. And hurts your karma too', job: job});
        }
    });


}

var job_update = function (job) {
    var defer = q.defer();

    Job.findById(job._id,
            function (err, dbjob) {
                if (err) {
                    console.error(err);
                    defer.reject('db error: ' + err);
                } else {                    
                    extend(dbjob,job);
                    
                    dbjob.save(function (err) {
                        if (err) {
                            console.error(err);
                            defer.reject('db error: ' + err);
                        } else {
                            defer.resolve();
                        }
                    });
                }
            });    
    return defer.promise;
}

var job_submit_step = function (job, stepnum) {
    var step = job.steps[stepnum];
    var defer = q.defer();

    var job_path = cfg.storage_path + path.sep + job._id;

    var sing_id = job._id + '_' +stepnum +'_' + Date.now();

    //create a request
    request.post({
        url: singularity.singularity_api + '/api/requests',
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
                url: singularity.singularity_api + '/api/deploys',
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

                        if (err1) {
                            return defer.reject({msg: 'Failed to submit job'});
                        }
                        //TODO: fire socket.IO update
                        job_update(job).then(function () {
                            return defer.resolve({msg: 'Successfuly submitted new job', job: job});
                        })
                                .catch(function () {
                                    return defer.reject({msg:'Failed to save job submission status'});
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



    Job.findById(req.params.id, function (err, job) {
        if (err) {
            res.json({success: false, msg: 'Lookup error'});
            return;
        } else if (!job) {
            res.json({success: false, msg: 'Job not found'});
            return;
        }

        res.json({success: true, job: job});

    });
}

var job_submit = function (req, res, next) {
    if (!req.params.id) {
        res.json({success: false, msg: 'No jobid specified'});
    } else {

        Job.findById(req.params.id, function (err, job) {
            if (err) {
                res.json({success: false, msg: 'Lookup error'});
                return;
            } else {
                job_really_submit(job, req, res, next);
            }
        });
    }
}

/* Really do Singularity/Mesos magic here
 * Warning: this function does not call next() thus leaving the request in queue until result got from Singularity
 */
var job_really_submit = function (job, req, res, next) {
    job_submit_step(job, 0).then(
            function (ret) {
                res.json({success: true, msg: ret.msg, job: ret.job});
            }
    ).catch(function (ret) {
        res.json({success: false, msg: ret.msg});
    });
}

/* Register with Singularity
 * 
 */
var sing_bind = function () {
    var sing_hookid = '';

    request.post({
        url: singularity.singularity_api + '/api/webhooks',
        body: {
            type: 'TASK',
            uri: singularity.my_addr + '/api/job/hook'
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
    } else {
        //console.log(req.body);        
        var state = req.body.taskUpdate.taskState;
        var taskid = req.body.taskUpdate.taskId.deployId;
        
        var i1 = taskid.indexOf('_');
        var i2 = taskid.indexOf('_',i1+1);
                
        var jobid = taskid.substring(0,i1);
        var stepid = taskid.substring(i1+1,i2);
                
        console.log('TASK ' + taskid);
        console.log('status change to ' + state);
        
        Job.findById(jobid, function(err, job){
           if(err){
               console.error('task status database update failed - could not select: '+err);
               res.status(500).send('we\'ve got problems here. retry later please');
           } 
           else {
               var cstate = job.steps[stepid].status;
               
               if(state === 'TASK_LAUNCHED'){
                   switch(cstate){
                       case 'submitted':
                         job.steps[stepid].status = 'started';
                         break;
                     default:
                         console.log('skipping wrong task status update order - current status: '+cstate+' new status: '+state);
                         break;
                   }                         
               }
               
               if(state === 'TASK_RUNNING'){
                   switch(cstate){
                       case 'submitted':
                       case 'started':
                         job.steps[stepid].status = 'running';
                         break;
                     default:
                         console.log('skipping wrong task status update order - current status: '+cstate+' new status: '+state);
                         break;
                   }                         
               }
               
               if(state === 'TASK_FINISHED'){
                   switch(cstate){
                       case 'submitted':
                       case 'started':
                       case 'running':
                         job.steps[stepid].status = 'finished';
                         break;
                     default:
                         console.log('skipping wrong task status update order - current status: '+cstate+' new status: '+state);
                         break;
                   }                         
               }
               
               if(state === 'TASK_FAILED'){
                   switch(cstate){
                       case 'submitted':
                       case 'started':
                       case 'running':
                         job.steps[stepid].status = 'failed';
                         break;
                     default:
                         console.log('skipping wrong task status update order - current status: '+cstate+' new status: '+state);
                         break;
                   }                         
               }
               
               job.save(function(err){
                   if(err){
                       console.error('task status database update failed - could not save: '+err);
                       res.status(500).send('we\'ve got problems here. retry later please');
                   }
               })
           }
        });
    }

    res.status(200).send('ok, got it');
}

var job_submit_file = function (req, res, next) {

    if (!req.params.id) {
        res.json({success: false, msg: 'No jobid specified'});
        return;
    }

    if (!req.params.filenum) {
        res.json({success: false, msg: 'No filenum specified'});
        return;
    }

    Job.findById(req.params.id, function (err, job) {
        if (err) {
            res.json({success: false, msg: 'Job lookup error'});
        } else if (!job) {
            res.json({success: false, msg: 'Job not found'});
        } else if (job.status !== 'new') {
            res.json({success: false, msg: 'Job cannot be changed after submission'});
        } else {
            var jobFile = {};

            var uploadErrHandler = function (err) {
                if (err) {
                    console.log(err);
                    res.json({success: false, msg: 'Error during upload'});
                    return;
                }

                jobFile.upload_ended = Date.now();

                //update jobFile parameters;
                fs.stat(jobFile.store_path, function (err, stats) {
                    if (err) {
                        res.json({success: false, msg: 'Internal error: fs.stat'});
                        return;
                    } else {
                        jobFile.filesize = stats.size;
                        var jf = new JobFile(jobFile);
                        job.filesIn[req.params.filenum] = jf;

                        job.save(function (err) {

                            if (err) {
                                console.log(err);
                                res.json({success: false, msg: 'Job update failed'});
                                return;
                            } else {
                                res.json({success: true, msg: 'File uploaded', file_entry: jf});
                            }
                        });
                    }
                });
            };

            var parseJobFile = function (req, jobFile) {
                var str = jobFile.store_path;
                var i1 = str.lastIndexOf(path.sep);
                req.upload_folder = str.substring(0, i1);
                req.upload_file = str.substring(i1 + 1, str.length);

                mkdirp(req.upload_folder, function (err) {
                    if (err) {
                        res.json({success: false, msg: 'Failed to create storage'});
                        return;
                    } else {
                        jobFile.upload_started = Date.now();
                        upload(req, res, uploadErrHandler);
                    }
                });
            }

            jobFile = {
                store_path: cfg.storage_root + path.sep + job._id + path.sep + req.params.filenum
            };

            /* jobFile.save(function (err) {
             if (err) {
             res.json({success: false, msg: 'Failed to create file db entry'});
             return;
             } else { */
            parseJobFile(req, jobFile);
            /*}
             }); */
        }

    });
}


var bindFunction = function (router) {
    /* TODO: insert auth middleware */
    router.post('/job/create', job_create);
    router.post('/job/create_or_update', job_create_or_update);
    router.get('/job/get/:id', job_get);
    //router.put('/job/update/{id}', job_update);
    //router.delete('/job/delete/{id}', job_delete);
    router.put('/job/submit/:id', job_submit);
    router.post('/job/submit_file/:id/:filenum', job_submit_file);
    router.use('/job/hook', sing_hook);
    sing_bind();
};

module.exports = {
    bind: bindFunction
};
