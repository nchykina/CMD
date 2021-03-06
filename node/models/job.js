'use strict';
module.exports = function(sequelize, DataTypes) {
  var Job = sequelize.define('Job', {
    name: DataTypes.STRING,
    jobtype: DataTypes.STRING,
    status: DataTypes.STRING,
    work_dir: DataTypes.STRING,
    seq_species: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Job.belongsTo(models.User, {as: 'owner'});
        Job.belongsToMany(models.File, 
        {
            through: {
                model: models.JobFile,
                attributes: ['fileid', 'filenum']
            },
            foreignKey: 'job_id',
            as: 'files',
            onDelete: 'cascade'
        });
        Job.hasMany(models.Step, {as: 'steps', onDelete: 'cascade' });
      }
    },    
    underscored: true
  });
  return Job;
};