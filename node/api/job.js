var Job = require('../models/job').model;
var JobFile = require('../models/jobfile').model;
var cfg = require('../config/config');
var path = require('path');
var fs = require('fs');

var extend = require('node.extend'); //merge JavaScript objects 
var mkdirp = require('mkdirp'); //ensure dir exists

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
        owner: req.user.id
    };

    extend(jobObj, req.body.jobparams);

    var newJob = new Job(jobObj);

    newJob.save(function (err) {
        if (err) {
            return res.json({success: false, msg: 'Failed to create job (error)'});
        } else {
            res.json({success: true, msg: 'Successfuly created new job', job: newJob});
        }
    });
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


var job_submit = function (req, res) {
    if (!req.params.id) {
        res.json({success: false, msg: 'No jobid specified'});
    } else {

        Job.findById(req.params.id, function (err, job) {
            if (err) {
                res.json({success: false, msg: 'Lookup error'});
                return;
            } else {
                job_really_submit(job,
                        function () {
                            res.json({success: true, msg: 'Job submitted'});
                        },
                        function () {
                            res.json({success: false, msg: 'Job failed to submit'});
                        }
                );
            }
        });
    }
}

/* Really do Chronos/Mesos magic here
 * 
 */
var job_really_submit = function (job, ok_cb, err_cb) {

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
    router.get('/job/get/{id}', job_get);
    //router.put('/job/update/{id}', job_update);
    //router.delete('/job/delete/{id}', job_delete);
    router.put('/job/submit/{id}', job_submit);
    router.post('/job/submit_file/:id/:filenum', job_submit_file);
};

module.exports = {
    bind: bindFunction
};
