'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subject: {
        type: Sequelize.STRING
      },
      content: {
        type: Sequelize.TEXT
      },
      type: {
        type: Sequelize.STRING
      },
      sent_time: {
        type: Sequelize.DATE
      },
      read: {
        type: Sequelize.BOOLEAN
      },
      moved_to_trash_from: {
        type: Sequelize.STRING
      },
      owner_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Users', key: 'id' }
      },
      from_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Users', key: 'id' }
      },
      to_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Users', key: 'id' }
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
    return queryInterface.dropTable('Messages');
  }
};