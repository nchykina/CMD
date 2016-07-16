'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Products', [
            {
                product_name: 'De novo DNA assembly',
                product_category: 'Additional content',
                price: 40,
                description_short: 'De novo DNA assembly pipeline differs quite a bit from the techniques of alignment \
        to a reference genome in terms of complexity and time requirements. In case of de novo assembly, \
        the reference sequence of nucleotides is unknown, so the process resembles putting together a puzzle\
        without looking at the image on the top of the box.',
                description_long: 'Bioinformatics package that is used for de novo DNA assembly include is Velvet. Common de novo \
        assembly DNA techniques comprise De Brujin graphs, suffix trees\
        and different modifications of greedy algorithm.',
                img_url: 'img/products/prod1.png',
                product_url: 'commerce.product_details1',
                created_at: new Date(),
                updated_at: new Date()
            },
            
            {
                product_name: 'RNA realignment',
                product_category: 'Additional content',
                price: 40,
                description_short: 'RNA-Seq technique is used to analyze the continuously changing  \
                transcriptome data. The common problems faced are spliced junctions analysis, as well as \n\
                differential gene expression. Due to the small size of the reads, de novo assembly might be difficult,\n\
                 so RNA-Seq \
                is usually done either on a reference genome or on species with shorter DNA.',
                description_long: 'RNA-Seq is usually used to compare gene expression between conditions, such \
                as drug treatment vs untreated. Bioinformatic tools used for RNA alignment is Tophat, an extensions \
                on top of Bowtie, as well as specialized differential expression and splicing analysis tools.',
                img_url: 'img/products/prod2.png',
                product_url: 'commerce.product_details1',
                created_at: new Date(),
                updated_at: new Date()
            },
            
 
            
            {
                product_name: 'Extra storage space',
                product_category: 'Extra storage space',
                price: 10,
                description_short: 'Files with bioinformatics data are quite bulky, so you need \
        a convenient place to store them. This upgrade provides additional 20G of storage space\
        in addition to 5G of free storage space already available for you in our system. On average, \
        it allows you to have approximately 10 pipeline job results stored in the system.',
                description_long: 'From our experience, this is usually more than enough, as you \
        actually store only input and output files and do not need HDD space for genome files\
        (they are available for you on our server), as well as for files generated on\
        intermediary steps of the pipeline (like .mpileup files, for instance).',
                img_url: 'img/products/prod4.png',
                product_url: 'commerce.product_details2',
                created_at: new Date(),
                updated_at: new Date()
            },
            
            {
                product_name: 'Extra vCPUs',
                product_category: 'Processing capacity',
                price: 100,
                description_short: 'A lot of bioinformatics software is multithreaded, so adding\
        vCPUs can speed up the data processing significantly. By default your pipelines \
        are launched on a shared virtual capacity, and by purchasing this upgrade option\
        you can scale up to a guaranteed 8-vCPUs machine in a single click.',
                description_long: 'Of course, not every processing algorithm can be parallelized, \
        so there is no linear dependency between the number of vCPUs and execution speed. However, \
        your pipelines execution speed will definitely increase, as most tools support \
        multithreading.',
                img_url: 'img/products/prod5.png',
                product_url: 'commerce.product_details3',
                created_at: new Date(),
                updated_at: new Date()
            }
        ], {});        
    },
    down: function (queryInterface, Sequelize) {
        /*
         Add reverting commands here.
         Return a promise to correctly handle asynchronicity.
         
         Example:
         return queryInterface.bulkDelete('Person', null, {});
         */
        queryInterface.bulkDelete('UserCarts', null, {});
        queryInterface.bulkDelete('Orders', null, {});
        queryInterface.bulkDelete('Products', null, {});
        
    }
};
