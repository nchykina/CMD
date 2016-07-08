var sm = require('sitemap');
 
var sitemap = sm.createSitemap ({
      hostname: 'http://ngspipeline.com',
      cacheTime: 600000,        // 600 sec - cache purge period 
      urls: [
        { url: '/blog/article4',  changefreq: 'daily', priority: 0.7 },
        { url: '/blog/article1',  changefreq: 'daily', priority: 0.7 },
        { url: '/blog/article5',  changefreq: 'daily', priority: 0.7 } 
      ]
    });
    
    
module.exports = sitemap;
 