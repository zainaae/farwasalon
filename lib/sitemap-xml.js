/** Build urlset or sitemapindex XML for route handlers. */
export function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1'

/** Google reads image entries out of the regular sitemap — a separate image
 *  sitemap file is legacy and carries no extra signal. An entry may supply
 *  `images: [{ url, caption }]`. The namespace is declared only when some entry
 *  actually uses it, so sitemaps without images stay byte-identical. */
function imageNodes(images) {
  if (!images?.length) return ''
  return images
    .map(
      (img) => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>${
        img.caption ? `
      <image:caption>${escapeXml(img.caption)}</image:caption>` : ''
      }
    </image:image>`,
    )
    .join('')
}

export function buildUrlsetXml(entries) {
  const hasImages = entries.some((e) => e.images?.length)
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${escapeXml(e.lastModified)}</lastmod>
    <changefreq>${escapeXml(e.changeFrequency)}</changefreq>
    <priority>${escapeXml(String(e.priority))}</priority>${imageNodes(e.images)}
  </url>`,
    )
    .join('\n')
  const imageNs = hasImages ? `\n        xmlns:image="${IMAGE_NS}"` : ''
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>
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
