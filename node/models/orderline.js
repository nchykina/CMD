'use strict';
module.exports = function(sequelize, DataTypes) {
  var OrderLine = sequelize.define('OrderLine', {
    amount: DataTypes.FLOAT,    
  }, {
    classMethods: {
      associate: function(models) {
        OrderLine.belongsTo(models.Order);
        OrderLine.belongsTo(models.Product, {as: 'product'});
      }
    },    
    underscored: true
  });
  return OrderLine;
};