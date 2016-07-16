'use strict';
module.exports = function(sequelize, DataTypes) {
  var File = sequelize.define('File', {
    name: DataTypes.STRING,
    started_at: DataTypes.DATE,
    finished_at: DataTypes.DATE,
    filesize: DataTypes.INTEGER,
    filetype: DataTypes.STRING, //type of file (fasta,fastq,etc)
    fileuse: DataTypes.STRING, //input/output
    description: DataTypes.TEXT,
    status: DataTypes.STRING,
    phys_path: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {        
        File.belongsTo(models.User, {as: 'owner'});
        File.belongsToMany(models.Job,
        {
            through: {
                model: models.JobFile,
                attributes: ['fileid', 'filenum']
            },
            foreignKey: 'file_id',
            as: 'jobs',
            onDelete: 'cascade'
        });
      }
    },    
    underscored: true
  });
  return File;
};