var express = require('express');
var app = express();
var https = require('https').Server(app);
var request = require("request");

var paypalConfig = require('../config/paypal');

var simulateWebhookEvent = function (req, res) {

    var uString = 'Basic ' + new Buffer(paypalConfig.client_id + ':' + paypalConfig.secret).toString('base64');

    //1. get token first
    request({
        uri: "https://api.sandbox.paypal.com/v1/oauth2/token",
        method: "POST",
        json: true,
        headers: {
            "Authorization": uString,
            "content-type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    }, function (error, response, body) {
        if (error) {
            res.json({success: false, msg: error});
        }
        var paypalToken = body.access_token;

        //2. simulate webhook
        var tokenString = 'Bearer ' + paypalToken;
        var bodyContent = {
            url: 'https://www.ngspipeline.com', // TBD
            event_type: 'INVOICING.INVOICE.PAID'
        };
        var bodyString = JSON.stringify(bodyContent);

        request({
            uri: "https://api.sandbox.paypal.com/v1/notifications/simulate-event",
            method: "POST",
            headers: {
                "Authorization": tokenString,
                "Content-Type": "application/json"
            },
            body: bodyString
        }, function (error, response, body) {
            if (error) {
                res.json({success: false, msg: error});
            }
            res.json({success: true, msg: "Webhook event simulated"});
        });
    });
};


var activateListener = function (req, res) {

    console.log("Node called");

    //reply to Paypal: POST HTTP 200
    res.statusCode = 200;
    res.end();

    //read data from req


    //reply to Paypal: send slightly modified message
    /*request({
     uri: req.url,
     method: "POST",
     }, function (error, response, body) {
     if (error) {
     res.json({success: false, msg: error});
     }
     console.log("TEST 2");
     res.json({success: true, msg: "CALLBACK"});
     });*/



    /*
     if (typeof req.body != "undefined") {
     ipn.verify(req.body, function (err, msg) {
     if (err) {
     console.log('IPN: ' + err);
     } else {
     if (req.body.payment_status == 'Completed' && msg == "VERIFIED") {
     console.log('IPN: ' + msg + " " + req.body.txn_id + " " + req.body.payer_email);
     }
     }
     res.send(200);
     res.end();
     res.json({success: true, msg: "Listener activated"});
     });
     }
     res.send(200);
     res.end();
     
     
     https.listen(443, function () {
     console.log("server listening on port " + 443);
     });
     */
};



var bindFunction = function (router) {
    router.get('/activate_listener', activateListener);
    router.post('/simulate_webhook_event', simulateWebhookEvent);
};

module.exports = {
    bind: bindFunction
};