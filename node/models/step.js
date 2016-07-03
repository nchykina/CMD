'use strict';
module.exports = function(sequelize, DataTypes) {
  var Step = sequelize.define('Step', {
    command: DataTypes.STRING,
    arguments: DataTypes.TEXT,
    status: DataTypes.STRING,
    taskid: DataTypes.STRING,
    cpu: DataTypes.FLOAT,
    memory: DataTypes.FLOAT,
    order: DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: function(models) {
        Step.belongsTo(models.Job);
      }
    },    
    underscored: true
  });
  return Step;
};