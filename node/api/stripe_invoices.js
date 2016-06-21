var stripe = require("stripe")(
        "sk_test_R38hnvovO4Bdu5mIyp6sOR4F"
        );
var stripeConfig = require('../config/stripe');
var request = require("request");


var createCustomer = function (req, res) {
    if (req.user) {

        var token = req.body.token;
        var secret = stripeConfig.secret;
        console.log("TOKEN: ", token, " SECRET: ", secret);
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
    router.post('/create_customer', createCustomer);
};

module.exports = {
    bind: bindFunction
};