import { notFound } from 'next/navigation'
import { CAT_SLUGS, CAT_META, SERVICES, slugToCategory, formatPrice } from '../../../src/data.js'
import { CAT_SEO } from '../../../src/cat-seo-content.js'
import { parseLocationSlug, getAllLocationServiceSlugs } from '../../../src/location-seo.js'
import CategoryDetailClient from './category-detail-client'
import LocationServicePage from './location-service-page'
import LocationServiceSchema from './location-service-schema'
import { pageSocialMeta } from '../../../lib/page-metadata.js'
import { GOOGLE_GBP_STATS } from '../../../src/google-reviews-data.js'

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
    const catServices = SERVICES[service.category] || []
    const locPrices = catServices.map((s) => s.pricePkr).filter(Boolean)
    const locMin = locPrices.length ? Math.min(...locPrices) : 100
    const priceFloor = formatPrice(locMin)
    const placeShort = location.name.includes('Karachi')
      ? location.name.replace(', Karachi', '')
      : location.name
    const titleCore = prefix === 'best'
      ? `Best ${service.name} in ${placeShort}`
      : `${service.name} ${prefix === 'near' ? 'Near' : 'in'} ${placeShort}`
    const title = `${titleCore} — From ${priceFloor} | Farwa`
    const canonicalSlug = prefix === 'best'
      ? `${service.slug}-in-${location.slug}`
      : categorySlug
    const locality = location.name.includes('Karachi') ? location.name : `${location.name}, Karachi`
    const description = `${service.name} in ${locality} — ${service.description} At Farwa Beauty Salon, PECHS. From ${priceFloor}. ★ ${GOOGLE_GBP_STATS.rating} Google. Book online.`
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: `/services/${canonicalSlug}` },
      ...pageSocialMeta({
        title,
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
  const seo = CAT_SEO[category]
  const title = seo?.title
    ? `${seo.title} | Farwa`
    : `${category} PECHS Karachi${priceHint} | Farwa`
  const description = seo?.metaDesc || `${category} services at Farwa Beauty Salon, PECHS, Karachi. Book online.`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/services/${categorySlug}` },
    ...pageSocialMeta({
      title,
      description,
      path: `/services/${categorySlug}`,
      image: catImg,
      imageAlt: `${category} services at Farwa Beauty Salon PECHS Karachi`,
    }),
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
