import React from 'react'

/** The brand's ubiquitous CTA arrow (↗). Decorative by default. */
export function ArrowUpRight({ size = 15, className = '', label }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' })}>
      <path d="M7 7h10v10"></path>
      <path d="M7 17 17 7"></path>
    </svg>
  )
}
