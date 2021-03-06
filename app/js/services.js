var messageService = function () {

    var vm = this;
    vm.message = {};

};

var ecommerceService = function ($http, $q) {
    var self = this;

    var cart = [];
    var productList = [];
    var orders = [];

    var productListLoaded = false;
    var cartLoaded = false;
    var ordersLoaded = false;

    var loadProductList = function () {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'api/products'
        })
                .success(function (response) {
                    //console.log(response.products);
                    //productList.length = 0;

                    //for(var v in response.products){
                    //    productList.push(response.products[v]);
                    //}
                    productList = response.products;
                    productListLoaded = true;
                    defer.resolve(productList);
                })
                .error(function (data, status) {
                    console.error('loadProductList: ' + status + ' - ' + data.msg);
                    productListLoaded = false;
                    defer.reject(data.msg);
                });

        return defer.promise;
    };

    var loadOrders = function () {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'api/orders'
        })
                .success(function (response) {
                    //console.log(response.products);
                    //productList.length = 0;

                    //for(var v in response.products){
                    //    productList.push(response.products[v]);
                    //}
                    orders = response.orders;
                    ordersLoaded = true;
                    defer.resolve(orders);
                })
                .error(function (data, status) {
                    console.error('loadOrders: ' + status + ' - ' + data.msg);
                    ordersLoaded = false;
                    defer.reject(data.msg);
                });

        return defer.promise;
    };

    this.addOrder = function (paymentType) {
        var defer = $q.defer();

        $http({
            method: 'POST',
            url: 'api/orders',
            data: {'payment_type': paymentType}
        })
                .success(function (response) {
                    //console.log(response.products);
                    cart.length = 0;
                    orders.push(response.order);
                    console.log(orders);
                    defer.resolve(response.msg);
                })
                .error(function (data, status) {
                    console.error('addToCart: ' + status + ' - ' + data.msg);
                    defer.reject(data.msg);
                });

        return defer.promise;
    }

    var findProduct = function (productId) {
        for (var v in productList) {
            if (productList[v].id === productId) {
                return productList[v];
            }
        }

        return null;
    }

    this.addToCart = function (productId) {
        var defer = $q.defer();

        $http({
            method: 'POST',
            url: 'api/cart',
            data: {'product_id': productId}
        })
                .success(function (response) {
                    //console.log(response.products);
                    cart.push(findProduct(productId));
                    defer.resolve(response.msg);
                })
                .error(function (data, status) {
                    console.error('addToCart: ' + status + ' - ' + data.msg);
                    defer.reject(data.msg);
                });

        return defer.promise;
    }

    this.clearCart = function () {
        var defer = $q.defer();

        $http({
            method: 'DELETE',
            url: 'api/cart',
        })
                .success(function (response) {
                    //console.log(response.products);
                    cart.length = 0;
                    defer.resolve(response.msg);
                })
                .error(function (data, status) {
                    console.error('clearCart: ' + status + ' - ' + data);
                    defer.reject(data);
                });

        return defer.promise;
    }

    this.removeFromCart = function (productId) {
        var defer = $q.defer();

        $http({
            method: 'DELETE',
            url: 'api/cart/' + productId,
        })
                .success(function (response) {
                    //console.log(response.products);
                    for (var v in cart) {
                        if (cart[v].id === productId) {
                            cart.splice(v, 1);
                            break;
                        }
                    }

                    defer.resolve(response.msg);
                })
                .error(function (data, status) {
                    console.error('removeFromCart: ' + status + ' - ' + data);
                    defer.reject(data);
                });

        return defer.promise;
    }

    var loadCart = function () {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'api/cart'
        })
                .success(function (response) {
                    //console.log(response.products);
                    cart = response.cart;
                    cartLoaded = true;
                    defer.resolve(cart);
                })
                .error(function (data, status) {
                    console.error('loadCart: ' + status + ' - ' + data);
                    defer.reject(data);
                });

        return defer.promise;
    };

    this.getProductList = function () {
        var defer = $q.defer();

        if (!productListLoaded) {
            return loadProductList();
        } else {
            defer.resolve(productList);
        }

        return defer.promise;
    }

    this.getOrders = function () {
        var defer = $q.defer();

        if (!ordersLoaded) {
            return loadOrders();
        } else {
            defer.resolve(orders);
        }

        return defer.promise;
    }

    this.getCart = function () {
        var defer = $q.defer();

        if (!cartLoaded) {
            return loadCart();
        } else {
            defer.resolve(cart);
        }

        return defer.promise;
    }

}

