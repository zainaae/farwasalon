import Image from 'next/image'
import WaCta from './components/wa-cta.jsx'
import Link from 'next/link'
import { WA_NUMBER } from '../src/site-config.js'

const HERO_POSTER = '/bridal2.jpg'

const thesis = [
  { text: 'Bridal. Hair. Skin. ', em: true },
  { text: 'Rubina\u2019s studio ', em: false },
  { text: 'since 2008.', em: true },
]

export default function HomeHero() {
  return (
    <section className="relative w-full h-[100svh] min-h-[520px] max-h-[1100px] overflow-hidden bg-[#0d0609]">
      <Image
        src={HERO_POSTER}
        alt="Bridal makeup and beauty styling at Farwa Beauty Salon in PECHS Karachi"
        fill
        priority
        fetchPriority="high"
        quality={60}
        sizes="(max-width: 768px) 100vw, 100vw"
        /* Focal point moves right as the viewport widens. The copy occupies the
           left of the frame, and at desktop widths a centred crop put the
           headline straight across the bride's face. Portrait keeps her
           centred; from md up she sits in the right third with the type on
           clear ground. */
        className="hero-lcp object-cover scale-[1.01] pointer-events-none object-[50%_35%] md:object-[68%_28%]"
      />

      {/* No desktop video. /hero-mp4.mp4 is stock b-roll — a blow-dry on a
          client who looks nothing like the ones who walk into Block 3 — and it
          sat on top of this bridal still, so desktop got the generic first
          impression and only mobile saw the real one. The still is the
          stronger asset on every screen. Restore HomeHeroVideo when there is
          owned PECHS footage to put here (docs/salon-photography-guide.md). */}

      <div
        id="hero-overlay"
        className="absolute inset-0 z-[1]"
        style={{
          /* One even wash over the whole frame is what made this read flat:
             every part of the image sat at the same tone, so nothing receded
             and nothing came forward. Weighted to the bottom-left instead,
             where the copy sits — that buys contrast for the type and leaves
             the top-right of the photograph bright. */
          background:
            'linear-gradient(to top, rgba(13,6,9,0.88) 0%, rgba(13,6,9,0.44) 24%, rgba(13,6,9,0.10) 56%, rgba(13,6,9,0.24) 100%), ' +
            'linear-gradient(to right, rgba(13,6,9,0.60) 0%, rgba(13,6,9,0.34) 28%, rgba(13,6,9,0.06) 58%, rgba(13,6,9,0) 78%)',
        }}
      />

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.32) 100%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />

      <div
        id="hero-copy"
        className="absolute inset-x-0 bottom-0 z-10 px-5 sm:px-6 md:px-10 pb-[max(7rem,env(safe-area-inset-bottom,0px)+5.25rem)] sm:pb-14 md:pb-16"
        style={{
          textShadow: '0 1px 14px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.2)',
        }}
      >
        <div className="max-w-screen-2xl mx-auto min-w-0 w-full">
          <p
            id="hero-lede"
            className="hero-lcp text-white/80 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase font-[family-name:var(--font-inter)] mb-5 md:mb-7"
          >
            Farwa Beauty Salon &middot; Est. 2008
          </p>

          {/* H1 uses next/font CSS var + display:optional Unbounded so LCP is not
              blocked on webfont swap. Poster remains priority/high fetchPriority. */}
          <h1
            id="hero-headline"
            className="hero-lcp text-white leading-[0.96] mb-4 md:mb-5 break-words font-[family-name:var(--font-unbounded)]"
            style={{
              fontSize: 'clamp(2.5rem, 8.8vw, 6.75rem)',
              letterSpacing: '-0.03em',
              maxWidth: '13ch',
            }}
          >
            <span className="block text-white font-bold">Beauty Salon in PECHS</span>
            <span className="block text-white font-normal mt-1">Karachi</span>
          </h1>

          <p
            className="text-white/90 leading-[1.15] mb-8 md:mb-9 break-words font-[family-name:var(--font-unbounded)]"
            style={{
              fontSize: 'clamp(1.05rem, 3.2vw, 1.75rem)',
              letterSpacing: '-0.01em',
              maxWidth: '22ch',
            }}
          >
            {thesis.map((line) => (
              <span
                key={line.text}
                className={`block ${line.em ? 'text-white/95 font-bold' : 'text-white/85 font-normal'}`}
              >
                {line.text}
              </span>
            ))}
          </p>

          <div
            className="hero-fade-up flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-7"
            style={{ animationDelay: '0.32s' }}
          >
            <Link
              href="/book"
              className="tap-safe inline-flex items-center justify-center sm:justify-start gap-2.5 bg-white text-ink text-[12px] md:text-[13px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] px-8 md:px-10 py-[1.05rem] md:py-[1.2rem] hover:bg-nude active:scale-[0.98] transition-colors duration-300"
            >
              Book an Appointment
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </Link>
            <Link
              href="/services"
              className="tap-safe link-underline self-center text-white/75 text-[12px] md:text-[13px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] hover:text-white transition-colors"
            >
              Explore Services
            </Link>
            <WaCta
              href={`https://wa.me/${WA_NUMBER}`}
              from="hero"
              className="tap-safe link-underline self-center hidden sm:inline-flex text-white/75 text-[12px] md:text-[13px] tracking-[0.16em] uppercase font-[family-name:var(--font-inter)] hover:text-white transition-colors"
            >
              Or WhatsApp us
            </WaCta>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="hero-fade hidden md:flex absolute bottom-10 right-10 z-10 flex-col items-center gap-1.5"
        style={{ animationDelay: '2.2s', animationDuration: '0.9s' }}
      >
        <div className="w-px h-9 bg-white/20 relative overflow-hidden">
          <div className="hero-scroll-bar absolute top-0 left-0 w-full bg-white/80" style={{ height: '40%' }} />
        </div>
        <span className="text-white/45 text-[9px] tracking-[0.22em] uppercase font-[family-name:var(--font-inter)] rotate-90 origin-center mt-2">
          scroll
        </span>
      </div>
    </section>
  )
}
