import { notFound } from 'next/navigation'
import { CAT_SLUGS, CAT_META, SERVICES, slugToCategory, formatPrice } from '../../../src/data.js'
import { CAT_SEO } from '../../../src/cat-seo-content.js'
import { parseLocationSlug, getAllLocationServiceSlugs } from '../../../src/location-seo.js'
import CategoryDetailClient from './category-detail-client'
import { getRelatedBlogPostsForCategory } from '../../../src/blog-data.js'
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
    /* Google truncates around 155-160 chars, so build the description from the
       highest-CTR parts first (service + area + price + rating) and only spend
       what is left on the service blurb — trimmed at a word boundary. */
    const descTail = ` at Farwa Beauty Salon, PECHS. From ${priceFloor}. ★ ${GOOGLE_GBP_STATS.rating} Google. Book online.`
    const descHead = `${service.name} in ${locality} — `
    const blurbBudget = 155 - descHead.length - descTail.length
    const blurb =
      service.description.length <= blurbBudget
        ? service.description
        : `${service.description.slice(0, Math.max(0, blurbBudget - 1)).replace(/[\s,;—-]+\S*$/, '')}…`
    const description = `${descHead}${blurb}${descTail}`
    return {
      title: { absolute: title },
      description,
      alternates: { canonical: `/services/${canonicalSlug}` },
      ...pageSocialMeta({
        title,
        description,
        path: `/services/${canonicalSlug}`,
        image: CAT_META[service.category]?.img || '/bridal.jpg',
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
  /* Location pages have appended "★ 4.6 Google" to their description since
     launch (see the descTail above); the plain category pages never did — so
     the highest-impression service pages on the site shipped the weakest
     snippets. /services/eyebrow-tattoo is 241 impressions at 1.7% CTR. Appended
     only when it fits the ~155-char budget, so no hand-written description
     gets truncated to make room for it. */
  const baseDesc = seo?.metaDesc || `${category} services at Farwa Beauty Salon, PECHS, Karachi. Book online.`
  const ratingSuffix = ` ★ ${GOOGLE_GBP_STATS.rating} on Google.`
  const description =
    baseDesc.length + ratingSuffix.length <= 158 ? `${baseDesc}${ratingSuffix}` : baseDesc

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

  /* Resolved here. The helper returns three {slug,title,description} objects,
     but reaching it from the browser meant bundling all 29 article bodies with
     it on all 73 /services/* pages. */
  return (
    <CategoryDetailClient
      categorySlug={categorySlug}
      relatedBlogs={category ? getRelatedBlogPostsForCategory(category, 3) : []}
    />
  )
}
