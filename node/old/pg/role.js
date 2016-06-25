var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');

var Role = sequelize.define('role', {
    name: Sequelize.STRING,        
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

module.exports = Role;


