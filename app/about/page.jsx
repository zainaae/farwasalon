import AboutClient from './about-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: `About Us — ${YEARS_ACTIVE}+ Years of Beauty Expertise in PECHS Karachi`,
  description: `From a single chair in 2008 to a full-service studio — meet Rubina and the team behind ${YEARS_ACTIVE}+ years at Farwa Beauty Salon, PECHS Block 2, Karachi.`,
  alternates: { canonical: '/about' },
  openGraph: { type: 'website', images: [{ url: '/bridal.jpg', width: 1200, height: 630, alt: 'About Farwa Beauty Salon — trusted beauty home in PECHS Karachi since 2008' }] },
}

export default function AboutPage() {
  return <AboutClient />
}
