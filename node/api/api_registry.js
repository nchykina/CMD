var auth = require('./auth');
var mailbox = require('./mailbox');
var ecommerce = require('./ecommerce');
var paypalInvoices = require('./paypal_invoices');
var ipnListener = require('./ipn_listener');
var mailServer = require('./mailserver');
var stripeInvoices = require('./stripe_invoices');

var job = require('./job');

var bodyParser  = require('body-parser');

var bindFunction = function(router){
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());
    
    auth.bind(router);  
    mailbox.bind(router);
    job.bind(router);
    ecommerce.bind(router);
    //paypalInvoices.bind(router);
    ipnListener.bind(router);
    mailServer.bind(router);
    stripeInvoices.bind(router);
};

module.exports = bindFunction;
