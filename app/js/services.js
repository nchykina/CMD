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
};

angular
        .module('inspinia')
        .service('messageService', messageService)
        .factory('ecommerceService', ['$http', ecommerceService]);