import Image from 'next/image'
import { CAT_META } from '../../../src/data.js'
import { CAT_META_DESC } from '../../../src/cat-meta-desc.js'
import { categoryImageCaption } from '../../../lib/category-image-caption.js'

/**
 * Server-rendered category hero — priority LCP outside the client bundle so
 * mobile discovers the optimized src before framer-motion hydrates.
 */
export default function CategoryHeroBanner({ category }) {
  const base = CAT_META[category] || { img: '/bleachpolish.jpg' }
  const src = base.img
  const alt = category ? categoryImageCaption(category) : CAT_META_DESC[category] || 'Expert beauty services tailored just for you.'

  return (
    <figure className="relative w-full aspect-[5/3] sm:aspect-[16/9] max-h-[min(22rem,42vh)] overflow-hidden mb-6 lg:mb-8 border border-border-soft bg-mist">
      <Image
        id="category-hero-image"
        src={src}
        alt={alt}
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 896px"
        quality={55}
        className="hero-lcp object-cover"
      />
    </figure>
  )
}