var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');
var Job = require('../../models/pg/job');

var Step = sequelize.define('step', {
    date_created: Sequelize.DATE,    
    date_finished: Sequelize.DATE,
    command: Sequelize.STRING,
    status: Sequelize.STRING,
    taskid: Sequelize.STRING,    
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

Step.belongsTo(Job);

module.exports = Step;