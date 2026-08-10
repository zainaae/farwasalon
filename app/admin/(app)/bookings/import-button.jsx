'use client'

import { useState, useTransition } from 'react'
import { importOnlineBookingsAction } from './actions.js'

/**
 * @param {{ defaultFrom: string }} props
 */
export default function ImportBookingsButton({ defaultFrom }) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const [fromYmd, setFromYmd] = useState(defaultFrom)

  function onImport() {
    setMsg('')
    startTransition(async () => {
      const res = await importOnlineBookingsAction({ fromYmd })
      if (!res.ok) {
        setMsg(res.error || 'Import failed.')
        return
      }
      const s = res.summary
      setMsg(
        `Scanned ${s.scanned}: +${s.appointments_created} new, ${s.appointments_updated} updated, ${s.clients_created} clients, ${s.skipped} skipped` +
          (s.errors?.length ? ` · ${s.errors.length} errors` : ''),
      )
    })
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="text-xs text-ink/60">
        From (Karachi)
        <input
          type="date"
          value={fromYmd}
          onChange={(e) => setFromYmd(e.target.value)}
          className="mt-1 block rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <button
        type="button"
        disabled={pending}
        onClick={onImport}
        className="inline-flex items-center justify-center rounded-sm bg-ink px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
      >
        {pending ? 'Importing…' : 'Import from Sheets'}
      </button>
      {msg ? (
        <p
          role="status"
          className="text-xs text-ink/65 sm:max-w-sm sm:self-center"
        >
          {msg}
        </p>
      ) : null}
    </div>
  )
}
