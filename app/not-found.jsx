import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">
        — 404
      </p>
      <h1 className="font-['Unbounded'] font-bold text-4xl md:text-6xl text-ink mb-4 uppercase">
        Not Found
      </h1>
      <p className="text-stone max-w-md mb-8 font-light">
        The page you&apos;re looking for has moved or never existed. Head back home and
        we&apos;ll get you where you need to go.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors"
      >
        Back to home
      </Link>
    </main>
  )
}
