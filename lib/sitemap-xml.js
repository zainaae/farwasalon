/** Build urlset or sitemapindex XML for route handlers. */
export function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildUrlsetXml(entries) {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${escapeXml(e.lastModified)}</lastmod>
    <changefreq>${escapeXml(e.changeFrequency)}</changefreq>
    <priority>${escapeXml(String(e.priority))}</priority>
  </url>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

export function buildSitemapIndexXml(sitemaps) {
  const items = sitemaps
    .map(
      (s) => `  <sitemap>
    <loc>${escapeXml(s.loc)}</loc>
    <lastmod>${escapeXml(s.lastModified)}</lastmod>
  </sitemap>`,
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${items}
</sitemapindex>`
}

export function xmlResponse(body) {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
