var paypalConfig = require('../config/paypal-server');
var request = require("request");


var getToken = function (req, res) {

    var uString = 'Basic ' + new Buffer(paypalConfig.client_id + ':' + paypalConfig.secret).toString('base64');


    request({
        uri: "https://api.sandbox.paypal.com/v1/oauth2/token",
        method: "POST",
        json: true,
        //user: uString,
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
        //console.log("BODY ", body);
        //console.log("APP ID ", body.app_id);
        //console.log("TOKEN ", body.access_token);
        res.json({success: true, msg: "Token received"});
    });

};


var createInvoice = function (req, res) {

    var uString = 'Bearer ' + req.session.paypalToken;
    //console.log("uString: ", uString);

    var merchantInfo = paypalConfig.merchantInfo;

    var billingInfo = [{
            email: "example@example.com" // TBD: user email
        }];

    var items = [
        {
            name: "DNA alignment",
            quantity: 1,
            unit_price: {
                currency: "USD",
                value: "10"
            }
        }
    ];

    var note = "this note will be changed";

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
        note: note,
        payment_term: payment_term,
        shipping_info: shipping_info
    };
    var bodyString = JSON.stringify(bodyContent);
    // console.log("Body string ", bodyString);

    //request.debug = true;

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
        req.session.invoiceId = body.id;
        req.session.invoiceNumber = body.number;
        console.log("BODY ", body);
        console.log("ERROR ", error);
        //console.log("REQUEST ", request);
        //console.log("RESPONSE ", response);
        res.json({success: true, msg: "Invoice created"});
    });

};

var bindFunction = function (router) {
    router.get('/get_token', getToken);
    router.post('/create_invoice', createInvoice);
};

module.exports = {
    bind: bindFunction
};