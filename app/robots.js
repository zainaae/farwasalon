/**
 * robots.txt — allow public crawl; block transactional booking + API paths.
 * Submit https://farwasalon.com/sitemap.xml in Google Search Console after deploys
 * that add blogs/location hubs (see docs/organic-tier-a-checklist.md).
 */

const ORIGIN = 'https://farwasalon.com'
const LLMS_TXT = `${ORIGIN}/llms.txt`

export default function robots() {
  return {
    rules: [
      {
        /*
         * The trailing newline is deliberate, and it is the only way to get a
         * comment into this file.
         *
         * public/llms.txt has been accurate and completely unreferenced —
         * nothing on the site or in robots.txt pointed at it, so an assistant
         * had no way to discover it existed. robots.txt is where a crawler
         * looks first, but Next's metadata route serialiser only ever emits
         * User-Agent / Allow / Disallow / Crawl-delay / Host / Sitemap
         * (next/dist/build/webpack/loaders/metadata/resolve-route-data.js —
         * verified against next@16.2.11), and there is no field for a free-form
         * line. Smuggling it through the user-agent string puts the comment on
         * its own line directly under `User-Agent: *`, which is legal
         * robots.txt (RFC 9309 §2.2.1) and is where the convention puts it.
         *
         * If Next ever gains a real escape hatch, move this and delete the hack.
         */
        userAgent: `*\n# llms.txt — plain-text summary of this salon for AI assistants: ${LLMS_TXT}`,
        /* `/` already permits it; naming the path again makes the pointer
           machine-readable for anything that parses directives but not
           comments. */
        allow: ['/', '/llms.txt'],
        disallow: [
          '/api/',
          '/book/confirmation',
          '/book/cancel',
          '/admin',
          '/admin/',
        ],
      },
    ],
    sitemap: `${ORIGIN}/sitemap.xml`,
  }
}
