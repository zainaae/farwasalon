export const metadata = {
  title: 'Staff login',
  robots: { index: false, follow: false },
}

export default function AdminAuthLayout({ children }) {
  return (
    <div className="min-h-dvh bg-[#f7f4f0] text-ink antialiased">
      {children}
    </div>
  )
}
