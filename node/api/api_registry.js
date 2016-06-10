var auth = require('./auth');
var mailbox = require('./mailbox');
var ecommerce = require('./ecommerce');


var bodyParser  = require('body-parser');

var bindFunction = function(router){
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());
    
    auth.bind(router);  
    mailbox.bind(router);
    ecommerce.bind(router);
};

module.exports = bindFunction;
