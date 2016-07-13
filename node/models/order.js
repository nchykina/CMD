'use strict';
module.exports = function(sequelize, DataTypes) {
  var Order = sequelize.define('Order', {
    payment_type: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Order.belongsTo(models.User);
        Order.hasMany(models.OrderLine,{as: "lines"});
      }
    },    
    underscored: true
  });
  return Order;
};