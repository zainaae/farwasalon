import { notFound } from 'next/navigation'
import { CAT_SLUGS, CAT_SEO, CAT_META, SERVICES, slugToCategory, formatPrice } from '../../../src/data.js'
import { parseLocationSlug, getAllLocationServiceSlugs } from '../../../src/location-seo.js'
import CategoryDetailClient from './category-detail-client'
import LocationServicePage from './location-service-page'

export const dynamicParams = false

export function generateStaticParams() {
  const categoryParams = Object.values(CAT_SLUGS).map((slug) => ({ categorySlug: slug }))
  const locationParams = getAllLocationServiceSlugs().map((slug) => ({ categorySlug: slug }))
  return [...categoryParams, ...locationParams]
}

export async function generateMetadata({ params }) {
  const { categorySlug } = await params

  const locationData = parseLocationSlug(categorySlug)
  if (locationData) {
    const { service, location, prefix } = locationData
    const title = prefix === 'best'
      ? `Best ${service.name} in ${location.name}`
      : `${service.name} ${prefix === 'near' ? 'Near' : 'in'} ${location.name}`
    const canonicalSlug = prefix === 'best'
      ? `${service.slug}-in-${location.slug}`
      : categorySlug
    return {
      title,
      description: `${service.description} Serving clients from ${location.name}. Book at Farwa Beauty Salon, PECHS Block 2, Karachi — WhatsApp +92 322 278 2254.`,
      alternates: { canonical: `/services/${canonicalSlug}` },
      openGraph: { type: 'website', images: [{ url: '/logo.jpg', width: 1200, height: 630, alt: `${service.name} services near ${location.name} — Farwa Beauty Salon Karachi` }] },
    }
  }

  const category = slugToCategory(categorySlug)
  if (!category) return notFound()

  const services = SERVICES[category] || []
  const prices = services.map(s => s.pricePkr).filter(Boolean)
  const minPrice = prices.length ? Math.min(...prices) : null
  const priceHint = minPrice ? ` — From ${formatPrice(minPrice)}` : ''
  const catImg = CAT_META[category]?.img || '/logo.jpg'

  return {
    title: `${category} in PECHS Karachi${priceHint}`,
    description: CAT_SEO[category]?.metaDesc || `${category} services at Farwa Beauty Salon, PECHS Block 2, Karachi. Book on WhatsApp.`,
    alternates: { canonical: `/services/${categorySlug}` },
    openGraph: { type: 'website', images: [{ url: catImg, width: 1200, height: 630, alt: `${category} services at Farwa Beauty Salon PECHS Karachi` }] },
  }
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params

  const locationData = parseLocationSlug(categorySlug)
  if (locationData) {
    return <LocationServicePage data={locationData} slug={categorySlug} />
  }

  const category = slugToCategory(categorySlug)
  if (!category) notFound()

  return <CategoryDetailClient categorySlug={categorySlug} />
}
