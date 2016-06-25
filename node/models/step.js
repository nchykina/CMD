'use strict';
module.exports = function(sequelize, DataTypes) {
  var Step = sequelize.define('Step', {
    command: DataTypes.STRING,
    status: DataTypes.STRING,
    taskid: DataTypes.STRING
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