import Image from 'next/image'

export default function WorkShowcaseCard({ src, label, alt, video }) {
  return (
    <figure className="w-full max-w-md min-w-0 mx-auto">
      <div className="relative aspect-[4/5] overflow-hidden border border-[#e4ddd7] bg-mist">
        {video ? (
          <video
            src={video}
            poster={src}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            aria-label={alt || label}
          />
        ) : (
          <Image
            src={src}
            alt={alt || label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent pointer-events-none" />
        <figcaption className="absolute bottom-3 left-3 right-3">
          <span className="text-white text-[10px] tracking-[0.18em] uppercase font-['Inter'] font-medium">
            {label}
          </span>
        </figcaption>
      </div>
    </figure>
  )
}
