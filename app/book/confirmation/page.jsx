import ConfirmationClient from './confirmation-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Booking Confirmed',
  description: 'Your appointment at Farwa Beauty Salon is confirmed. Send the WhatsApp message so you and the salon keep a copy in chat.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/book/confirmation' },
}

export default function ConfirmationPage() {
  return <ConfirmationClient />
}
