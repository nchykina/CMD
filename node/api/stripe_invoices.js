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
                stripe.customers.createSource(user.stripeCustomerId, {source: token},
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
                        res.json({success: false, msg: 'Error'});
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


var createSubscriptions = function (req, res) {
    if (req.user) {
        var secret = stripeConfig.secret;

        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user found with such id'});
            if (user.stripeCustomerId) {

                var subscriptionIds = [];
                for (var key in user.cart) { //а если зафейлится посередине?
                    stripe.subscriptions.create({
                        customer: user.stripeCustomerId,
                        plan: user.cart[key].productId
                    },
                            function (error, subscription) {
                                if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                                    //res.json({success: false, msg: 'Error'});
                                    console.log(error);
                                }
                                if (!subscription) {
                                    //res.json({success: false, msg: "Error, subscription not created"});
                                }
                            }
                    );
                }
                res.json({success: true, msg: "Subscriptions created"});
            } else {
                res.json({success: false, msg: "Stripe customer ID not set"});
            }

        });

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var getActiveSubscriptions = function (req, res) {
    if (req.user) {
        var secret = stripeConfig.secret;

        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user found with such id'});
            if (user.stripeCustomerId) {

                stripe.subscriptions.list({
                    customer: user.stripeCustomerId,
                    limit: 100
                },
                        function (error, subscriptions) {
                            if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                                res.json({success: false, msg: 'Error'});
                            }
                            if (subscriptions) {
                                console.log(subscriptions.data);
                                res.json({success: true, msg: "Subscriptions retrieved",
                                    subscriptions: subscriptions.data, numberOfActiveSubscriptions: subscriptions.data.length});
                            } else {
                                res.json({success: false, msg: 'Error'});
                            }
                        }
                );
            } else {
                res.json({success: false, msg: "Stripe customer ID not set"});
            }

        });

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var unsubscribe = function (req, res) {
    if (req.user) {
        var subscriptionId = req.body.subscriptionId;
        var secret = stripeConfig.secret;

        //проверяем есть ли уже такой юзер в базе Stripe (тогда у него есть stripeCustomerId)
        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user found with such id'});
            stripe.subscriptions.del(subscriptionId,
                    function (error, confirmation) {
                        if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается card=null
                            res.json({success: false, msg: "Error"});
                        }
                        //если карта создана
                        if (confirmation) {
                            res.json({success: true, msg: "Subscription cancelled"});
                        } else {
                            res.json({success: false, msg: "Error"});
                        }
                    }
            );

        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var checkIfSubscribed = function (req, res) {
    if (req.user) {
        var secret = stripeConfig.secret;

        User.findOne({'_id': req.user._id}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user found with such id'});
            if (user.stripeCustomerId) {

                stripe.customers.retrieve(user.stripeCustomerId,
                        function (error, customer) {
                            if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                                res.json({success: false, msg: 'Error'});
                            }
                            if (customer) {
                                if(customer.subscriptions){
                                    console.log("SUBSCRIPTIONS: ", customer.subscriptions.data);
                                    res.json({success: true, msg: 'Error'});
                                }
                                else{
                                    res.json({success: false, msg: 'No subscriptions for this customer'});
                                }                        
                            } else {
                                res.json({success: false, msg: 'Error'});
                            }
                        }
                );
            } else {
                res.json({success: false, msg: "Stripe customer ID not set"});
            }

        });

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var bindFunction = function (router) {
    router.post('/create_or_update_customer', createOrUpdateCustomer);
    router.post('/create_subscriptions', createSubscriptions);
    router.get('/get_active_subscriptions', getActiveSubscriptions);
    router.post('/unsubscribe', unsubscribe);
    router.get('/check_if_subscribed', checkIfSubscribed);
};

module.exports = {
    bind: bindFunction
};