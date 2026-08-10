import Link from 'next/link'
import { requireStaff } from '../../../lib/supabase/staff.js'
import { signOutStaff } from './actions.js'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

const NAV = [
  { href: '/admin', label: 'Today' },
  { href: '/admin/month', label: 'Month' },
  { href: '/admin/bookings', label: 'Bookings' },
  { href: '/admin/visits/new', label: 'New visit' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/inventory', label: 'Inventory' },
]

export default async function AdminAppLayout({ children }) {
  const { staff } = await requireStaff()
  const label = staff.display_name || staff.role

  return (
    <div className="min-h-dvh bg-[#f7f4f0] text-ink antialiased">
      <header className="border-b border-ink/10 bg-[#f7f4f0]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-6">
            <Link
              href="/admin"
              className="font-display shrink-0 text-lg font-semibold tracking-tight"
            >
              Farwa desk
            </Link>
            <nav aria-label="Admin" className="flex items-center gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-sm px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:bg-ink/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden text-xs text-ink/55 sm:inline">{label}</span>
            <form action={signOutStaff}>
              <button
                type="submit"
                className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/70 hover:border-ink/30 hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  )
}
