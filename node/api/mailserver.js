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
            to: req.user.email,
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

//отправляет новый пароль при forgot password
var sendNewPassword = function (req, res) {

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


//отправляет письмо о том, что пароль был изменен
var confirmResetPassword = function (req, res) {

    var userNameTemp = req.body.userNameTemp;
    var filePath = path.join(__dirname, 'mail_messages/password_reset_confirmation.html');
    var transporter = nodemailer.createTransport(smtpConfig);

    fs.readFile(filePath, 'utf8', function (err, mailMessage) {
        if (err) {
            return res.json({success: false, msg: 'Unable to read template file'});
        }

        User.findOne({'name': userNameTemp}, function (err, user) {
            if (err)
                return res.json({success: false, msg: 'No user with such email in the database'});

            var mailData = {
                from: 'support@ngspipeline.com',
                to: user.email,
                subject: 'Your password has been reset successfully',
                text: 'Plaintext version of the message', // TBD
                html: mailMessage
            };

            transporter.sendMail(mailData, function (error, info) {
                if (error) {
                    console.error(error);
                    return res.json({success: false, msg: 'Error sending to ' + user.email});
                }
                res.json({success: true, msg: 'Message sent'});
            });
        });
    });
};

var sendPurchaseConfirmation = function (req, res) {
    if (req.user) {
        var filePath = path.join(__dirname, 'mail_messages/invoice_message.html');
        var transporter = nodemailer.createTransport(smtpConfig);

        fs.readFile(filePath, 'utf8', function (err, mailMessage) {
            if (err) {
                return res.json({success: false, msg: 'Unable to read template file'});
            }

            User.findOne({'_id': req.user._id}, function (err, user) {
                if (err)
                    return res.json({success: false, msg: 'No user found'});

                var itemsFromCart = req.user.cart;

                var mailMessageWithParams = ejs.render(mailMessage, {
                    userName: user.name,
                    cart: itemsFromCart
                });
                
                var mailData = {
                    from: 'support@ngspipeline.com',
                    to: user.email,
                    subject: 'Thank you for your purchase with NGS Pipeline!',
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
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }

};


var bindFunction = function (router) {
    router.get('/greet_user', greetUser);
    router.post('/send_new_password', sendNewPassword);
    router.post('/confirm_reset_password', confirmResetPassword);
    router.post('/send_purchase_confirmation', sendPurchaseConfirmation);
};

module.exports = {
    bind: bindFunction
};