var fileService = function ($http, $q, Upload) {
    var self = this;

    var files = [];

    var filesLoaded = false;

    var loadFiles = function () {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'api/file'
        })
                .success(function (response) {
                    //console.log(response.products);
                    //productList.length = 0;

                    //for(var v in response.products){
                    //    productList.push(response.products[v]);
                    //}
                    files = response.files;
                    filesLoaded = true;
                    defer.resolve(files);
                })
                .error(function (data, status) {
                    console.error('loadFiles: ' + status + ' - ' + data.msg);
                    filesLoaded = false;
                    defer.reject(data.msg);
                });

        return defer.promise;
    };

    this.addFile = function (file_client, filetype) {
        return self.createFile(file_client, filetype)
                .then(function (file_srv) {
                    return self.uploadFile(file_client, file_srv);
                });
    }

    this.createFile = function (file_client, filetype) {
        var defer = $q.defer();

        //console.log(file_client);

        $http({
            method: 'POST',
            url: 'api/file',
            data: {
                'name': file_client.name,
                'filetype': filetype
            }
        })
                .success(function (response) {
                    var file_idx = files.push(response.file) - 1;
                    files[file_idx].filesize = file_client.size;
                    defer.resolve(files[file_idx]);
                })
                .error(function (data, status) {
                    console.error('createFile: ' + status + ' - ' + data.msg);
                    defer.reject(data.msg);
                });

        return defer.promise;
    }

    this.uploadFile = function (file_client, file_srv) {
        var defer = $q.defer();

        Upload.upload({
            url: 'api/file_content/' + file_srv.id,
            data: {data: file_client}
        }).then(function (resp) {
            var server_resp = resp.data;

            //console.log('Success ' + resp.config.data.data.name + ' uploaded. Response: ' + server_resp.msg);
            // = server_resp.file_entry;                            
            file_srv.status = server_resp.file.status;
            file_srv.filesize = server_resp.file.filesize;
            file_srv.progress = 100;
            file_srv.finished_at = server_resp.file.finished_at;

            defer.resolve(file_srv);
        }
        , function (resp) {
            file_srv.status = 'failed';
            //files[file_idx].filesize = 0;
            console.error('Error status: ' + resp.status);
            defer.reject();
        }, function (evt) {
            var progress = {
                current: evt.loaded,
                total: evt.total,
                progress: Math.min(100, parseInt(100.0 * evt.loaded / evt.total))
            };

            file_srv.status = 'uploading';
            file_srv.current = evt.loaded;
            file_srv.total = evt.total;
            file_srv.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total))

            defer.notify(progress);
        });
    }

    this.deleteFile = function (fileid) {
        var defer = $q.defer();

        $http({
            method: 'DELETE',
            url: 'api/file/' + fileid
        })
                .success(function (response) {
                    //console.log(response.products);
                    for (var i in files) {
                        if (files[i].id == fileid) {
                            files.splice(i, 1);
                            return defer.resolve();
                        }
                    }

                    return defer.reject('file not found in cached array');
                })
                .error(function (data, status) {
                    console.error('deleteFile: ' + status + ' - ' + data.msg);
                    defer.reject(data.msg);
                });

        return defer.promise;

    }

    this.getFiles = function () {
        var defer = $q.defer();

        if (!filesLoaded) {
            return loadFiles();
        } else {
            defer.resolve(files);
        }

        return defer.promise;
    }

    this.getFile = function (fileid) {
        var defer = $q.defer();

        for (var i in files) {
            if (files[i].id == fileid) {
                defer.resolve(files[i]);
                return defer.promise;
            }
        }

        $http({
            method: 'GET',
            url: 'api/file/' + fileid
        })
                .success(function (response) {
                    files.push(response.file);

                    defer.resolve(response.file);
                })
                .error(function (data, status) {
                    console.error('getFile: ' + status + ' - ' + data.msg);

                    defer.reject(data.msg);
                });


        return defer.promise;
    }
}


