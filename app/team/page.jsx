import TeamClient from './team-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: `Our Team — ${YEARS_ACTIVE}+ Years of Expertise`,
  description: `Meet Rubina and the team behind ${YEARS_ACTIVE}+ years of beauty expertise at Farwa Beauty Salon, PECHS Block 3, Karachi. Specialists in bridal, skincare, and brow artistry.`,
  alternates: { canonical: '/team' },
  openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Meet the team at Farwa Beauty Salon PECHS Karachi' }] },
}

export default function TeamPage() {
  return <TeamClient />
}
