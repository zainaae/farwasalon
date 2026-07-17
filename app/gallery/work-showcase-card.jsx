import Image from 'next/image'
import { webmSourceFor } from '../../lib/video-manifest.js'

export default function WorkShowcaseCard({ src, label, alt, video, index }) {
  const webm = webmSourceFor(video)
  const numeral = typeof index === 'number' ? ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][index] : null
  return (
    <figure className="w-full max-w-md min-w-0 mx-auto">
      <div className="border border-accent-gold/50 p-2 sm:p-3 bg-white">
        <div className="relative aspect-[4/5] overflow-hidden bg-mist">
          {video ? (
            <video
              poster={src}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
              aria-label={alt || label}
            >
              {webm && <source src={webm} type="video/webm" />}
              <source src={video} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={src}
              alt={alt || label}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}
        </div>
        <figcaption className="flex items-baseline justify-between gap-3 pt-2.5 pb-0.5 px-0.5">
          <span className="text-ink text-[10px] tracking-[0.2em] uppercase font-['Inter'] font-medium">
            {label}
          </span>
          {numeral && (
            <span className="text-stone/70 text-[10px] tracking-[0.2em] font-['Inter']">{numeral}</span>
          )}
        </figcaption>
      </div>
    </figure>
  )
}
