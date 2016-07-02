'use strict';
module.exports = function(sequelize, DataTypes) {
  var JobFile = sequelize.define('JobFile', {
    //file_id: DataTypes.INTEGER,
    //job_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },    
    underscored: true
  });
  return JobFile;
};

