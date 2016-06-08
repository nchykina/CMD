var auth = require('./auth');

var bodyParser  = require('body-parser');

var bindFunction = function(router){
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());
    
    auth.bind(router);    
};

module.exports = bindFunction;
