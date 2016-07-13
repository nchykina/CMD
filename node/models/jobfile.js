'use strict';
module.exports = function(sequelize, DataTypes) {
  var JobFile = sequelize.define('JobFile', {
    filetype: DataTypes.STRING, //input/output
    filenum: DataTypes.INTEGER //sequential file number
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

