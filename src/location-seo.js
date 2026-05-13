export const NEIGHBORHOODS = [
  { slug: 'pechs-karachi', name: 'PECHS, Karachi', detail: 'Our home salon is in PECHS Block 2 — visit us for all services.' },
  { slug: 'gulshan', name: 'Gulshan-e-Iqbal', detail: 'Many of our regular clients travel from Gulshan — and say it\'s worth every minute.' },
  { slug: 'clifton-karachi', name: 'Clifton, Karachi', detail: 'We welcome clients from Clifton for bridal and special occasion bookings.' },
  { slug: 'bahadurabad', name: 'Bahadurabad', detail: 'A short drive through PECHS brings you to our door from Bahadurabad.' },
  { slug: 'dha', name: 'DHA (Defence)', detail: 'Clients from DHA trust us for premium bridal, hair, and skincare.' },
  { slug: 'tariq-road', name: 'Tariq Road', detail: 'Our nearest shopping neighbours — stop by before or after your errands on Tariq Road.' },
  { slug: 'shahrah-e-faisal', name: 'Shahrah-e-Faisal', detail: 'Just minutes away via the main arterial road.' },
  { slug: 'north-nazimabad', name: 'North Nazimabad', detail: 'Worth the trip — clients from North Nazimabad have been coming for years.' },
  { slug: 'saddar', name: 'Saddar', detail: 'Accessible from Saddar via any main route to PECHS.' },
  { slug: 'korangi', name: 'Korangi', detail: 'We serve clients from across Karachi including Korangi.' },
]

export const TOP_SERVICES = [
  { slug: 'threading', name: 'Threading', category: 'Threading', description: 'Professional eyebrow, lip, and full face threading with precision and care.' },
  { slug: 'bridal-makeup', name: 'Bridal Makeup', category: 'Bridal', description: 'Complete bridal makeup packages — trials, engagement looks, mehndi, and full bridal transformations.' },
  { slug: 'facials', name: 'Facials', category: 'Facials', description: 'Organic, whitening, HD, and anti-ageing facials for every skin type.' },
  { slug: 'hair', name: 'Hair Services', category: 'Hair', description: 'Haircuts, colour, blowdry, styling, and treatments for all hair types.' },
  { slug: 'nails', name: 'Nail Services', category: 'Nails', description: 'Manicures, pedicures, nail art, French tips, and paraffin treatments.' },
  { slug: 'waxing', name: 'Waxing', category: 'Rica Wax', description: 'Rica hot wax, honey wax, and body waxing for smooth, lasting results.' },
]

export function parseLocationSlug(slug) {
  const inMatch = slug.match(/^(.+)-in-(.+)$/)
  if (inMatch) {
    const [, svcPart, locPart] = inMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'in' }
  }

  const nearMatch = slug.match(/^(.+)-near-(.+)$/)
  if (nearMatch) {
    const [, svcPart, locPart] = nearMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'near' }
  }

  const bestMatch = slug.match(/^best-(.+)-(.+)$/)
  if (bestMatch) {
    const [, svcPart, locPart] = bestMatch
    const svc = TOP_SERVICES.find(s => s.slug === svcPart)
    const loc = NEIGHBORHOODS.find(n => n.slug === locPart)
    if (svc && loc) return { service: svc, location: loc, prefix: 'best' }
  }

  return null
}

export function getAllLocationServiceSlugs() {
  const slugs = []
  for (const svc of TOP_SERVICES) {
    for (const loc of NEIGHBORHOODS) {
      slugs.push(`${svc.slug}-in-${loc.slug}`)
      slugs.push(`best-${svc.slug}-${loc.slug}`)
    }
  }
  return slugs
}
