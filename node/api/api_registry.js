var auth = require('./auth');
var mailbox = require('./mailbox');
var ecommerce = require('./ecommerce');
var paypalInvoices = require('./paypal_invoices');
var ipnListener = require('./ipn_listener');
var mailServer = require('./mailserver');
var stripeInvoices = require('./stripe_invoices');
var file = require('./file');

var job = require('./job');

var bodyParser  = require('body-parser');

var http_bind = function(router){
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());
    
    auth.bind(router);  
    mailbox.bind(router);
    job.bind(router);
    ecommerce.bind(router);
    file.bind(router);
    //paypalInvoices.bind(router);
    ipnListener.bind(router);
    mailServer.bind(router);
    stripeInvoices.bind(router);
};

/* called upon every successful socket.IO connection */
var io_bind = function(socket){
    job.io_bind(socket);
}

module.exports = {
    http_bind: http_bind,
    io_bind: io_bind,
};
