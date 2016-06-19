//var config = require('../config/mongo');
var User = require('../models/pg/user');
var Role = require('../models/pg/role');
var passport = require('passport');

//var mailserver = require('./mailserver');

require('../config/passport')(passport);

var login = function (req, res, next) {
    passport.authenticate('local-login',
            function (err, user, info) {
                //console.log(user);
                return err
                        ? next(err)
                        : user
                        ? req.logIn(user, function (err) {
                            return err
                                    ? next(err) :
                                    res.json({success: true, msg: 'Successful authentication'});
                        })
                        : res.json({success: false, msg: 'Authentication failed'});
                ;
            }
    )(req, res, next);
};

var logout = function (req, res) {
    req.logout();
    res.json({success: true, msg: 'Successful exit'});
    ;
};

var register = function (req, res, next) {
    if (!req.body.name || !req.body.password) {
        res.json({success: false, msg: 'Please pass name and password.'});
    } else {
        User.create({
            name: req.body.name,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            roles: [
                {name: 'user'}
            ]
        }, {
            include: [ Role ]
        }).then(function (user) {
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                } else {
                    // mailserver.greetUser(req, res); нет, так нельзя
                    res.json({success: true, msg: 'Successfuly created new user'});
                }
            });
        }).catch(function (err) {
            console.error('Error while creating user: ' + err);
            return res.json({success: false, msg: 'Username already exists.'});

        });
    }
};

/* var memberinfo = function(req,res){
 console.log('Memberinfo called');
 var token = getToken(req.headers);
 if (token) {
 var decoded = jwt.decode(token, config.secret);
 User.findOne({
 name: decoded.name
 }, function(err, user) {
 if (err) throw err;
 
 if (!user) {
 return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
 } else {
 res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
 }
 });
 } else {
 return res.status(403).send({success: false, msg: 'No token provided.'});
 }
 }; */

var memberinfo = function (req, res) {

    res.send(req.isAuthenticated() ? req.user : '0');
};

var session_content = function (req, res) {
    res.json(req.session);
};

var getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

var authenticateMw = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.send('Authentication required', 403);
    }
};


var saveProfileChanges = function (req, res) {
    if (req.user) {
        var userData = req.body;

        User.findOne({'id': req.user.id}, function (err, user) {
            if (err)
                return console.error(err);

            user.firstname = userData.firstname;
            user.lastname = userData.lastname;
            user.company = userData.company;

            user.save(function (err) {
                if (err) {
                    return res.json({success: false, msg: 'User data not updated'});
                }
                res.json({success: true, msg: 'User profile successfully updated'});
            });
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};

//для апдейта пароля залогиненного пользователя в User Details
var updatePassword = function (req, res) {
    if (req.user) {
        var userId = req.user.id;
        var oldPassword = req.body.oldPassword;
        var newPassword = req.body.newPassword;

        console.log("USER DATA IN NODE", userId, " ", oldPassword, " ", newPassword);


        User.findOne({'id': req.user.id}).then(function (user) {

            user.comparePassword(oldPassword).then(function () {
                //if correct old password is provided
                console.log("MATCH");
                user.setPassword(newPassword);
                user.save().then(function () {
                    res.json({success: true, msg: 'Password data successfully updated'});
                    return;
                }).catch(function (err) {
                    console.error(err);
                    return res.json({success: false, msg: 'User data not updated'});
                }
                );

            }).catch(function (err) {
                console.error("NO MATCH: " + err);
                res.json({success: false, msg: 'Old password is incorrect'});
                return;
            });
        }).catch(function (err) {
            console.error('User could not be selected: ' + err);
            res.json({success: false, msg: 'User data not updated'});
            return;
        });
    } else {
        res.json({success: false, msg: 'No user logged in'});
    }
};


//для апдейта пароля после восстановления
var updateForgottenPassword = function (req, res) {

    var userNameTemp = req.body.userNameTemp;
    var tempPassword = req.body.tempPassword;
    var newPasswordTemp = req.body.newPasswordTemp;

    console.log("USER DATA IN NODE", userNameTemp, " ", tempPassword, " ", newPasswordTemp);

    User.findOne({'name': userNameTemp}).then(function (user) {
        if (user.tempPassword === tempPassword) {
            user.setPassword(newPasswordTemp);
            user.tempPassword = '';

            user.save().then(function () {
                res.json({success: true, msg: 'Password data successfully updated'});
                return;
            }).catch(function (err) {
                console.error(err);
                return res.json({success: false, msg: 'User data not updated'});
                return;
            });
        } else {
            res.json({success: false, msg: 'Temporary password data incorrect'});
            return;
        }
    }).catch(function (err) {
        console.error(err);
        res.json({success: false, msg: 'User not found'});
        return;
    });
};

var logout = function (req, res) {
    req.logout();
    res.json({success: true, msg: 'User logged out'});
};


var bindFunction = function (router) {
    router.post('/login', login);
    router.post('/register', register);
    router.post('/logout', logout);
    router.get('/session', authenticateMw, session_content);
    router.get('/memberinfo', authenticateMw, memberinfo);
    router.post('/save_profile_changes', saveProfileChanges);
    router.get('/logout', logout);
    router.post('/update_password', updatePassword);
    router.post('/update_forgotten_password', updateForgottenPassword);
};

module.exports = {
    bind: bindFunction,
    authenticate: authenticateMw //authentication middleware wrapper
};
