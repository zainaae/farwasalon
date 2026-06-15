import { buildUrlsetXml, xmlResponse } from '../../lib/sitemap-xml.js'
import { getLocationSitemapEntries } from '../../lib/sitemap-data.js'

export function GET() {
  return xmlResponse(buildUrlsetXml(getLocationSitemapEntries()))
}
