var cfg = require('../config/config');

var Sequelize = require('sequelize');

var sequelize = new Sequelize(cfg.db_url);

sequelize
  .authenticate()
  .then(function() {
    console.log('Database connection has been established successfully.');
    
    var all_models = require('../models/pg/all_models');
    sequelize.sync({ force: true, match: /_dev$/ }).then(function(){
        console.log('Database syncronization successful');
    }).catch(function(err){
        console.error('Synchronization error: '+err);        
    });
        
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

module.exports = sequelize;