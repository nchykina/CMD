'use strict';
module.exports = function(sequelize, DataTypes) {
  var File = sequelize.define('File', {
    name: DataTypes.STRING,
    date_uploaded: DataTypes.DATE,
    filesize: DataTypes.INTEGER,
    filetype: DataTypes.STRING,
    phys_path: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        File.belongsTo(models.Job);
      }
    },    
    underscored: true
  });
  return File;
};