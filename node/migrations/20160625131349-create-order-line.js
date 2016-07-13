'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('OrderLines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      amount: {
        type: Sequelize.FLOAT
      },
      order_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Orders', key: 'id' }
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Products', key: 'id' }
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
    return queryInterface.dropTable('OrderLines');
  }
};