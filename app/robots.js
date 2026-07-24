/**
 * robots.txt — allow public crawl; block transactional booking + API paths.
 * Submit https://farwasalon.com/sitemap.xml in Google Search Console after deploys
 * that add blogs/location hubs (see docs/organic-tier-a-checklist.md).
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/book/confirmation',
          '/book/cancel',
          '/admin',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://farwasalon.com/sitemap.xml',
  }
}
