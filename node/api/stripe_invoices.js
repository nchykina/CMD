var stripe = require("stripe")(
        "sk_test_R38hnvovO4Bdu5mIyp6sOR4F"
        );
var stripeConfig = require('../config/stripe');
var request = require("request");
var models = require('../models');

var createOrUpdateCustomer = function (req, res) {
    if (req.user) {
        var token = req.body.token;
        var secret = stripeConfig.secret;

        //проверяем есть ли уже такой юзер в базе Stripe (тогда у него есть stripeCustomerId)
        models.User.findById(req.user.id)
                .then(function (user) {
                    if (user.stripe_customer_id) { //1. если уже существующий клиент
                        stripe.customers.createSource(user.stripe_customer_id, {source: token},
                                function (error, card) {
                                    if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается card=null
                                        res.status(500).json({success: false, msg: error});
                                    } else {
                                        //если карта создана
                                        if (card) {
                                            res.status(200).json({success: true, msg: "Customer updated"});
                                        } else {
                                            res.status(500).json({success: false, msg: "Failed to create a new card for the customer"});
                                        }
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
                                res.status(500).json({success: false, msg: 'Error'});
                            }
                            //если клиент создан
                            if (customer) {
                                user.update({stripe_customer_id: customer.id})
                                        .then(function (user) {
                                            res.json({success: true, msg: "Customer created"});
                                        })
                                        .catch(function (err) {
                                            console.error('createOrUpdateCustomer: ' + err);
                                            return res.status(500).json({success: false, msg: 'User stripe customer id not updated'});
                                        })
                            } else {
                                res.json({success: false, msg: "Error, no customer created"});
                            }
                        }
                        );
                    }
                })
                .catch(function (err) {
                    console.error('createOrUpdateCustomer: ' + err);
                    return res.status(500).json({success: false, msg: 'No user found with such id'});
                })
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


var createSubscriptions = function (req, res) {
    if (req.user) {
        var secret = stripeConfig.secret;

        models.User.findById(req.user.id,
                {include: [
                        {
                            model: models.Product,
                            as: 'cart'
                        }
                    ]})
                .then(function (user) {
                    if (user.stripe_customer_id) {
                        var subscriptionIds = [];
                        for (var key in user.cart) { //а если зафейлится посередине?
                            stripe.subscriptions.create({
                                customer: user.stripe_customer_id,
                                plan: user.cart[key].id
                            },
                                    function (error, subscription) {
                                        if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                                            //res.json({success: false, msg: 'Error'});
                                            console.error('createSubscriptions: '+error);
                                        }
                                        if (!subscription) {
                                            //res.json({success: false, msg: "Error, subscription not created"});
                                        }
                                    }
                            );
                        }
                        res.status(200).json({success: true, msg: "Subscriptions created"});
                    } else {
                        res.status(500).json({success: false, msg: "Stripe customer ID not set"});
                    }

                })
                .catch(function (err) {
                    console.error('createSubscriptions: ' + err);
                    return res.status(500).json({success: false, msg: 'No user found with such id'});
                })

    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

var getActiveSubscriptions = function (req, res) {
    if (req.user) {
        var secret = stripeConfig.secret;

        models.User.findById(req.user.id)
                .then(function (user) {

                    if (user.stripe_customer_id) {
                        stripe.subscriptions.list({
                            customer: user.stripe_customer_id,
                            limit: 100
                        },
                                function (error, subscriptions) {
                                    if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                                        return res.status(500).json({success: false, msg: 'Error'});
                                    }
                                    if (subscriptions) {
                                        console.log(subscriptions.data);
                                        return res.status(200).json({success: true, msg: "Subscriptions retrieved",
                                            subscriptions: subscriptions.data, numberOfActiveSubscriptions: subscriptions.data.length});
                                    } else {
                                        res.status(500).json({success: false, msg: 'Error'});
                                    }
                                }
                        );
                    } else {
                        res.status(500).json({success: false, msg: "Stripe customer ID not set"});
                    }

                })
                .catch(function (err) {
                    console.error('getActiveSubscriptions: ' + err);
                    return res.status(500).json({success: false, msg: 'No user found with such id'});
                });

    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};

var unsubscribe = function (req, res) {
    if (req.user) {
        var subscriptionId = req.body.subscriptionId;
        var secret = stripeConfig.secret;

        //проверяем есть ли уже такой юзер в базе Stripe (тогда у него есть stripeCustomerId)
        models.User.findOne({'id': req.user.id})
                .then(function (user) {

                    stripe.subscriptions.del(subscriptionId,
                            function (error, confirmation) {
                                if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается card=null
                                    res.status(500).json({success: false, msg: "Error"});
                                }
                                //если карта создана
                                if (confirmation) {
                                    res.status(200).json({success: true, msg: "Subscription cancelled"});
                                } else {
                                    res.status(500).json({success: false, msg: "Error"});
                                }
                            }
                    );

                })
                .catch(function (err) {
                    return res.status(500).json({success: false, msg: 'No user found with such id'});
                })
    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
    }
};


var checkIfSubscribed = function (req, res) {
    if (req.user) {
        var secret = stripeConfig.secret;

        models.User.findOne({'id': req.user.id}
        .then(function (user) {

            if (user.stripe_customer_id) {

                stripe.customers.retrieve(user.stripe_customer_id,
                        function (error, customer) {
                            if (error) { // неправильно хэндлятся ошибки в Страйпе!!! Если неправильный запрос, просто возвращается customer=null
                                return res.status(500).json({success: false, msg: 'Error'});
                            }
                            if (customer) {
                                if (customer.subscriptions) {
                                    console.log("SUBSCRIPTIONS: ", customer.subscriptions.data);
                                    return res.status(200).json({success: true, msg: 'Error'});
                                } else {
                                    return res.status(500).json({success: false, msg: 'No subscriptions for this customer'});
                                }
                            } else {
                                return res.status(500).json({success: false, msg: 'Error'});
                            }
                        }
                );
            } else {
                res.status(500).json({success: false, msg: "Stripe customer ID not set"});
            }

        })
                .catch(function (err) {
                    console.error('checkIfSubscribed: ' + err);
                    return res.status(500).json({success: false, msg: 'No user found with such id'});
                }));

    } else {
        res.status(500).json({success: false, msg: 'No user logged in'});
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