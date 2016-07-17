'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Products', [
            {
                product_name: 'De novo DNA assembly',
                product_category: 'Additional content',
                price: 40,
                description_short: 'Assembling a DNA de novo is a core skill for every bioinformatician, so this pipeline is an absolute must-have.\
                With its samples, our guides and AMOS Hawkeye viewer, you will understand which factors drive \
                the complexity of DNA assembly process and how does it work in detail.\
                You will easily master the basic concepts of DNA assembly, such as contigs, k-value and De Brujin graphs.',
                description_long: 'De novo DNA assembly pipeline creates a new reference sequence from your reads.\
                The process resembles putting together a puzzle without looking at the image on the top of the box.\
                Of course, you will be assembling DNA of well-studied organisms - such as bacteria, fruit fly and yeast.\
                But just imagine how difficult it is to put together a totally new species!\
                There is no "answer key", so no one knows what is correct and what is still missing.',
                img_url: 'img/products/prod1.png',
                product_url: 'commerce.product_details1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_name: 'RNA realignment',
                product_category: 'Additional content',
                price: 40,
                description_short: 'RNA-Seq data contains information about transcriptome of a cell.\
                The most important application of this information is differential gene expression.\
                Learn how bioinformaticians can use RNA-Seq data to compare treated vs. untreated condition\
                and help doctors to make conclusions about efficiency of a drug.',
                description_long: 'Please note, however, that analysis of transcriptome is a lot more \
                difficult to grasp than genome analysis, as it involves splice junctions and dealing with the volatility\
                of gene expression levels. Hence, we highly recommend purchasing this module only after you \
                have mastered the knowledge from the DNA realignment pipeline at a sufficient level.',
                img_url: 'img/products/prod2.png',
                product_url: 'commerce.product_details1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                product_name: 'Extra storage space',
                product_category: 'Extra storage space',
                price: 10,
                description_short: 'Files with bioinformatics data can be very large, so you need to have\
                sufficient space to store them. This upgrade provides you with extra storage space\
                in addition to the 20 GB already available for you in our system for free.',
                description_long: 'Of course, you do not need any storage space for the standard genome\
                files, as well as for temporary files (like, for instance, .mpileup) - we will store them at no extra\
                cost in our cloud.',
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
                vCPUs can significantly speed up your data processing. By default your pipelines \
                are launched in shared virtual space, while by purchasing this upgrade option\
                you can scale up to a dedicated 8-vCPUs machine in a single click.',
                description_long: 'Please note, however, that the bioinformatics algorithms used in the pipelines\
                can be very complex and their performance may be determined by many different factors. We can not\
                guarantee that your pipeline runtime will scale linearly with the number of vCPUs.',
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

        return queryInterface.bulkDelete('UserCarts', null, {}).then(function () {
            return queryInterface.bulkDelete('Orders', null, {}).then(function () {
                return queryInterface.bulkDelete('Products', null, {});
            });
        });

    }
};
