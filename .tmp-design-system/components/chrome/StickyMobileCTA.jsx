import React from 'react'
import { ArrowUpRight } from '../icons/ArrowUpRight.jsx'

/** Mobile sticky bottom bar: Call / WhatsApp / Book on a dark blurred pill.
 *  Static here — wrap with position:fixed;bottom in a real page. */
export function StickyMobileCTA({ slotLabel = 'Today 3:00 PM', showSlotHint = true }) {
  const item = { flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, fontFamily: 'var(--font-inter)', padding: '10px 0', minHeight: 44, textDecoration: 'none' }
  return (
    <nav aria-label="Quick contact and booking" style={{ maxWidth: 380, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 8, background: 'rgba(13,13,13,0.92)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 15px -3px rgba(13,13,13,0.25)', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        {showSlotHint && (
          <p style={{ margin: 0, padding: '6px 12px 0', textAlign: 'center', fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-inter)', lineHeight: 1 }}>
            <span style={{ display: 'inline-block', width: 4, height: 4, borderRadius: 999, marginRight: 6, verticalAlign: 'middle', background: '#9cd48c' }}></span>
            Next slot <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{slotLabel}</span>
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 2, padding: 4 }}>
          <a href="#" onClick={(e) => e.preventDefault()} style={item}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            Call
          </a>
          <span aria-hidden="true" style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></span>
          <a href="#" onClick={(e) => e.preventDefault()} style={item}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
            WhatsApp
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ ...item, flex: 1.3, background: '#fff', color: 'var(--ink)', fontWeight: 600, letterSpacing: '0.14em', borderRadius: 6 }}>
            Book
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </nav>
  )
}
