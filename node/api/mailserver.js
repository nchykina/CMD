var Message = require('../models/message');
var nodemailer = require('nodemailer');
var smtpConfig = require('../config/mailconfig');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

//отправляет письмо на внешний почтовый ящик при первом логине
var greetUser = function (req, res) {

    var filePath = path.join(__dirname, 'mail_messages/greeting_message.html');
    var transporter = nodemailer.createTransport(smtpConfig);

    fs.readFile(filePath, 'utf8', function (err, mailMessage) {
        if (err) {
            console.log(err);
        }
        
        var mailMessageWithParams = ejs.render(mailMessage, {
            userName: req.user.name
        });

        var mailData = {
            from: 'support@ngspipeline.com',
            to: req.user.email, // update to user email when ready
            subject: 'Welcome to NGS Pipeline!',
            text: 'Plaintext version of the message', // TBD
            html: mailMessageWithParams
        };
      
        transporter.sendMail(mailData, function (error, info) {
            if (error) {
                console.error(error);
                return res.json({success: false, msg: 'Error sending to '+req.user.email});
            }
            res.json({success: true, msg: 'Message sent'});
        });
    });
};

var sendNewPassword = function (req, res) {

    var filePath = path.join(__dirname, 'mail_messages/new_password_message.html');
    var transporter = nodemailer.createTransport(smtpConfig);

    fs.readFile(filePath, 'utf8', function (err, mailMessage) {
        if (err) {
            console.log(err);
        }
        
        var mailMessageWithParams = ejs.render(mailMessage, {
            userName: req.user.name, //здесь неправильно
            password: 'qwerty'
        });

        var mailData = {
            from: 'support@ngspipeline.com',
            to: req.user.email, // update to user email when ready
            subject: 'Your new password for NGS Pipeline',
            text: 'Plaintext version of the message', // TBD
            html: mailMessageWithParams
        };
      
        transporter.sendMail(mailData, function (error, info) {
            if (error) {
                return res.json({success: false, msg: 'Error'});
            }
            res.json({success: true, msg: 'Message sent'});
        });
    });
};


var bindFunction = function (router) {
    router.get('/greet_user', greetUser);
    router.get('/send_new_password', sendNewPassword);
};

module.exports = {
    bind: bindFunction
};