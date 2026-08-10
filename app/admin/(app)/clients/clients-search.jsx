'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClientsSearch({ initialQuery = '' }) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)

  function onSubmit(e) {
    e.preventDefault()
    const trimmed = q.trim()
    const href = trimmed
      ? `/admin/clients?q=${encodeURIComponent(trimmed)}`
      : '/admin/clients'
    router.push(href)
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="search"
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Name or phone"
        className="w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-ink/40 sm:max-w-md"
      />
      <button
        type="submit"
        className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink"
      >
        Search
      </button>
    </form>
  )
}
