/* var paypalConfig = require('../config/paypal');
var request = require("request");
var Invoice = require('../models/invoice');
var User = require('../models/user');
var Order = require('../models/order');



var getToken = function (req, res) {
    if (req.user) {

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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }


};


var createInvoice = function (req, res) {
    if (req.user) {

        var uString = 'Bearer ' + req.session.paypalToken;

        var merchantInfo = paypalConfig.merchantInfo;

        var billingInfo = [{
                email: req.user.email
            }];

        var itemsFromCart = req.user.cart;
        var items = [];
        for (var key in itemsFromCart) {
            var nameString = itemsFromCart[key].productCategory + ": " + itemsFromCart[key].productName;
            var item = {
                name: nameString,
                quantity: 1,
                unit_price: {
                    currency: "USD",
                    value: itemsFromCart[key].price
                }
            };
            items.push(item);
        }

        var payment_term = {
            term_type: "NET_45"
        };


        var bodyContent = {
            merchant_info: merchantInfo,
            billing_info: billingInfo,
            items: items,
            payment_term: payment_term
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
            console.log("BODY ", body);
            console.log("ERROR ", error);
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
                payment_term: bodyJSON.payment_term,
                total_amount: bodyJSON.total_amount
            });


            newInvoice.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: err});
                }
                res.json({success: true, msg: 'Invoice created and saved to database', invoiceId: bodyJSON.id,
                    invoiceNumber: bodyJSON.number});
            });
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};

var sendInvoice = function (req, res) {
    if (req.user) {

        var uString = 'Bearer ' + req.session.paypalToken;

        var invoiceId = req.body.invoiceId;
        var invoiceNumber = req.body.invoiceNumber;
        var paymentType = req.body.paymentType;

        Invoice.findOne({'id': invoiceId}, function (err, invoice) {
            if (err)
                return res.json({success: false, msg: 'Invoice with this id not found'});
            var invoiceAmount = invoice.total_amount.value;

            var newOrder = new Order({
                userId: req.user._id,
                paymentType: req.body.paymentType,
                products: req.user.cart,
                orderId: invoiceNumber,
                orderDate: new Date(),
                totalAmount: invoiceAmount,
                status: 'Pending'
            });

            if (paymentType == "Credit card / Paypal") {
                //if credit card or paypal

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
                        //if invoice is sent, create an order
                        newOrder.save(function (err) {
                            if (err) {
                                return res.json({success: false, msg: 'Order not created'});
                            }
                            //after order is created, clear user cart
                            User.findOne({'_id': req.user._id}, function (err, user) {
                                if (err)
                                    return res.json({success: false, msg: 'User not found'});
                                user.cart = [];
                                user.save(function (err) {
                                    if (err)
                                        return res.json({success: false, msg: 'Error'});
                                    res.json({success: true, msg: 'Cart cleared, order created, invoice sent to user'});
                                });
                            }
                            );
                        });

                    } else {
                        res.json({success: false, msg: "Invoice not accepted by Paypal and not sent to user"});
                    }
                });
            } else {
                //if wire transfer, Paypal invoice is created but never sent to the user
                newOrder.save(function (err) {
                    if (err) {
                        return res.json({success: false, msg: 'Order not created'});
                    }
                    //after order is created, clear user cart
                    User.findOne({'_id': req.user._id}, function (err, user) {
                        if (err)
                            return res.json({success: false, msg: 'User not found'});
                        user.cart = [];
                        user.save(function (err) {
                            if (err)
                                return res.json({success: false, msg: 'Error'});
                            res.json({success: true, msg: 'Cart cleared, order created'});
                        });
                    }
                    );
                });
            }
        }
        );

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};


var bindFunction = function (router) {
    router.get('/get_token', getToken);
    router.post('/create_invoice', createInvoice);
    router.post('/send_invoice', sendInvoice);
};

module.exports = {
    bind: bindFunction
}; */