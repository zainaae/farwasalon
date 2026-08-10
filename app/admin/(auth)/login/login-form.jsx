'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client.js'

const ERROR_COPY = {
  config:
    'Admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  not_staff: 'This account is signed in but is not on the staff list.',
}

function safeNextPath(raw) {
  if (!raw || typeof raw !== 'string') return '/admin'
  if (!raw.startsWith('/admin')) return '/admin'
  if (raw.startsWith('//')) return '/admin'
  return raw
}

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  const bannerError = useMemo(() => {
    const code = searchParams.get('error')
    return code ? ERROR_COPY[code] || null : null
  }, [searchParams])

  async function onSubmit(event) {
    event.preventDefault()
    setFormError('')
    setBusy(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        setFormError(error.message || 'Sign-in failed.')
        return
      }

      const userId = data.user?.id
      if (!userId) {
        setFormError('Sign-in failed.')
        return
      }

      const { data: staff, error: staffError } = await supabase
        .from('staff_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle()

      if (staffError || !staff) {
        await supabase.auth.signOut()
        setFormError(ERROR_COPY.not_staff)
        return
      }

      router.replace(safeNextPath(searchParams.get('next')))
      router.refresh()
    } catch (err) {
      setFormError(err?.message || 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone/80">
        Farwa staff
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink/70">
        Salon desk only. There is no public account signup.
      </p>

      {(bannerError || formError) && (
        <p
          role="alert"
          className="mt-6 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {formError || bannerError}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
            Email
          </span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
          />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/60">
            Password
          </span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="mt-2 inline-flex w-full items-center justify-center rounded-sm bg-ink px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
