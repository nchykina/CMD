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
    
    this.addOrder = function(paymentType){
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
    
    var findProduct = function(productId){
        for(var v in productList){
            if(productList[v].id === productId){
                return productList[v];
            }
        }
        
        return null;
    }
    
    this.addToCart = function(productId){
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
    
    this.clearCart = function(){
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
    
    this.removeFromCart = function(productId){
        var defer = $q.defer();

        $http({
            method: 'DELETE',
            url: 'api/cart/'+productId,            
        })
                .success(function (response) {
                    //console.log(response.products);
                    for(var v in cart){
                        if(cart[v].id===productId){
                            cart.splice(v,1);
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
        }
        else {
            defer.resolve(productList);
        }
        
        return defer.promise;
    }
    
    this.getOrders = function () {
        var defer = $q.defer();
        
        if (!ordersLoaded) {
            return loadOrders();                    
        }
        else {
            defer.resolve(orders);
        }
        
        return defer.promise;
    }

    this.getCart = function () {
        var defer = $q.defer();
        
        if (!cartLoaded) {
            return loadCart();                    
        }
        else {
            defer.resolve(cart);
        }
        
        return defer.promise;
    }

}

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
        .service('jobService', ['$http', '$q', jobService])
        .service('ecommService', ['$http', '$q', ecommerceService]);