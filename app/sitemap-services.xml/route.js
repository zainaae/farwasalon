import { buildUrlsetXml, xmlResponse } from '../../lib/sitemap-xml.js'
import { getServiceCategorySitemapEntries } from '../../lib/sitemap-data.js'

export function GET() {
  return xmlResponse(buildUrlsetXml(getServiceCategorySitemapEntries()))
}
