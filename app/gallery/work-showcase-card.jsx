'use client'

import Image from 'next/image'
import { LazyVideo } from '../../src/shared.jsx'

/** Photo-dominant showcase tile. `featured` breaks the equal 3-up cardboard rhythm. */
export default function WorkShowcaseCard({ src, label, alt, video, index, featured = false }) {
  const numeral = typeof index === 'number' ? ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][index] : null
  return (
    <figure className={`w-full min-w-0 ${featured ? 'h-full' : 'max-w-lg mx-auto lg:mx-0'}`}>
      {/* One positioned box for next/image fill — never stack relative+absolute
         on the same node (featured used to, which collapsed the media to 0
         and left a dead mist slab). */}
      <div
        className={
          featured
            ? 'relative overflow-hidden bg-mist media-zoom h-full min-h-[320px] sm:min-h-[420px] lg:min-h-[520px]'
            : 'relative overflow-hidden bg-mist media-zoom aspect-[4/5]'
        }
      >
        {video ? (
          <LazyVideo
            src={video}
            poster={src}
            className="absolute inset-0 w-full h-full object-cover"
            aria-label={alt || label}
          />
        ) : (
          <Image
            src={src}
            alt={alt || label}
            fill
            className="object-cover"
            sizes={featured ? '(max-width: 768px) 100vw, 55vw' : '(max-width: 768px) 100vw, 28vw'}
            priority={featured}
          />
        )}
        <figcaption className="absolute inset-x-0 bottom-0 flex items-baseline justify-between gap-3 px-3.5 py-3 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent">
          <span className="text-white text-[10px] tracking-[0.2em] uppercase font-[family-name:var(--font-inter)] font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]">
            {label}
          </span>
          {numeral && (
            <span className="text-white/70 text-[10px] tracking-[0.2em] font-[family-name:var(--font-inter)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
              {numeral}
            </span>
          )}
        </figcaption>
      </div>
    </figure>
  )
}
