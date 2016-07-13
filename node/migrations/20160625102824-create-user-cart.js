'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('UserCarts', {      
      user_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Users', key: 'id' },
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Products', key: 'id' },
        primaryKey: true,
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
    return queryInterface.dropTable('UserCarts');
  }
};