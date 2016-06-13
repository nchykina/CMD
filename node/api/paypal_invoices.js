var paypalConfig = require('../config/paypal');
var request = require("request");
var Invoice = require('../models/invoice');


var getToken = function (req, res) {

    var uString = 'Basic ' + new Buffer(paypalConfig.client_id + ':' + paypalConfig.secret).toString('base64');

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
        req.session.paypalToken = body.access_token;
        req.session.paypalAppId = body.app_id;
        res.json({success: true, msg: "Token received"});
    });

};


var createInvoice = function (req, res) {

    var uString = 'Bearer ' + req.session.paypalToken;

    var merchantInfo = paypalConfig.merchantInfo;

    var billingInfo = [{
            email: "example@example.com" // TBD: user email
        }];

    var items = [// TBD list of items to bill
        {
            name: "DNA alignment",
            quantity: 1,
            unit_price: {
                currency: "USD",
                value: "10"
            }
        }
    ];

    var payment_term = {
        term_type: "NET_45"
    };

    var shipping_info = {
        first_name: "Sally",
        last_name: "Patient",
        business_name: "Not applicable",
        phone: {
            country_code: "001",
            national_number: "5039871234"
        },
        address: {
            line1: "1234 Broad St.",
            city: "Portland",
            state: "OR",
            postal_code: "97216",
            country_code: "US"
        }};

    var bodyContent = {
        merchant_info: merchantInfo,
        billing_info: billingInfo,
        items: items,
        payment_term: payment_term
                // shipping_info: shipping_info
    };
    var bodyString = JSON.stringify(bodyContent);

    request({
        uri: "https://api.sandbox.paypal.com/v1/invoicing/invoices/",
        method: "POST",
        headers: {
            "Authorization": uString,
            "Content-Type": "application/json"
        },
        body: bodyString
    }, function (error, response, body) {
        if (error) {
            res.json({success: false, msg: error});
        }
        //req.session.invoiceId = body.id;
        //req.session.invoiceNumber = body.number;
        // console.log("BODY ", body);
        // console.log("ERROR ", error);
        var bodyJSON = JSON.parse(body);

        // console.log("DATA", req.user._id, " ", bodyJSON.merchant_info);

        var newInvoice = new Invoice({
            userId: req.user._id,
            id: bodyJSON.id,
            number: bodyJSON.number,
            template_id: bodyJSON.template_id,
            status: bodyJSON.status,
            merchant_info: bodyJSON.merchant_info,
            billing_info: bodyJSON.billing_info,
            items: bodyJSON.items,
            invoice_date: bodyJSON.invoice_date,
            payment_term: bodyJSON.payment_term
        });


        newInvoice.save(function (err) {
            if (err) {
                return res.json({success: false, msg: err});
            }
            res.json({success: true, msg: 'Invoice created and saved to database', invoiceId: bodyJSON.id});
        });
    });

};

var sendInvoice = function (req, res) {

    var uString = 'Bearer ' + req.session.paypalToken;

    var invoiceId = req.body.invoiceId;

    request({
        uri: "https://api.sandbox.paypal.com/v1/invoicing/invoices/" + invoiceId + "/send",
        method: "POST",
        headers: {
            "Authorization": uString,
            "Content-Type": "application/json"
        }
    }, function (error, response, body) {
        if (error) {
            res.json({success: false, msg: error});
        }
        console.log("BODY ", body);
        console.log("ERROR ", error);
        console.log("RESPONSE ", response.statusCode, " ", response.statusMessage);
        if (response.statusCode == 202) {
            res.json({success: true, msg: "Invoice sent to user"});
        } else {
            res.json({success: true, msg: "Invoice not accepted by Paypal and not sent to user"});
        }
    });

};


var bindFunction = function (router) {
    router.get('/get_token', getToken);
    router.post('/create_invoice', createInvoice);
    router.post('/send_invoice', sendInvoice);
};

module.exports = {
    bind: bindFunction
};