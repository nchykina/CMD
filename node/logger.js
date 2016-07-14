var winston = require('winston');
var path = require('path');
var cfg = require('./config');

winston.emitErrs = true;

var logger = new winston.Logger({
    transports: [
        new winston.transports.File(cfg.log.file),
        new winston.transports.Console(cfg.log.console)
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};