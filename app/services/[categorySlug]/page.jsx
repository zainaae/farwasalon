import { notFound } from 'next/navigation'
import { CAT_SLUGS, CAT_SEO, CAT_META, SERVICES, slugToCategory, formatPrice } from '../../../src/data.js'
import { parseLocationSlug, getAllLocationServiceSlugs } from '../../../src/location-seo.js'
import CategoryDetailClient from './category-detail-client'
import LocationServicePage from './location-service-page'
import LocationServiceSchema from './location-service-schema'
import { pageSocialMeta } from '../../../lib/page-metadata.js'

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
    const description = `${service.name} in ${location.name}, Karachi — ${service.description} Book online at Farwa Beauty Salon, PECHS. From Rs 100. ★ 4.9 Google rating.`
    return {
      title,
      description,
      alternates: { canonical: `/services/${canonicalSlug}` },
      ...pageSocialMeta({
        title: `${title} — Farwa Beauty Salon`,
        description,
        path: `/services/${canonicalSlug}`,
        image: '/logo.jpg',
        imageAlt: `${service.name} near ${location.name} — Farwa Beauty Salon`,
      }),
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
    description: CAT_SEO[category]?.metaDesc || `${category} services at Farwa Beauty Salon, PECHS, Karachi. Book online.`,
    alternates: { canonical: `/services/${categorySlug}` },
    openGraph: { type: 'website', images: [{ url: catImg, width: 1200, height: 630, alt: `${category} services at Farwa Beauty Salon PECHS Karachi` }] },
  }
}

export default async function CategoryPage({ params }) {
  const { categorySlug } = await params

  const locationData = parseLocationSlug(categorySlug)
  if (locationData) {
    return (
      <>
        <LocationServiceSchema data={locationData} slug={categorySlug} />
        <LocationServicePage data={locationData} slug={categorySlug} />
      </>
    )
  }

  const category = slugToCategory(categorySlug)
  if (!category) notFound()

  return <CategoryDetailClient categorySlug={categorySlug} />
}
