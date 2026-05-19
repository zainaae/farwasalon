import { buildSitemapIndexXml, xmlResponse } from '../../lib/sitemap-xml.js'
import { getSitemapIndexEntries } from '../../lib/sitemap-data.js'

export function GET() {
  return xmlResponse(buildSitemapIndexXml(getSitemapIndexEntries()))
}
