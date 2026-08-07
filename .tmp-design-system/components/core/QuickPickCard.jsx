import React from 'react'

/** Quick-pick category shortcut card (home page grid). */
export function QuickPickCard({ title, meta = 'View options', all = false, ...rest }) {
  return (
    <a href="#" onClick={(e) => e.preventDefault()} className={`tap-safe quick-pick-card ${all ? 'quick-pick-card--all' : ''}`} {...rest}>
      <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 700, fontSize: 12, color: 'var(--ink)', textTransform: 'uppercase', lineHeight: 1.2, width: '100%' }}>{title}</span>
      <span style={{ fontFamily: 'var(--font-inter)', fontSize: 10, fontWeight: 500, color: all ? 'var(--stone)' : 'var(--accent-gold-deep)', width: '100%' }}>{meta}</span>
    </a>
  )
}
