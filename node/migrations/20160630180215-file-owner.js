'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Files','owner_id',Sequelize.INTEGER);
    queryInterface.addColumn('Files','status',Sequelize.STRING);
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Files','owner_id');
    queryInterface.removeColumn('Files','status');
  }
};
