'use strict';
module.exports = function(sequelize, DataTypes) {
  var UserCart = sequelize.define('UserCart', {
    //user_id: DataTypes.INTEGER,
    //product_id: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    },    
    underscored: true
  });
  return UserCart;
};