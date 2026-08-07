import Image from 'next/image'
import WaCta from './components/wa-cta.jsx'
import Link from 'next/link'
import ArrowUpRight from './components/icon-sprite.jsx'
import { WA_NUMBER } from '../src/site-config.js'

const HERO_POSTER = '/bridal2.jpg'

/**
 * Brand-first first viewport (Farwa theme master):
 * FARWA as the hero-level signal · PECHS SEO kept inside H1 for local search ·
 * one supporting line · one CTA group · one dominant bridal still.
 * Quoti rhythm lives below the fold — not as slogan H1, avatars, or purple wash.
 */
export default function HomeHero() {
  return (
    <section className="relative w-full h-[100svh] min-h-[560px] max-h-[1100px] overflow-hidden bg-[var(--hero-ground)]">
      <Image
        src={HERO_POSTER}
        alt="Bridal makeup and beauty styling at Farwa Beauty Salon in PECHS Karachi"
        fill
        priority
        fetchPriority="high"
        quality={60}
        sizes="(max-width: 768px) 100vw, 100vw"
        /* Focal point moves right as the viewport widens. The copy occupies the
           left of the frame; from md up she sits in the right third. */
        className="hero-lcp object-cover scale-[1.01] pointer-events-none object-[58%_28%] md:object-[72%_26%]"
      />

      {/* No desktop video. /hero-mp4.mp4 is stock b-roll — restore HomeHeroVideo
          when there is owned PECHS footage (docs/salon-photography-guide.md). */}

      <div
        id="hero-overlay"
        className="absolute inset-0 z-[1]"
        style={{
          /* Harder left/bottom scoop so type sits on dark ground and the bridal
             face stays lit on the right — depth from light falloff, not flat wash. */
          background:
            'linear-gradient(to top, rgba(13,6,9,0.94) 0%, rgba(13,6,9,0.55) 28%, rgba(13,6,9,0.08) 58%, rgba(13,6,9,0.35) 100%), ' +
            'linear-gradient(to right, rgba(13,6,9,0.82) 0%, rgba(13,6,9,0.48) 32%, rgba(13,6,9,0.08) 62%, rgba(13,6,9,0) 82%)',
        }}
      />

      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 78% 32%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 42%, rgba(0,0,0,0.38) 100%)',
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
          opacity: 0.045,
          mixBlendMode: 'overlay',
        }}
      />

      <div
        id="hero-copy"
        className="absolute inset-x-0 bottom-0 z-10 px-5 sm:px-6 md:px-10 pb-[max(7rem,env(safe-area-inset-bottom,0px)+5.25rem)] sm:pb-14 md:pb-16"
      >
        <div className="max-w-screen-2xl mx-auto min-w-0 w-full">
          <p
            id="hero-lede"
            className="hero-lcp text-white/80 text-[10px] sm:text-[11px] tracking-[0.32em] uppercase font-[family-name:var(--font-inter)] mb-4 md:mb-5"
          >
            Farwa Beauty Salon &middot; PECHS
          </p>

          {/* Brand name is the display hit. Local SEO stays inside the same H1
              so e2e + crawlers still see Beauty Salon / PECHS / Karachi. */}
          <h1
            id="hero-headline"
            className="hero-lcp text-white leading-[0.9] mb-4 md:mb-5 font-[family-name:var(--font-unbounded)]"
            style={{ letterSpacing: '-0.035em' }}
          >
            {/* nowrap + fluid size capped to viewport so the brand never orphans
                as "Farw / a" on 390px. Subtitle keeps overflow-wrap. */}
            <span
              className="block text-white font-bold whitespace-nowrap"
              style={{ fontSize: 'clamp(2.75rem, 11.5vw, 8.5rem)' }}
            >
              Farwa
            </span>
            <span
              className="block text-white/90 font-normal mt-2 md:mt-3 max-w-[16ch] sm:max-w-[18ch]"
              style={{
                fontSize: 'clamp(1.1rem, 3vw, 2rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                overflowWrap: 'anywhere',
              }}
            >
              Beauty Salon in PECHS, Karachi
            </span>
          </h1>

          <p
            className="hero-lcp text-white/80 text-[15px] sm:text-base md:text-lg font-light leading-snug mb-8 md:mb-9 max-w-md font-[family-name:var(--font-inter)]"
          >
            Bridal, hair &amp; skin with Rubina since 2008.
          </p>

          <div
            className="hero-fade-up cta-cluster items-stretch sm:items-center"
            style={{ animationDelay: '0.32s' }}
          >
            <Link
              href="/book"
              className="btn-loud btn-loud--light tap-safe"
            >
              Book an Appointment
              <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>
            <WaCta
              href={`https://wa.me/${WA_NUMBER}`}
              from="hero"
              className="btn-ghost-on-dark tap-safe"
            >
              WhatsApp us
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
