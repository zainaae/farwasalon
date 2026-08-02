import ConfirmationClient from './confirmation-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Booking Confirmed',
  description: 'Your appointment at Farwa Beauty Salon has been confirmed. Send a WhatsApp message to complete your booking.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/book/confirmation' },
}

export default function ConfirmationPage() {
  return <ConfirmationClient />
}
