var File = require('./file');
var Job = require('./job');
var Role = require('./role');
var User = require('./user');
var Step = require('./step');

var sequelize = require('../../config/pg');

module.exports = sequelize;
