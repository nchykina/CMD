var LocalStrategy = require('passport-local').Strategy;
var config = require('../config');

var models = require('../models');

// load up the user model
//var User = require('../models/pg/user');
//var config = require('../config/mongo'); // get db config file

/* module.exports = function(passport) {
 var opts = {};
 opts.secretOrKey = config.passport_secret;
 opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
 passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
 User.findOne({id: jwt_payload.id}, function(err, user) {
 if (err) {
 return done(err, false);
 }
 if (user) {
 done(null, user);
 } else {
 done(null, false);
 }
 });
 }));
 }; */

module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function (id, done) {
        models.User.findById(id).then(function (user) {
            return done(null, user);
        }).catch(function (err) {
            return done(err, null);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    /* passport.use('local-signup', new LocalStrategy({
     // by default, local strategy uses username and password, we will override with email
     usernameField: 'name',
     passwordField: 'password',
     passReqToCallback: true // allows us to pass back the entire request to the callback
     },
     function (req, name, password, done) {
     
     // asynchronous
     // User.findOne wont fire unless data is sent back
     process.nextTick(function () {
     
     // find a user whose email is the same as the forms email
     // we are checking to see if the user trying to login already exists
     User.findOne({'name': name}, function (err, user) {
     // if there are any errors, return the error
     if (err)
     return done(err);
     
     // check to see if theres already a user with that email
     if (user) {
     return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
     } else {
     
     // if there is no user with that email
     // create the user
     var newUser = new User();
     
     // set the user's local credentials
     newUser.local.name = name;
     newUser.local.password = newUser.generateHash(password);
     
     // save the user
     newUser.save(function (err) {
     if (err)
     throw err;
     return done(null, newUser);
     });
     }
     
     });
     
     });
     
     })); */

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'name',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
            function (req, name, password, done) { // callback with email and password from our form

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                models.User.findOne({where: {'name': name}}).then(function (user) {
                    // if the user is found but the password is wrong            
                    user.comparePassword(password).then(function () {
                        return done(null, user);
                    }).catch(function () {
                        return done(null, false, 'Oops! Wrong password.'); // create the loginMessage and save it to session as flashdata
                    });
                }).catch(function (err) {
                    return done(null, false, err);
                });

            }));

};