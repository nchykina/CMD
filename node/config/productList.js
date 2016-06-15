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
        description_short: 'This upgrade allows you to upload files up to 10G to our system, while \
        the free file size upload limit is 1G. If you need to upload larger files by any chance, \
        please let us know, and we will figure out a way how to do it for you. Larger file size \
        will allow your analysis to have good coverage with the reads.',
        description_long: 'Coverage is a very important characteristic of the file with reads, as \
        it ensures that the information extracted from reads is statistically significant. Good coverage \
        for realignment pipeline is around 20-40x for the whole genome, so the larger is the genome you \
        analyze, the larger should be your files with reads.', 
         img_url: 'img/products/prod3.png'},
     
    
        {productName: 'Extra storage size', productCategory: 'Extra upload/storage size', price: 40,
        description_short: 'Files with bioinformatics data are quite bulky, so you need \
        a convenient place to store them. This upgrade provides additional 30G of storage space\
        in addition to 10G of free storage space already available for you in our system. On average, \
        it allows you to have approximately 10 pipeline job results stored in the system.',
        description_long: 'From our experience, this is usually more than enough, as you \
        actually store only input and output files and do not need HDD space for genome files\
        (they are available for you on our server), as well as for files generated on\
        intermediary steps of the pipeline (like .mpileup files, for instance).',
        img_url: 'img/products/prod4.png'},
    
   
        {productName: 'Extra vCPUs', productCategory: 'Processing capacity', price: 50,
        description_short: 'A lot of bioinformatics software is multithreaded, so adding\
        vCPUs can speed up the data processing significantly. By default your pipelines \
        are launched in an 8-vCPUs virtual container, and by purchasing this upgrade option\
        you can scale up to a 16-vCPUs machine in a single click.', 
        description_long: 'Of course, not every processing algorithm can be parallelized, \
        so there is no linear dependency between the number of vCPUs and execution speed. However, \
        bioinformatics is somewhat special here, as the majority of standard steps in every \
        processing pipeline still can be launched in parallel. Therefore, parallel computing \
        skills are widespread and highly demanded among bioinformaticians.', 
        img_url: 'img/products/prod5.png'},
    
    
        {productName: 'Enable MPI', productCategory: 'Processing capacity', price: 60,
        description_short: 'MPI is a communication protocol for programming parallel computers\
         that remains a de facto standard for high performance computing today. Purchasing this upgrade \
        will allow you to launch your pipelines using MPI technology, which will speed up the process\
        significantly.', 
        description_long: 'MPI pipeline jobs are approximately 10x faster the standard ones, as they\
         use RDMA technology (direct access to RAM across computing units). This tremendously affects \
        the speed of calculations, as the data should not be transferred across nodes in the cluster \
        any more during calculations, so the whole cluster turns into a single extra-powerful computer.', 
        img_url: 'img/products/prod6.png'},
    
    
        {productName: 'Add a custom pipeline', productCategory: 'Custom pipelines', price: 100,
        description_short: 'We can migrate the functionality of any of your pipelines to our \
        infrastructure. You can use any software and datasets you like, and you do not need to \
        configure anything in your browser yourself to make this transition - we will do the job for you.',
        description_long: 'The process works the following way: you send us either your script or \
        simply a textual description of what your pipeline does and which software/utilities you use for this.\
        We will make it run in Apache Mesos container and optimize it for parallel processing. As a result,\
        you will have private access to your pipeline via a convenient browser interface, plus powerful\
        infrastructure to run it efficiently.', 
        img_url: 'img/products/prod7.png'}
    ];

module.exports = productList;