/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var mkdirp = require('mkdirp'); //ensure dir exists
var multer = require('multer'); //file uploading middleware
var path = require('path');
var fs = require('fs');

var env = process.env.NODE_ENV || 'development';
var config = require(__dirname + '/../config/config.json')[env];
var models = require('../models');

var file_submit = function (req, res) {

    if (!req.user.id) {
        res.status(403).json({success: false, msg: 'Unauthorized'});
        return;
    }

    if (!req.params.id) {
        res.status(404).json({success: false, msg: 'No fileid specified'});
        return;
    }
    
    var file_path = "";

    models.sequelize.transaction(function (t) {

        return models.File.findOne({where: {id: req.params.id, owner_id: req.user.id}, transaction: t})
                .then(function (file) {
                    if (!file) {
                        res.status(404).json({success: false, msg: 'Not found'});
                        throw new Error('not found');
                    }

                    if ((file.status !== 'new') || (file.status !== 'failed') || (file.status !== 'ok')) {
                        res.status(500).json({success: false, msg: 'Wrong status'});
                        throw new Error('wrong status');
                    }

                    file.status = 'uploading';

                    return file.save({transaction: t});
                });
                
    })
            .then(function(tr_res){
                

        /* this function is called later in the code */
        /* var uploadErrHandler = function (err) {
            if (err) {
                console.log('file_submit: ' + err);
                res.status(500).json({success: false, msg: 'Error during upload'});
                return;
            }

            //TODO: redesign for normal file storage

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
            store_path: config.storage_root + path.sep + job._id + path.sep + req.params.filenum
        }; */

        /* jobFile.save(function (err) {
         if (err) {
         res.json({success: false, msg: 'Failed to create file db entry'});
         return;
         } else { 
        parseJobFile(req, jobFile);
        }
         }); 
     }

    })
            .catch(function (err) {
                return res.json({success: false, msg: 'Job selection failed'});
            }); */
}

/*
 * if (job.status !== 'new') {
 return res.json({success: false, msg: 'Job cannot be changed after submission'});
 }
 * 
 * 
 */



