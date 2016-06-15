var Message = require('../models/message');
var nodemailer = require('nodemailer');
var mailConfig = require('../config/mailconfig');
//var smtpTransport = require('nodemailer-smtp-transport'); //https://github.com/nodemailer/nodemailer-smtp-transport


//отправляет письмо на внешний и внутренний почтовый ящик при первом логине
var greetUser = function (req, res) {

    console.log("Greeting user");

    //var transporter = nodemailer.createTransport('SMTP', mailConfig.smtpConfig);
    var transporter = nodemailer.createTransport(mailConfig.smtpConfig);

    //var transporter = nodemailer.createTransport({
    //    name: 'mail.ngspipeline.com',
    //    direct: true
    //});

    var mailData = {
        from: 'sergey@ngspipeline.com',
        to: 'support@ngspipeline.com',
        subject: 'Message title',
        text: 'Plaintext version of the message',
        html: 'HTML version of the message'
    };

    transporter.sendMail(mailData, function (error, info) {
        if (error) {
            console.log(error);
            return res.json({success: false, msg: 'Error'});
        }
        console.log('Message sent: ' + info.response + ' ' + info.accepted);
        res.json({success: true, msg: 'Message sent'});
    });
};


var bindFunction = function (router) {
    router.get('/greet_user', greetUser);
};

module.exports = {
    bind: bindFunction
};