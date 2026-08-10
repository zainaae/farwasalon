import { Suspense } from 'react'
import AdminLoginForm from './login-form.jsx'

export const metadata = {
  title: 'Staff login',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-dvh w-full max-w-md items-center px-5">
          <p className="text-sm text-ink/60">Loading…</p>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  )
}
