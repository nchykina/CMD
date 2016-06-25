'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Steps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      command: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      taskid: {
        type: Sequelize.STRING
      },
      job_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Jobs', key: 'id' }
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
    return queryInterface.dropTable('Steps');
  }
};