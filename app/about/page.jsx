import AboutClient from './about-client'
import JsonLd from '../json-ld'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: `About Us — ${YEARS_ACTIVE}+ Years of Beauty Expertise in PECHS Karachi`,
  description: `From a single chair in 2008 to a full-service studio — meet Rubina and the team behind ${YEARS_ACTIVE}+ years at Farwa Beauty Salon, PECHS, Karachi.`,
  alternates: { canonical: '/about' },
  openGraph: { type: 'website', images: [{ url: '/bridal.jpg', width: 1200, height: 630, alt: 'About Farwa Beauty Salon — trusted beauty home in PECHS Karachi since 2008' }] },
}

const founderSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rubina',
  jobTitle: 'Founder & Lead Beautician',
  worksFor: {
    '@type': 'BeautySalon',
    name: 'Farwa Beauty Salon',
  },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={founderSchema} />
      <AboutClient />
    </>
  )
}
