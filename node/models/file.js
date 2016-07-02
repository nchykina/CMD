'use strict';
module.exports = function(sequelize, DataTypes) {
  var File = sequelize.define('File', {
    name: DataTypes.STRING,
    started_at: DataTypes.DATE,
    finished_at: DataTypes.DATE,
    filesize: DataTypes.INTEGER,
    filetype: DataTypes.STRING,
    status: DataTypes.STRING,
    phys_path: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {        
        File.belongsTo(models.User, {as: 'owner'});
        File.belongsToMany(models.Job, {through: models.JobFile, foreignKey: 'file_id', as: 'jobs'});
      }
    },    
    underscored: true
  });
  return File;
};