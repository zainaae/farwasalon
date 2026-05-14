import ConfirmationClient from './confirmation-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Booking Confirmed — Farwa Beauty Salon',
  description: 'Your appointment at Farwa Beauty Salon has been confirmed. Send a WhatsApp message to complete your booking.',
}

export default function ConfirmationPage() {
  return <ConfirmationClient />
}
