var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');

var Product = sequelize.define('product', {
    productName: Sequelize.STRING,    
    productCategory: Sequelize.STRING,
    price: Sequelize.NUMBER,    
    productId: Sequelize.NUMBER,
    description_short: Sequelize.STRING,
    description_long: Sequelize.STRING,    
    img_url: Sequelize.STRING,
    product_url: Sequelize.STRING
}, {
    freezeTableName: true // Model tableName will be the same as the model name
});

module.exports = Product;
