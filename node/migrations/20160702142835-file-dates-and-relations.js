'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('Files', 'date_uploaded');
        queryInterface.removeColumn('Files', 'job_id');
        queryInterface.addColumn('Files', 'started_at', Sequelize.DATE);
        queryInterface.addColumn('Files', 'finished_at', Sequelize.DATE);

        queryInterface.createTable('JobFiles', {
            job_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Jobs', key: 'id'},
                primaryKey: true,
            },
            file_id: {
                type: Sequelize.INTEGER,
                references: {model: 'Files', key: 'id'},
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
    down: function (queryInterface, Sequelize) {
        queryInterface.removeColumn('Files', 'started_at');
        queryInterface.removeColumn('Files', 'finished_at');
        queryInterface.addColumn('Files', 'date_uploaded', Sequelize.DATE);
        queryInterface.addColumn('Files', 'job_id', {
            type: Sequelize.INTEGER,
            references: {model: 'Jobs', key: 'id'}
        });
        queryInterface.dropTable('JobFiles');
    }
};
