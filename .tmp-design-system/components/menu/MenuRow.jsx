import React from 'react'

/** Priced service-category row from the /services couture menu — photo in a
 *  white mat, Syne name + tagline, count/availability, "from Rs X" price. */
export function MenuRow({ img, name, tagline, count, availability, fromPrice, popular = false, onClick }) {
  const [hover, setHover] = React.useState(false)
  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.() }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: 'grid', gridTemplateColumns: '4.5rem minmax(0,1fr) auto auto', alignItems: 'center', columnGap: 24, padding: '20px 12px', margin: '0 -12px', borderBottom: '1px solid var(--border-soft)', textDecoration: 'none', background: hover ? 'rgba(248,245,241,0.7)' : 'transparent', transition: 'background-color .3s ease' }}>
      <span style={{ position: 'relative', display: 'block', width: '4.5rem', height: '5.4rem', border: '1px solid var(--border-soft)', padding: 3, background: '#fff', overflow: 'hidden' }}>
        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hover ? 'scale(1.05)' : 'scale(1)', transition: 'transform .7s ease' }} /> : <span style={{ display: 'block', width: '100%', height: '100%', background: 'var(--nude)' }}></span>}
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px' }}>
          <span style={{ fontFamily: 'var(--font-syne)', fontWeight: 600, color: 'var(--ink)', fontSize: 19, lineHeight: 1.2 }}>{name}</span>
          {popular && <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600, fontFamily: 'var(--font-inter)', color: 'var(--berry, #9e2a52)' }}>Most booked</span>}
        </span>
        {tagline && <span style={{ display: 'block', color: 'var(--stone)', fontSize: 13, fontWeight: 300, fontFamily: 'var(--font-inter)', lineHeight: 1.4, marginTop: 2 }}>{tagline}</span>}
      </span>
      <span style={{ textAlign: 'right', alignSelf: 'center', color: 'var(--stone)', fontSize: 11, fontFamily: 'var(--font-inter)', whiteSpace: 'nowrap' }}>
        {count != null ? `${count} services` : ''}{availability ? ` · ${availability.toLowerCase()}` : ''}
      </span>
      <span style={{ textAlign: 'right', flexShrink: 0 }}>
        {fromPrice && (
          <span>
            <span style={{ display: 'block', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: 'var(--font-inter)', color: 'var(--stone)' }}>from</span>
            <span style={{ display: 'block', fontFamily: 'var(--font-unbounded)', fontWeight: 700, color: 'var(--ink)', fontSize: 17, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{fromPrice}</span>
          </span>
        )}
      </span>
    </a>
  )
}
