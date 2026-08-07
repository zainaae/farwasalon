import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main id="main" className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center pt-[calc(3.375rem+env(safe-area-inset-top,0px))]">
      <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-[family-name:var(--font-inter)] mb-3">
        — 404
      </p>
      <h1 className="font-[family-name:var(--font-fraunces)] font-bold text-4xl md:text-6xl text-ink mb-4 uppercase">
        Page Not Found
      </h1>
      <p className="text-stone max-w-md mb-8 font-light font-[family-name:var(--font-inter)] text-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist. Head back to our homepage or browse our services.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] px-7 py-4 hover:bg-stone transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 border border-ink text-ink text-[11px] tracking-[0.16em] uppercase font-semibold font-[family-name:var(--font-inter)] px-7 py-4 hover:bg-ink hover:text-white transition-colors"
        >
          Our Services
        </Link>
      </div>
    </main>
  )
}
