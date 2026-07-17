import { buildSitemapIndexXml, xmlResponse } from '../../lib/sitemap-xml.js'
import { getSitemapIndexEntries } from '../../lib/sitemap-data.js'

/** Prerender at build time — avoids cold-start 500s for crawlers. */
export const dynamic = 'force-static'
export const revalidate = 86400

export function GET() {
  return xmlResponse(buildSitemapIndexXml(getSitemapIndexEntries()))
}
