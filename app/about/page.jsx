import AboutClient from './about-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: 'Our Story — Farwa Beauty Salon, Karachi',
  description: `From a single chair in 2008 to a full-service studio in PECHS Block 2, Karachi — meet Rubina and the story behind ${YEARS_ACTIVE}+ years at Farwa.`,
  alternates: { canonical: 'https://farwasalon.com/about' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function AboutPage() {
  return <AboutClient />
}
