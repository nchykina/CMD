'use strict';
module.exports = {  
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },      
      product_name: {
        type: Sequelize.STRING
      },
      product_category: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT
      },
      description_short: {
        type: Sequelize.TEXT
      },
      description_long: {
        type: Sequelize.TEXT
      },
      img_url: {
        type: Sequelize.STRING
      },
      product_url: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Products');
  }
};