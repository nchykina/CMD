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

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, req.upload_folder);
    },
    filename: function (req, file, cb) {
        cb(null, req.upload_file);
    }
});

var upload = multer({storage: storage}).single('data');

var q = require('bluebird'); //TODO: potential bug cause - sequelize use BlueBird, not Q.

var file_download = function (req, res) {
    if (!req.user.id) {
        res.status(403).json({success: false, msg: 'Unauthorized'});
        return;
    }

    if (!req.params.id) {
        res.status(404).json({success: false, msg: 'No fileid specified'});
        return;
    }

    models.File.findOne({where: {id: req.params.id, owner_id: req.user.id}})
            .then(function (file) {
                if (!file) {
                    res.status(404).json({success: false, msg: 'Not found'});
                    return;
                }

                res.sendFile(file.phys_path);
            })
            .catch(function (err) {
                console.error('file_download: ' + err);
                res.status(500).json({success: false, msg: 'Database error'});
            });
}

var file_list = function (req, res) {
    if (!req.user.id) {
        res.status(403).json({success: false, msg: 'Unauthorized'});
        return;
    }

    models.File.findAll({where: {owner_id: req.user.id}})
            .then(function (files) {
                return res.status(200).json({success: true, msg: 'Files found', files: files});
            })
            .catch(function (err) {
                console.error('file_list: ' + err);
                return res.status(500).json({success: false, msg: 'Database error'});
            });
}

var file_get = function (req, res) {
    if (!req.user.id) {
        res.status(403).json({success: false, msg: 'Unauthorized'});
        return;
    }

    if (!req.params.id) {
        res.status(404).json({success: false, msg: 'No fileid specified'});
        return;
    }

    models.File.findOne({where: {id: req.params.id, owner_id: req.user.id}})
            .then(function (file) {
                if (!file) {
                    res.status(404).json({success: false, msg: 'Not found'});
                    return;
                }

                return res.status(200).json({success: true, msg: 'File found', file: file});
                ;
            })
            .catch(function (err) {
                console.error('file_download: ' + err);
                res.status(500).json({success: false, msg: 'Database error'});
            });
}

var file_delete = function (req, res) {
    if (!req.user.id) {
        res.status(403).json({success: false, msg: 'Unauthorized'});
        return;
    }

    if (!req.params.id) {
        res.status(404).json({success: false, msg: 'No fileid specified'});
        return;
    }

    models.sequelize.transaction(function (t) {
        return models.File.findOne({where: {id: req.params.id, owner_id: req.user.id}, transaction: t})
                .then(function (file) {
                    if (!file) {
                        throw new Error('Not found');
                    }

                    if (file.status === 'uploading') {
                        throw new Error('Wrong status. If you want to cancel your upload - abort upload client-side first');
                    }

                    var defer = q.defer();
                    /* now do I/O */
                    fs.stat(file.phys_path, function (err, stats) {
                        if (err) {
                            if (err.code === 'ENOENT') {
                                file.destroy({transaction: t})
                                        .then(function (ok) {
                                            defer.resolve();
                                        })
                                        .catch(function (err) {
                                            defer.reject(err);
                                        });
                            } else {
                                defer.reject(err);
                            }
                        } else {
                            fs.unlink(file.phys_path, function (err) {
                                if (err) {
                                    defer.reject(err);
                                } else {

                                    file.destroy({transaction: t})
                                            .then(function (ok) {
                                                defer.resolve();
                                            })
                                            .catch(function (err) {
                                                defer.reject(err);
                                            });
                                }
                            });
                        }
                    });

                    return defer.promise;
                });
    })
            .then(function (tr_res) {
                return res.status(200).json({success: true, msg: 'Success'});
            }
            )
            .catch(function (err) {
                console.error('file_delete: ' + err);
                return res.status(500).json({success: false, msg: err});
            });
}

var file_create_internal = function (options) {
    
    var really_create_file = function (t) {
        return models.File.create(
                {
                    owner_id: options.owner_id,
                    name: options.name,
                    status: 'new'}, {transaction: t})
                .then(function (file) {
                    if (file) {
                        if (options.folder) {
                            file.phys_path = options.folder + path.sep + file.id;
                        }
                        else if (options.path) {
                            file.phys_path = options.path;
                        }
                        else {
                            throw new Error('not file path or folder given');
                        }
                        
                        if(options.start_time){
                            file.started_at = options.start_time;                            
                        }
                        
                        if(options.end_time){
                            file.finished_at = options.end_time;                            
                        }
                        
                        if(options.status){
                            file.status = options.status;                            
                        }
                        
                        if(options.filesize){
                            file.filesize = options.filesize;                            
                        }

                        return file.save({transaction: t});
                    } else {
                        throw new Error(file);
                    }
                });
    };
     
    if(options.transaction){
        return really_create_file(options.transaction);
    }
    else {
        return models.sequelize.transaction(really_create_file);
    }
}

