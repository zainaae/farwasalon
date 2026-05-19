import JsonLd from '../../json-ld.jsx'
import { buildLocationPageGraph } from '../../../lib/business-schema.js'
import { CAT_FAQS } from '../../../src/data.js'

export default function LocationServiceSchema({ data, slug }) {
  const faqs = CAT_FAQS[data.service.category]?.slice(0, 3) ?? []
  const schema = buildLocationPageGraph({
    service: data.service,
    location: data.location,
    slug,
    faqs,
  })
  return <JsonLd data={schema} />
}
