import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';

const sitemap = new SitemapStream({ hostname: 'https://polsage.in' });

sitemap.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemap.write({ url: '/about', changefreq: 'weekly', priority: 0.8 });
sitemap.end();

streamToPromise(sitemap)
  .then((data) => {
    const writeStream = createWriteStream('./public/sitemap.xml');
    writeStream.write(data.toString());
    writeStream.end();
  })
  .catch(console.error);
