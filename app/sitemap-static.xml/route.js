import { buildUrlsetXml, xmlResponse } from '../../lib/sitemap-xml.js'
import { getStaticSitemapEntries } from '../../lib/sitemap-data.js'

export function GET() {
  return xmlResponse(buildUrlsetXml(getStaticSitemapEntries()))
}
