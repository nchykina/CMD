var env = process.env.NODE_ENV || 'development';
module.exports = require('./config/config.json')[env];

