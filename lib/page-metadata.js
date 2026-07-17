import { SITE_ORIGIN } from './business-schema.js'

/** Open Graph + Twitter fields aligned with Google local SERP snippets. */
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
  return {
    openGraph: {
      title,
      description,
      url,
      type,
      siteName: 'Farwa Beauty Salon',
      locale: 'en_PK',
      images: [{ url: image, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