var jobService = function ($http, $q, fileService, socket) {
    var vm = this;

    var newJobs = {dna_reseq: {}, rna_reseq: {}};

    var jobs = [];

    var jobsLoaded = false;

    var loadJobs = function () {
        var defer = $q.defer();

        $http({
            method: 'GET',
            url: 'api/job'
        })
                .success(function (response) {

                    jobs = response.jobs;
                    jobsLoaded = true;
                    defer.resolve(jobs);
                })
                .error(function (data, status) {
                    console.error('loadJobs: ' + status + ' - ' + data.msg);
                    jobsLoaded = false;
                    defer.reject(data.msg);
                });

        return defer.promise;
    };

    this.setFile = function (job, filenum, file_srv) {
        var defer = $q.defer();

        $http({
            method: 'PUT',
            url: 'api/job/' + job.id,
            data: {jobfile: {filenum: filenum, fileid: file_srv.id}}
        })
                .success(function (response) {
                    job.files[filenum] = file_srv;

                    defer.resolve();
                })
                .error(function (data, status) {
                    console.error('setFile: ' + status + ' - ' + data.msg);
                    defer.reject(data.msg);
                });

        return defer.promise;
    }

    this.addFile = function (job, filenum, file_client, filetype) {
        return fileService.createFile(file_client, filetype)
                .then(function (file_srv) {
                    return vm.setFile(job, filenum, file_srv)
                            .then(function (res) {
                                return fileService.uploadFile(file_client, file_srv);
                            });
                });
    }

    this.getJobs = function () {
        var defer = $q.defer();

        if (!jobsLoaded) {
            return loadJobs();
        } else {
            defer.resolve(jobs);
        }

        return defer.promise;
    }

    this.getJob = function (id) {
        var defer = $q.defer();

        //console.log(angular.toJson(jobs,true));

        for (var i in jobs) {
            //console.log('checking '+jobs[i].id);

            if (jobs[i].id == id) {
                defer.resolve(jobs[i]);
                //console.log('returning cached job '+id);
                return defer.promise;
            }
        }

        //console.log('requesting uncached job '+id);

        //if not found in cache
        $http({
            method: 'GET',
            url: 'api/job/' + id
        })
                .success(function (response) {
                    var job = response.job;
                    jobs.push(job);
                    defer.resolve(job);
                })
                .error(function (data, status) {
                    console.error('getJob: ' + status);
                    defer.reject(data.msg);
                });

        return defer.promise;
    };

    this.processJobUpdate = function (job) {

        for (var i in jobs) {
            if (jobs[i].id == job.id) {
                jobs[i].status = job.status;
                
                if(job.files){
                    jobs[i].files = job.files;
                }
                //console.log('job ' + job.id + ' status: ' + job.status);
                return;
            }
        }

        //further handling here

        throw new Error('job_update for unknown job');

    }

    this.processStepUpdate = function (msg) {
        for (var i in jobs) {
            if (jobs[i].id == msg.jobid) {
                jobs[i].steps[msg.stepnum].status = msg.step.status;
                jobs[i].status = msg.jobstatus;
                return;
            }
        }

        throw new Error('step_update: unknown ' + msg.jobid + ' ' + msg.stepnum);

    }

    this.processFileUpload = function (jobid) {

        for (var i in jobs) {
            if (jobs[i].id == jobid) {
                //console.log(jobid + ': files submitted');
                return;
            }
        }

        throw new Error('processFileUpload: unknown ' + jobid);

    }

    this.subscribeJob = function (job) {
        var defer = $q.defer();

        socket.on('subscribe_job_response', function (msg) {
            console.log(msg);

            if (msg.jobid !== job.id) {
                //skip messages to other handlers
                return;
            }

            socket.removeListener('subscribe_job_response', this);

            if (!msg.success) {

                return defer.reject(msg.message);
            }

            socket.on('job_update', vm.processJobUpdate);
            socket.on('step_update', vm.processStepUpdate);
            socket.on('job_file_submit', vm.processFileUpload);

            defer.resolve();
        });

        socket.emit('subscribe_job_request', job.id, function () {

        });

        return defer.promise;
    }

    this.unsubscribeJob = function (job) {

    }

    this.deleteJob = function (job) {
        var defer = $q.defer();

        $http({
            method: 'DELETE',
            url: 'api/job/' + job.id
        })
                .success(function (response) {
                    for (var i in jobs) {
                        if (jobs[i].id == job.id) {
                            console.log("deleting element "+i);
                            jobs.splice(i, 1);
                            break;
                        }
                    }

                    defer.resolve();
                })
                .error(function (data, status) {
                    console.error('deleteJob: ' + status + ' - ' + data.msg);
                    defer.reject(data.msg);
                });

        return defer.promise;
    }

    this.submitJob = function (job) {
        var defer = $q.defer();

        if (!((job.files[0]) && (job.files[1]))) {
            defer.reject('The job needs two input files');
        } else {
            vm.subscribeJob(job)
                    .then(function () {

                        $http({
                            method: 'PUT',
                            url: 'api/job/submit/' + job.id
                        })
                                .success(function (response) {
                                    //console.log(response.products);
                                    //productList.length = 0;

                                    //for(var v in response.products){
                                    //    productList.push(response.products[v]);
                                    //}
                                    job.status = 'submitted';

                                    defer.resolve();
                                })
                                .error(function (data, status) {
                                    job.status = 'failed';
                                    console.error('submitJobs: ' + status + ' - ' + data.msg);
                                    defer.reject(data.msg);
                                });
                    })
                    .catch(function (err) {
                        defer.reject(err);
                    });

        }

        return defer.promise;
    }

    this.createOrUpdateJob = function (jobtype, species) {
        var deferred = $q.defer();

        for (var i in jobs) {
            var j = jobs[i];
            if ((j.jobtype === jobtype) && (j.seq_species === species) && (j.status === 'new')) {
                deferred.resolve(j);
                return deferred.promise;
            }
        }

        /* TODO: proper species handling */
        $http({
            method: 'POST',
            url: 'api/job/create_or_update',
            data: {jobtype: jobtype, jobparams: {seq_species: species}}

        })
                .success(function (response) {
                    console.log(response);

                    var ret_job = response.job;

                    if (!ret_job.files) {
                        ret_job.files = [];
                    }

                    jobs.push(ret_job);

                    deferred.resolve(ret_job);

                })
                .error(function (msg, code) {
                    //console.error('code + ' - ' + msg);                    
                    deferred.reject(msg);
                });

        return deferred.promise;
    }


};

