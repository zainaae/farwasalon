'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { voidVisitAction } from '../actions.js'

/** How long "Confirm void" stays armed before resetting (avoids onBlur flakiness). */
const CONFIRM_WINDOW_MS = 5000

export default function VoidVisitButton({ visitId }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!confirming) return undefined
    const id = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS)
    return () => clearTimeout(id)
  }, [confirming])

  function onVoid() {
    if (!confirming) {
      setConfirming(true)
      return
    }
    setError('')
    startTransition(async () => {
      const res = await voidVisitAction(visitId)
      if (!res.ok) {
        setError(res.error)
        setConfirming(false)
        return
      }
      router.refresh()
      setConfirming(false)
    })
  }

  return (
    <div className="text-right">
      <button
        type="button"
        disabled={pending}
        onClick={onVoid}
        className="rounded-sm border border-red-300 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-red-800 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? 'Voiding…' : confirming ? 'Confirm void' : 'Void visit'}
      </button>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-800">
          {error}
        </p>
      )}
    </div>
  )
}
