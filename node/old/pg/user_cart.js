var sequelize = require('../../config/pg');
var Sequelize = require('sequelize');
var User = require('../../models/pg/user');
var Product = require('../../models/pg/product');

var UserCart = sequelize.define('user_cart', {
    user_id: {
        type: Sequelize.NUMBER,
        unique: 'cart_key'
    },
    product_id: {
        type: Sequelize.NUMBER,
        unique: 'cart_key'
    },    
    addedDate: Sequelize.DATE,    
});

User.belongsToMany(Product, {
    through: {
        model: UserCart,
        unique: false
    },
    foreignKey: 'user_id'
});

Product.belongsToMany(User, {
    through: {
        model: UserCart,
        unique: false
    },
    foreignKey: 'product_id'
});

module.exports = UserCart;
