import TeamClient from './team-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: 'Our Team — Farwa Beauty Salon, Karachi',
  description: `Meet the team behind ${YEARS_ACTIVE}+ years of beauty expertise at Farwa Beauty Salon, PECHS Block 2, Karachi.`,
  alternates: { canonical: 'https://farwasalon.com/team' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function TeamPage() {
  return <TeamClient />
}