var file_create = function (req, res) {
    if (!req.body.name) {
        return res.status(404).json({success: false, msg: 'No filename given'});
    }

    if (req.user) {
        file_create_internal(
                {
                    owner_id: req.user.id,
                    name: req.body.name,
                    folder: config.storage_root + path.sep + 'users' + path.sep + req.user.id
                })
                .then(function (tr_res) {
                    return res.status(200).json({success: true, msg: 'File created', file: tr_res});
                })
                .catch(function (err) {
                    console.error('file_create: ' + err);
                    return res.status(500).json({success: false, msg: 'Internal error'});
                }
                );
    } else {
        res.status(403).json({success: false, msg: 'No user logged in'});
    }
};

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

    var uploadErrHandler = function (err) {

        models.sequelize.transaction(function (t) {
            return models.File.findOne({where: {id: req.params.id, owner_id: req.user.id}, transaction: t, lock: t.LOCK.UPDATE})
                    .then(function (file) {
                        if (!file) {
                            res.status(404).json({success: false, msg: 'Not found'});
                            file.status = 'failed';
                            return file.save({transaction: t});
                        }

                        if (err) {
                            console.error('file_submit: ' + err);
                            res.status(500).json({success: false, msg: 'Error during upload'});
                            file.status = 'failed';
                            return file.save({transaction: t});
                        }

                        if (!req.file) {
                            console.error('file_submit: no file submitted');
                            res.status(404).json({success: false, msg: 'No file submitted'});
                            file.status = 'failed';
                            return file.save({transaction: t});
                        }

                        file.finished_at = Date.now();

                        var defer = q.defer();

                        /* in fact it's bad to do I/O operation inside sequelize transaction
                         * might cause DB locking even though it's very unlikely:
                         * fs.stat() operation is likely to return close to immediately
                         */

                        fs.stat(file.phys_path, function (err, stats) {
                            if (err) {
                                console.error('file_submit: ' + err);
                                res.status(500).json({success: false, msg: 'Internal error: fs.stat'});
                                file.status = 'failed';
                                return file.save({transaction: t})
                                        .then(function (file) {
                                            defer.resolve(file);
                                        })
                                        .catch(function (err) {
                                            defer.reject(err);
                                        });
                            } else {
                                file.filesize = stats.size;
                                file.status = 'ok';
                                return file.save({transaction: t})
                                        .then(function (file) {
                                            res.status(200).json({success: true, file: file});
                                            defer.resolve(file);
                                        })
                                        .catch(function (err) {
                                            defer.reject(err);
                                        });
                            }
                        });

                        return defer.promise;

                    });
        });
    }


    var tr_ret = {};

    models.sequelize.transaction(function (t) {

        return models.File.findOne({where: {id: req.params.id, owner_id: req.user.id}, transaction: t, lock: t.LOCK.UPDATE})
                .then(function (file) {
                    if (!file) {
                        tr_ret = {status: 404, msg: 'Not found'};
                        throw new Error(tr_ret);
                    }

                    if ((file.status !== 'new') && (file.status !== 'failed') && (file.status !== 'ok')) {
                        tr_ret = {status: 404, msg: 'Wrong status'};
                        throw new Error(tr_ret);
                    }

                    var str = file.phys_path;
                    var i1 = str.lastIndexOf(path.sep);
                    req.upload_folder = str.substring(0, i1);
                    req.upload_file = str.substring(i1 + 1, str.length);

                    var defer = q.defer();

                    mkdirp(req.upload_folder, function (err) {
                        if (err) {
                            tr_ret = {status: 500, msg: 'Failed to create storage'};
                            file.status = 'failed';
                            return file.save({transaction: t})
                                    .then(function (file) {
                                        defer.resolve(file);
                                        res.status(500).json({success: false, msg: 'Failed to create storage'});
                                    })
                                    .catch(function (err) {
                                        defer.reject(err);
                                    });
                        } else {
                            file.started_at = Date.now();
                            file.status = 'uploading';

                            return file.save({transaction: t})
                                    .then(function (file) {
                                        defer.resolve(file);
                                        upload(req, res, uploadErrHandler);
                                    })
                                    .catch(function (err) {
                                        defer.reject(err);
                                    });
                        }
                    });

                    return defer.promise;


                });

    })
            .then(function (tr_res) {
                /* response was already handled if all went well */
            })
            .catch(function (err) {
                if (tr_ret.status) {
                    return res.status(tr_ret.status).json({success: false, msg: tr_ret.msg});
                } else {
                    return res.status(500).json({success: false, msg: 'Database error'});
                }
            });
}

var bindFunction = function (router) {
    /* TODO: insert auth middleware */
    router.post('/file_content/:id', file_submit);
    router.get('/file_content/:id', file_download);
    router.get('/file', file_list);
    router.post('/file', file_create);
    router.get('/file/:id', file_get);
    router.delete('/file/:id', file_delete);
};

module.exports = {
    bind: bindFunction,
    file_create: file_create_internal
};




