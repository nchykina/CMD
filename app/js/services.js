var messageService = function () {

    var vm = this;
    vm.message = {};

};

//not used
var ecommerceService = function ($http) {

    var em = {};
    
    em.productList = {};

    em.getProductList = function(){
        $http({
            method: 'GET',
            url: 'api/get_product_list'
        })
                .success(function (response) {
                    console.log(response.products);
                    this.productList = response.products;
                });
        //return em.productList;
    };

    em.getProductList();
    
    return em;
var jobService = function ($http, $q) {
    var vm = this;

    vm.newJob = {};

    this.createOrUpdateJob = function (jobtype, jobparams) {
        var deferred = $q.defer();

        /* TODO: proper species handling */
        $http({
            method: 'POST',
            url: 'api/job/create_or_update',
            data: {jobtype: jobtype, jobparams: jobparams}

        })
                .success(function (response) {
                    //console.log(response);
                    if (response.success) {
                        deferred.resolve(response.job);
                    } else {
                        deferred.reject(response.msg);
                    }
                })
                .error(function (msg, code) {
                    deferred.reject(msg);
                });
                
        return deferred.promise;
    }
};

angular
        .module('inspinia')
        .service('messageService', messageService)
        .service('jobService',['$http','$q',jobService])
        .factory('ecommerceService', ['$http', ecommerceService]);
