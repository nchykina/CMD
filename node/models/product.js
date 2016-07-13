'use strict';
module.exports = function(sequelize, DataTypes) {
  var Product = sequelize.define('Product', {
    product_name: DataTypes.STRING,
    product_category: DataTypes.STRING,
    price: DataTypes.FLOAT,
    description_short: DataTypes.TEXT,
    description_long: DataTypes.TEXT,
    img_url: DataTypes.STRING,
    product_url: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        Product.belongsToMany(models.User, {through: models.UserCart, foreignKey: 'product_id'});        
      }
    },    
    underscored: true
  });
  return Product;
};