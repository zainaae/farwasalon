import React from 'react'

/** Kinetic wordmark divider — "F · B · S ✦ Since 2008" between gold gradient hairlines. */
export function WordmarkDivider() {
  return (
    <div aria-hidden="true" style={{ background: '#fff', borderTop: '1px solid var(--border-soft)', borderBottom: '1px solid var(--border-soft)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '28px 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,169,138,0.5), #c9a98a)' }}></span>
        <span style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.3em', fontSize: 12, flexShrink: 0 }}>F · B · S</span>
        <span style={{ color: '#c9a98a', fontSize: 12 }}>✦</span>
        <span style={{ fontFamily: 'var(--font-unbounded)', fontStyle: 'italic', fontWeight: 400, color: 'var(--stone)', fontSize: 12, flexShrink: 0, letterSpacing: '0.02em' }}>Since 2008</span>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,169,138,0.5), #c9a98a)' }}></span>
      </div>
    </div>
  )
}