var principalService = function ($q, $http, $timeout) {
    var _identity = undefined,
            _authenticated = false;

    return {
        isIdentityResolved: function () {
            return angular.isDefined(_identity);
        },
        isAuthenticated: function () {
            return _authenticated;
        },
        isInRole: function (role) {
            if (!_authenticated || !_identity.roles)
                return false;

            return _identity.roles.indexOf(role) != -1;
        },
        isInAnyRole: function (roles) {
            if (!_authenticated || !_identity.roles)
                return false;

            for (var i = 0; i < roles.length; i++) {
                if (this.isInRole(roles[i]))
                    return true;
            }

            return false;
        },
        authenticate: function (identity) {
            _identity = identity;
            _authenticated = identity != null;
        },
        identity: function (force) {
            var deferred = $q.defer();

            if (force === true)
                _identity = undefined;

            // check and see if we have retrieved the 
            // identity data from the server. if we have, 
            // reuse it by immediately resolving
            if (angular.isDefined(_identity)) {
                deferred.resolve(_identity);

                return deferred.promise;
            }

            // otherwise, retrieve the identity data from the
            // server, update the identity object, and then 
            // resolve.
            //           $http.get('/svc/account/identity', 
            //                     { ignoreErrors: true })
            //                .success(function(data) {
            //                    _identity = data;
            //                    _authenticated = true;
            //                    deferred.resolve(_identity);
            //                })
            //                .error(function () {
            //                    _identity = null;
            //                    _authenticated = false;
            //                    deferred.resolve(_identity);
            //                });

            // for the sake of the demo, fake the lookup
            // by using a timeout to create a valid
            // fake identity. in reality,  you'll want 
            // something more like the $http request
            // commented out above. in this example, we fake 
            // looking up to find the user is
            // not logged in
            var self = this;
            $timeout(function () {
                self.authenticate(null);
                deferred.resolve(_identity);
            }, 1000);

            return deferred.promise;
        }
    };
}

var authorizationService = function ($rootScope, $state, principal) {
    return {
        authorize: function () {
            return principal.identity()
                    .then(function () {
                        var isAuthenticated = principal.isAuthenticated();

                        if ($rootScope.toState.data.roles
                                && $rootScope.toState
                                .data.roles.length > 0
                                && !principal.isInAnyRole(
                                        $rootScope.toState.data.roles))
                        {
                            if (isAuthenticated) {
                                // user is signed in but not
                                // authorized for desired state
                                $state.go('accessdenied');
                            } else {
                                // user is not authenticated. Stow
                                // the state they wanted before you
                                // send them to the sign-in state, so
                                // you can return them when you're done
                                $rootScope.returnToState
                                        = $rootScope.toState;
                                $rootScope.returnToStateParams
                                        = $rootScope.toStateParams;

                                // now, send them to the signin state
                                // so they can log in
                                $state.go('signin');
                            }
                        }
                    });
        }
    };
}

var ioService = function ($rootScope) {
    var socket = io.connect();
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },
        removeListener: function (eventName, listener) {
            socket.removeListener(eventName, listener);
        }
    };
}



angular
        .module('inspinia')
        .service('messageService', messageService)
        .factory('socket', ['$rootScope', ioService])
        .service('jobService', ['$http', '$q', 'fileService', 'socket', jobService])
        .service('fileService', ['$http', '$q', 'Upload', fileService])
        .service('ecommService', ['$http', '$q', ecommerceService])
        .factory('principal', ['$q', '$http', '$timeout', principalService])
        .factory('authorization', ['$rootScope', '$state', 'principal', authorizationService])

  