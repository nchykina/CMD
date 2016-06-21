var stripe = require("stripe")(
        "sk_test_R38hnvovO4Bdu5mIyp6sOR4F"
        );
var stripeConfig = require('../config/stripe');
var request = require("request");
var User = require('../models/user');


var createOrUpdateCustomer = function (req, res) {
    if (req.user) {
        var token = req.body.token;
        var secret = stripeConfig.secret;

        //проверяем есть ли уже такой юзер в базе Stripe (тогда у него есть stripeCustomerId)
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user found with such id'});
            if (user.stripeCustomerId) { //1. если уже существующий клиент
                stripe.customers.createSource(user.stripeCustomerId,{source: token},
                        function (error, card) {
                            if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается card=null
                                res.json({success: false, msg: error});
                            }
                            //если карта создана
                            if (card) {
                                res.json({success: true, msg: "Customer updated"});
                            } else {
                                res.json({success: false, msg: "Failed to create a new card for the customer"});
                            }
                        }
                );
            } else { //2. если новый клиент
                stripe.customers.create({
                    description: req.user.name,
                    source: token,
                    email: req.user.email
                }, function (error, customer) {
                    if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                        res.json({success: false, msg: error});
                    }
                    //если клиент создан
                    if (customer) {
                        user.stripeCustomerId = customer.id;
                        user.save(function (err) {
                            if (err) {
                                return res.json({success: false, msg: 'User stripe customer id not updated'});
                            }
                            res.json({success: true, msg: "Customer created"});
                        });
                    } else {
                        res.json({success: false, msg: "Error, no customer created"});
                    }
                }
                );
            }
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var retrieveCustomer = function (req, res) {
    if (req.user) {

        var customerId = req.body.customerId;
        var secret = stripeConfig.secret;
        stripe.customers.retrieve(customerId, function (error, customer) {
            if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                res.json({success: false, msg: error});
            }
            //если клиент существует
            if (customer) {
                console.log(customer.id);
                res.json({success: true, msg: "Customer exists"});
            } else {
                console.log(res);
                res.json({success: false, msg: "No such customer in Stripe"});
            }
        }
        );

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};




var createSubscription = function (req, res) {
    if (req.user) {


        var customerId = req.body.customerId;
        var secret = stripeConfig.secret;
        stripe.customers.create({
            description: 'TEST',
            source: token,
            email: 'test@test.com'
        }, function (error, customer) {
            if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается null
                console.log("FAIL");
                res.json({success: false, msg: error});
            }
            console.log("SUCCESS");
            //если клиент создан
            if (customer) {
                console.log(customer);
                res.json({success: true, msg: "Customer created"});
            } else {
                console.log(res);
                res.json({success: false, msg: "Error, no customer created"});
            }
        }
        );

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var bindFunction = function (router) {
    router.post('/create_or_update_customer', createOrUpdateCustomer);
    //router.get('/retrieve_customer', createCustomer);
    router.post('/create_subscription', createSubscription);
};

module.exports = {
    bind: bindFunction
};