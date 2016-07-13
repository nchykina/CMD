var File = require('./file');
var Job = require('./job');
var Role = require('./role');
var User = require('./user');
var Step = require('./step');
var Product = require('./product');
var CartItem = require('./user_cart');

var sequelize = require('../../config/pg');

var product = require('../models/pg/product');
        //regenerate data
        for(var pr in productList){          
            
           product.create(pr).catch(function(err)
                   {
                       console.error('Error creating product: '+err);
                       return;
                   });  
        }

module.exports = sequelize;
