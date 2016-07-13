angular.module('inspinia')
        .filter('filesize', function () {
            return function (bytes, decimals) {
                if (bytes == 0)
                    return '0 Byte';
                var k = 1000; // or 1024 for binary
                var dm = decimals + 1 || 3;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                var i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
            };
        })
        .filter('product_category', function () {
            return function (products, category) {
               return $.grep( products, function( p ) {
                    return p.product_category === category;
                });
            };
        });