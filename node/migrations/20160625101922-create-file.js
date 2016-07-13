'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Files', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      date_uploaded: {
        type: Sequelize.DATE
      },
      filesize: {
        type: Sequelize.INTEGER
      },
      filetype: {
        type: Sequelize.STRING
      },
      phys_path: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      job_id: {
        type: Sequelize.INTEGER,
        references: {model: 'Jobs', key: 'id' }
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Files');
  }
};