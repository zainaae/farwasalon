import TeamClient from './team-client'
import { YEARS_ACTIVE } from '../../src/data.js'

export const metadata = {
  title: 'Our Team',
  description: `Meet the team behind ${YEARS_ACTIVE}+ years of beauty expertise at Farwa Beauty Salon, PECHS Block 2, Karachi.`,
  alternates: { canonical: '/team' },
  openGraph: { type: 'website', images: ['/logo.jpg'] },
}

export default function TeamPage() {
  return <TeamClient />
}
