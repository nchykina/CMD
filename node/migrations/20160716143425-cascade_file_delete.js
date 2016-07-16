'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return Sequelize.Promise.all([
        queryInterface.sequelize.query(
            'ALTER TABLE "JobFiles" DROP CONSTRAINT "JobFiles_file_id_fkey" RESTRICT;\
                \
             ALTER TABLE "JobFiles" ADD CONSTRAINT "JobFiles_file_id_fkey" \
             FOREIGN KEY (file_id) \
             REFERENCES "Files" (id) MATCH SIMPLE \
             ON UPDATE NO ACTION ON DELETE CASCADE;'),
        
        queryInterface.sequelize.query(
            'ALTER TABLE "JobFiles" DROP CONSTRAINT "JobFiles_job_id_fkey" RESTRICT;\
                \
             ALTER TABLE "JobFiles" ADD CONSTRAINT "JobFiles_job_id_fkey" \
             FOREIGN KEY (job_id) \
             REFERENCES "Jobs" (id) MATCH SIMPLE \
             ON UPDATE NO ACTION ON DELETE CASCADE;'),
          
        queryInterface.sequelize.query(
            'ALTER TABLE "Steps" DROP CONSTRAINT "Steps_job_id_fkey" RESTRICT;\
                \
             ALTER TABLE "Steps" ADD CONSTRAINT "Steps_job_id_fkey" \
             FOREIGN KEY (job_id) \
             REFERENCES "Jobs" (id) MATCH SIMPLE \
             ON UPDATE NO ACTION ON DELETE CASCADE;'),
      ]);
  },

  down: function (queryInterface, Sequelize) {
      return Sequelize.Promise.all([
        queryInterface.sequelize.query(
            'ALTER TABLE "JobFiles" DROP CONSTRAINT "JobFiles_file_id_fkey" RESTRICT;\
                \
             ALTER TABLE "JobFiles" ADD CONSTRAINT "JobFiles_file_id_fkey" \
             FOREIGN KEY (file_id) \
             REFERENCES "Files" (id) MATCH SIMPLE \
             ON UPDATE NO ACTION ON DELETE NO ACTION;'),
        
        queryInterface.sequelize.query(
            'ALTER TABLE "JobFiles" DROP CONSTRAINT "JobFiles_job_id_fkey" RESTRICT;\
                \
             ALTER TABLE "JobFiles" ADD CONSTRAINT "JobFiles_job_id_fkey" \
             FOREIGN KEY (job_id) \
             REFERENCES "Jobs" (id) MATCH SIMPLE \
             ON UPDATE NO ACTION ON DELETE NO ACTION;'),
        
        queryInterface.sequelize.query(
            'ALTER TABLE "Steps" DROP CONSTRAINT "Steps_job_id_fkey" RESTRICT;\
                \
             ALTER TABLE "Steps" ADD CONSTRAINT "Steps_job_id_fkey" \
             FOREIGN KEY (job_id) \
             REFERENCES "Jobs" (id) MATCH SIMPLE \
             ON UPDATE NO ACTION ON DELETE NO ACTION;'),
      ]);
  }
};