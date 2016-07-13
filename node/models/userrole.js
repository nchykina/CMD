'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserRole = sequelize.define('UserRole', {
    user_id: DataTypes.INTEGER,
    role_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },    
    underscored: true
  });
  return UserRole;
};