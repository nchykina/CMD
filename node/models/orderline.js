'use strict';
module.exports = function(sequelize, DataTypes) {
  var OrderLine = sequelize.define('OrderLine', {
    payment_type: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        OrderLine.belongsTo(models.Order);
        OrderLine.belongsTo(models.Product);
      }
    },    
    underscored: true
  });
  return OrderLine;
};