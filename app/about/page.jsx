import AboutClient from './about-client'
import JsonLd from '../json-ld'
import { YEARS_ACTIVE } from '../../src/data.js'
import { buildFounderSchema } from '../../lib/business-schema.js'
import { pageSocialMeta } from '../../lib/page-metadata.js'

const title = `About Us — ${YEARS_ACTIVE}+ Years of Beauty Expertise in PECHS Karachi`
const description = `From a single chair in 2008 to a full-service studio — meet Rubina and the team behind ${YEARS_ACTIVE}+ years at Farwa Beauty Salon, PECHS, Karachi.`

export const metadata = {
  title,
  description,
  alternates: { canonical: '/about' },
  ...pageSocialMeta({
    title,
    description,
    path: '/about',
    imageAlt: 'About Farwa Beauty Salon — PECHS Karachi since 2008',
  }),
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={buildFounderSchema()} />
      <AboutClient />
    </>
  )
}
