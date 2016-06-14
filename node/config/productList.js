    var productList = [{productName: 'De novo assembly', productCategory: 'Additional content', price: 10,
        description_short: 'De novo assembly pipeline differs quite a bit from the techniques of alignment \
        to a reference genome in terms of complexity and time requirements. In case of de novo assembly, \
        the reference sequence of nucleotides is unknown, so the process resembles putting together a puzzle\
        without looking at the image on the top of the box.',
        description_long:'Bioinformatics packages used for de novo assembly include Tophat, Trinity and Velvet. Common de novo \
        assembly techniques comprise De Brujin graphs, suffix trees\
        and different modifications of greedy algorithm.',
        img_url: 'img/products/prod1.png'},
        
        
        {productName: 'RNA resequencing', productCategory: 'Additional content', price: 20,
        description_short: 'RNA sequencing techniques are used to analyze the continually changing cellular \
        transcriptome. Due to the small size of the reads, de novo assembly might be difficult, so RNA-Seq \
        is usually done either on a reference genome or on species with shorter DNA (bacteria, viruses, yeast etc.).',
        description_long: 'RNA sequencing is usually used to compare gene expression between conditions, such \
        as drug treatment vs untreated. Bioinformatic tools used for RNA sequencing include both common alignment\
         tools like Bowtie/BWA, as well as specialized differential expression and splicing analysis tools.',
        img_url: 'img/products/prod2.png'},
        
        
        {productName: 'Extra upload size', productCategory: 'Extra upload/storage size', price: 30,
        description_short: '', description_long: '', img_url: ''},
        {productName: 'Extra storage size', productCategory: 'Extra upload/storage size', price: 40,
        description_short: '', description_long: '', img_url: ''},
        {productName: 'Extra vCPUs', productCategory: 'Processing capacity', price: 50,
        description_short: '', description_long: '', img_url: ''},
        {productName: 'Enable MPI', productCategory: 'Processing capacity', price: 60,
        description_short: '', description_long: '', img_url: ''},
        {productName: 'Custom pipelines', productCategory: 'Add a custom pipeline', price: 100,
        description_short: '', description_long: '', img_url: ''}
    ];

module.exports = productList;