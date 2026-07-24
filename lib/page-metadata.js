/** Open Graph + Twitter fields aligned with Google local SERP + WhatsApp/IG previews. */
import { SITE_ORIGIN } from './business-schema.js'

function toAbsoluteImage(image) {
  if (!image) return `${SITE_ORIGIN}/bridal.jpg`
  if (image.startsWith('http://') || image.startsWith('https://')) return image
  const path = image.startsWith('/') ? image : `/${image}`
  return `${SITE_ORIGIN}${path}`
}

/**
 * @param {{ title: string, description: string, path: string, image?: string, imageAlt?: string, type?: string }} opts
 */
export function pageSocialMeta({
  title,
  description,
  path,
  image = '/bridal.jpg',
  imageAlt,
  type = 'website',
}) {
  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  const url = `${SITE_ORIGIN}${canonicalPath}`
  const alt = imageAlt || title
  const absoluteImage = toAbsoluteImage(image)
  // WhatsApp / IG prefer ~1200×630; keep explicit dimensions for crawlers.
  const ogImage = { url: absoluteImage, width: 1200, height: 630, alt }
  return {
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: 'Farwa Beauty Salon',
      locale: 'en_PK',
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImage],
    },
  }
}
