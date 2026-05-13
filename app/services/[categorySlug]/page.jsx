import { notFound } from 'next/navigation'
import { CAT_SLUGS, CAT_SEO, slugToCategory } from '../../../src/data.js'
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
    return {
      title,
      description: `${service.description} Serving clients from ${location.name}. Book at Farwa Beauty Salon, PECHS Block 2, Karachi — WhatsApp +92 322 278 2254.`,
      alternates: { canonical: `/services/${categorySlug}` },
      openGraph: { type: 'website', images: ['/logo.jpg'] },
    }
  }

  const category = slugToCategory(categorySlug)
  if (!category) return notFound()

  return {
    title: category,
    description: CAT_SEO[category]?.metaDesc || `${category} services at Farwa Beauty Salon, PECHS Block 2, Karachi. Book on WhatsApp.`,
    alternates: { canonical: `/services/${categorySlug}` },
    openGraph: { type: 'website', images: ['/logo.jpg'] },
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
