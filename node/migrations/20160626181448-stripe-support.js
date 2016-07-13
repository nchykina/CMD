'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('Users','stripe_customer_id',Sequelize.STRING);
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Users','stripe_customer_id');
  }
};
