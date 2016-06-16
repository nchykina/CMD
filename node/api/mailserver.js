var Message = require('../models/message');
var nodemailer = require('nodemailer');
var smtpConfig = require('../config/mailconfig');
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');
var User = require('../models/user');
var crypto = require('crypto');


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
                return res.json({success: false, msg: 'Error sending to ' + req.user.email});
            }
            res.json({success: true, msg: 'Message sent'});
        });
    });
};

//отправлять новый пароль при forgot password
var sendNewPassword = function (req, res) {

    //var userEmail = req.body.userEmail;
    console.log("USER EMAIL IN NODE ", req.body.userEmail);

    var filePath = path.join(__dirname, 'mail_messages/new_password_message.html');
    var transporter = nodemailer.createTransport(smtpConfig);

    fs.readFile(filePath, 'utf8', function (err, mailMessage) {
        if (err) {
            console.log(err);
        }

        User.findOne({'email': req.body.userEmail}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user with such email in the database'});

            var tempPassword = crypto.randomBytes(Math.ceil(6)).toString('hex').slice(0, 6);
            user.tempPassword = tempPassword;

            user.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: 'Temp password not saved in the database'});
                }
                var mailMessageWithParams = ejs.render(mailMessage, {
                    userName: user.name,
                    password: tempPassword
                });
                var mailData = {
                    from: 'support@ngspipeline.com',
                    to: user.email, 
                    subject: 'Your new password for NGS Pipeline',
                    text: 'Plaintext version of the message', // TBD
                    html: mailMessageWithParams
                };
                transporter.sendMail(mailData, function (error, info) {
                    if (error) {
                        return res.json({success: false, msg: 'Error, email not sent'});
                    }
                    res.json({success: true, msg: 'Email sent'});
                });
            });
        });
    });
};


var bindFunction = function (router) {
    router.get('/greet_user', greetUser);
    router.post('/send_new_password', sendNewPassword);
};

module.exports = {
    bind: bindFunction
};