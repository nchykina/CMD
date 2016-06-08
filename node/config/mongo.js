var mongoose = require('mongoose');

var config = {
    passport_secret: 'myJWMsecret',
    passport_db: 'mongodb://192.168.1.7/passport'
};

config.passport_mongo = mongoose.connect(config.passport_db);

module.exports = config;

