import PrivacyClient from './privacy-client'

export const metadata = {
  title: 'Privacy Policy — Farwa Beauty Salon, Karachi',
  description: 'How Farwa Beauty Salon handles your data — WhatsApp bookings, analytics, and third-party embeds.',
  alternates: { canonical: 'https://farwasalon.com/privacy' },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
