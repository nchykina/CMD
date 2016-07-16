'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return Sequelize.Promise.all([
        queryInterface.addColumn('Files', 'description', {type: Sequelize.TEXT}),
        queryInterface.addColumn('Files', 'fileuse', {type: Sequelize.STRING})
      ]);
  },

  down: function (queryInterface, Sequelize) {
      return Sequelize.Promise.all([
        queryInterface.removeColumn('Files', 'description'),
        queryInterface.removeColumn('Files', 'fileuse')
      ]);
  }
};
