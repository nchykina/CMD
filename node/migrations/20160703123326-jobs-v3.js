'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('JobFiles', 'filenum', Sequelize.INTEGER);
    queryInterface.addColumn('JobFiles', 'filetype', Sequelize.STRING);
    queryInterface.addColumn('Steps', 'cpu', Sequelize.FLOAT);
    queryInterface.addColumn('Steps', 'memory', Sequelize.FLOAT);
    queryInterface.addColumn('Steps', 'arguments', Sequelize.TEXT);
    queryInterface.addColumn('Steps', 'order', Sequelize.INTEGER);
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('JobFiles', 'filetype');
    queryInterface.removeColumn('JobFiles', 'filenum');
    queryInterface.removeColumn('Steps', 'cpu');
    queryInterface.removeColumn('Steps', 'memory');
    queryInterface.removeColumn('Steps', 'arguments');
    queryInterface.removeColumn('Steps', 'order');
  }
};
