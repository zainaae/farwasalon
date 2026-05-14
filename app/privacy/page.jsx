import PrivacyClient from './privacy-client'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How Farwa Beauty Salon handles your data — WhatsApp bookings, analytics, and third-party embeds.',
  alternates: { canonical: '/privacy' },
  openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: 'Privacy Policy — Farwa Beauty Salon' }] },
}

export default function PrivacyPage() {
  return <PrivacyClient />
}
