'use client'

/** Lightweight chrome bits shared by Navbar / Footer without pulling the full shell. */

export const CTA_PRIMARY_LABEL = 'Book appointment'
export const CTA_WHATSAPP_HINT = 'Or message us on WhatsApp'

export function IgIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function UrduSignature({ className = '' }) {
  return (
    <span
      className={`font-nastaliq text-[1.1em] ${className}`}
      dir="rtl"
      lang="ur"
      aria-label="Farwa Beauty Salon in Urdu"
    >
      فروا بیوٹی سیلون
    </span>
  )
}
