'use client'

import { useState, useTransition } from 'react'
import { getVisitReceiptText } from '../actions.js'

export default function VisitReceiptActions({ visitId }) {
  const [pending, startTransition] = useTransition()
  const [text, setText] = useState('')
  const [msg, setMsg] = useState('')

  function loadAndCopy() {
    setMsg('')
    startTransition(async () => {
      const res = await getVisitReceiptText(visitId)
      if (!res.ok) {
        setMsg(res.error)
        return
      }
      setText(res.text)
      try {
        await navigator.clipboard.writeText(res.text)
        setMsg('Receipt copied — paste into WhatsApp.')
      } catch {
        setMsg('Select the receipt text below to copy.')
      }
    })
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending}
        onClick={loadAndCopy}
        className="rounded-sm border border-ink/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink disabled:opacity-60"
      >
        {pending ? 'Loading…' : 'Copy WA receipt'}
      </button>
      {msg && <p className="text-sm text-ink/65">{msg}</p>}
      {text && (
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-sm border border-ink/10 bg-white px-3 py-3 text-xs leading-relaxed text-ink/80">
          {text}
        </pre>
      )}
    </div>
  )
}
