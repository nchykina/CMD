'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('Files', 'filesize', {type: Sequelize.BIGINT});
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.changeColumn('Files', 'filesize', {type: Sequelize.INTEGER});
  }
};
