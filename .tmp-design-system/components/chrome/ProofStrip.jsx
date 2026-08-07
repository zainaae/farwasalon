import React from 'react'

/** Dark trust band under the hero: rating · years · volume · services.
 *  Real, checkable numbers only. Defaults match FARWA_GBP_STATS / production (19 reviews, 102 services). */
export function ProofStrip({ items }) {
  const data = items || (typeof window !== 'undefined' && window.FARWA_PROOF_ITEMS) || [
    { lead: '4.6★', label: '19 Google reviews' },
    { lead: '18+', label: 'Years in PECHS' },
    { lead: '1,000+', label: 'Appointments a month' },
    { lead: '102', label: 'Services, every price printed' },
  ]
  return (
    <aside style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.1)' }} aria-label="Why clients choose Farwa">
      <ul style={{ listStyle: 'none', margin: '0 auto', maxWidth: '80rem', padding: '18px 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px 40px' }}>
        {data.map(({ lead, label }, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            {i > 0 && <span aria-hidden="true" style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.15)' }}></span>}
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700, color: '#fff', fontSize: 16, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{lead}</span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontFamily: 'var(--font-inter)', lineHeight: 1 }}>{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </aside>
  )
}
