var messageService = function() {
        
    var vm = this;    
    vm.message = {};
       
};
        
angular
    .module('inspinia')
    .service('messageService', messageService);