'use strict';
module.exports = function(sequelize, DataTypes) {
  var Role = sequelize.define('Role', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Role.belongsToMany(models.User, {through: models.UserRole, foreignKey: 'role_id'});
      }
    },    
    underscored: true
  });
  return Role;
};