import { buildUrlsetXml, xmlResponse } from '../../lib/sitemap-xml.js'
import { getBlogSitemapEntries } from '../../lib/sitemap-data.js'

export function GET() {
  return xmlResponse(buildUrlsetXml(getBlogSitemapEntries()))
}
