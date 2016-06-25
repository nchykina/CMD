var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');
var Job = require('../../models/pg/job');

var File = sequelize.define('file', {
    /* id: { 
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    }, */
    name: Sequelize.STRING,
    date_created: Sequelize.DATE,
    date_uploaded: Sequelize.DATE,
    filesize: Sequelize.INTEGER,
    filetype: Sequelize.STRING, //input/output/intermediate
    phys_path: Sequelize.STRING,
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

File.belongsTo(Job);

module.exports = File;

