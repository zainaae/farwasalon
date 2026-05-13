import HomeClient from './home-client'

export const metadata = {
  title: "Farwa Beauty Salon — Karachi's trusted beauty studio since 2008",
  description: 'Bridal, facials, hair, nails, threading, waxing and more in PECHS Block 2, Karachi. 17+ years of beauty expertise — book directly on WhatsApp.',
  alternates: { canonical: 'https://farwasalon.com/' },
  openGraph: { images: ['/logo.jpg'] },
}

export default function HomePage() {
  return <HomeClient />
}
