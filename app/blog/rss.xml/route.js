import { BLOG_POSTS } from '../../../src/blog-data.js'
import { SITE_ORIGIN, SALON_NAME } from '../../../lib/business-schema.js'
import { escapeXml } from '../../../lib/sitemap-xml.js'

function buildRssItem(post) {
  const link = `${SITE_ORIGIN}/blog/${post.slug}`
  const pubDate = new Date(`${post.date}T12:00:00Z`).toUTCString()
  return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
      ${post.author ? `<author>${escapeXml(post.author)}</author>` : ''}
    </item>`
}

export function GET() {
  const items = BLOG_POSTS.map(buildRssItem).join('\n')
  const lastBuild = new Date().toUTCString()
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SALON_NAME)} Blog</title>
    <link>${SITE_ORIGIN}/blog</link>
    <description>Beauty tips, bridal guides, and salon insights from ${escapeXml(SALON_NAME)} in PECHS, Karachi.</description>
    <language>en-pk</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_ORIGIN}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
