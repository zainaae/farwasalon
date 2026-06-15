import TeamClient from './team-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: `Our Team — ${YEARS_ACTIVE}+ Years of Expertise`,
  description: `Meet Rubina, founder of Farwa Beauty Salon — ${YEARS_ACTIVE}+ years of bridal, skincare, and brow expertise in PECHS, Karachi. Additional stylists by appointment.`,
  alternates: { canonical: '/team' },
  openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Meet the team at Farwa Beauty Salon PECHS Karachi' }] },
}

export default function TeamPage() {
  return <TeamClient />
}
