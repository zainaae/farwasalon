import React from 'react'

const LINKS = ['Home', 'Services', 'Prices', 'Gallery', 'Blog', 'About', 'FAQ', 'Contact']

/** Fixed site header. light=true → white/95 blur bar (scrolled / interior pages);
 *  light=false → ink/35 blur over a dark hero. Static positioning so it composes;
 *  wrap with position:fixed;top:0 in a full page. Pass logoSrc (assets/logo.jpg)
 *  for the image mark; otherwise renders the FARWA wordmark. */
export function Navbar({ light = true, active = 'Home', links = LINKS, logoSrc, onNavigate }) {
  const linkColor = (l) => {
    if (l === active) return light ? 'var(--ink)' : '#fff'
    return light ? 'var(--stone)' : 'rgba(255,255,255,0.65)'
  }
  return (
    <header style={{ width: '100%', zIndex: 100, backdropFilter: 'blur(12px)', background: light ? 'rgba(255,255,255,0.95)' : 'rgba(13,13,13,0.35)', borderBottom: `1px solid ${light ? 'var(--border-soft)' : 'rgba(255,255,255,0.08)'}` }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', height: 56, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ justifySelf: 'start', display: 'inline-flex', alignItems: 'center', height: 44, textDecoration: 'none' }}>
          {light && logoSrc
            ? <img src={logoSrc} alt="Farwa Beauty Salon" style={{ height: 28, width: 'auto', objectFit: 'contain' }} />
            : <span style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700, fontSize: 13, letterSpacing: '0.16em', color: light ? 'var(--ink)' : '#fff' }}>FARWA</span>}
        </a>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 16, height: 44 }} aria-label="Main navigation">
          {links.map((l) => (
            <a key={l} href="#" onClick={(e) => { e.preventDefault(); onNavigate?.(l) }}
              style={{ fontFamily: 'var(--font-inter)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', color: linkColor(l), borderBottom: l === active ? `1px solid ${light ? 'var(--ink)' : 'var(--accent-gold)'}` : '1px solid transparent', paddingBottom: 2, transition: 'color .2s ease' }}>
              {l}
            </a>
          ))}
        </nav>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('Book') }}
          style={{ justifySelf: 'end', display: 'inline-flex', alignItems: 'center', gap: 6, height: 44, padding: '0 20px', fontFamily: 'var(--font-inter)', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, textDecoration: 'none', borderRadius: 2, whiteSpace: 'nowrap', transition: 'background-color .3s ease',
            ...(light ? { background: 'var(--ink)', color: '#fff', border: '1px solid var(--ink)' } : { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.7)' }) }}>
          Book an Appointment
        </a>
      </div>
    </header>
  )
}
