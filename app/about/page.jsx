import AboutClient from './about-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: 'Our Story',
  description: `From a single chair in 2008 to a full-service studio in PECHS Block 2, Karachi — meet Rubina and the story behind ${YEARS_ACTIVE}+ years at Farwa.`,
  alternates: { canonical: '/about' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function AboutPage() {
  return <AboutClient />
}
