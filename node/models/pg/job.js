var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');
var User = require('../../models/pg/user');

var Job = sequelize.define('job', {    
    name: Sequelize.STRING,
    date_created: Sequelize.DATE,
    date_updated: Sequelize.DATE,
    date_finished: Sequelize.DATE,
    jobtype: Sequelize.STRING,
    status: Sequelize.STRING,
    seq_species: Sequelize.STRING,    
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

Job.belongsTo(User);

module.exports = Job;