var Message = require('../models/message');
var nodemailer = require('nodemailer');
var mailConfig = require('../config/mailconfig');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

//отправляет письмо на внешний и внутренний почтовый ящик при первом логине
var greetUser = function (req, res) {

    var filePath = path.join(__dirname, 'mail_messages/greeting_message.html');
    var transporter = nodemailer.createTransport(mailConfig.smtpConfig);

    fs.readFile(filePath, 'utf8', function (err, mailMessage) {
        if (err) {
            console.log(err);
        }
        
        var mailMessageWithParams = ejs.render(mailMessage, {
            userName: 'USER111'
        });

        var mailData = {
            from: 'support@ngspipeline.com',
            to: 'support@ngspipeline.com', // update to user email when ready
            subject: 'Welcome to NGS Pipeline!',
            text: 'Plaintext version of the message',
            html: mailMessageWithParams
        };

        

        transporter.sendMail(mailData, function (error, info) {
            if (error) {
                //console.log(error);
                return res.json({success: false, msg: 'Error'});
            }
            //console.log('Message sent: ' + info.response + ' ' + info.accepted);
            res.json({success: true, msg: 'Message sent'});
        });
    });
};


var bindFunction = function (router) {
    router.get('/greet_user', greetUser);
};

module.exports = {
    bind: bindFunction
};