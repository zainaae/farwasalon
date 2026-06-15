import CancelClient from './cancel-client'

export const metadata = {
  title: 'Cancel Appointment',
  robots: { index: false, follow: false },
  alternates: { canonical: null },
}

export default function CancelPage() {
  return <CancelClient />
}
