import React from 'react'

/** Square-mat photo proof + rating + trust line.
 *  Below the fold only — never the default under the home hero (use ProofStrip).
 *  Brand is square; mats stay square (see .avatar-strip). */
export function ReviewProof({ images = [], rating = '4.6★', line = '19 Google reviews · 1,000+ appointments a month', onDark = false }) {
  return (
    <div className="avatar-strip" style={{ gap: 14, flexWrap: 'wrap' }}>
      <span style={{ display: 'flex' }}>
        {images.map((src, i) => <img key={i} src={src} alt="" style={{ borderColor: onDark ? 'rgba(255,255,255,0.9)' : '#fff' }} />)}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 700, fontSize: 15, lineHeight: 1, color: onDark ? '#fff' : 'var(--ink)' }}>{rating}</span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 300, color: onDark ? 'rgba(255,255,255,0.7)' : 'var(--stone)' }}>{line}</span>
      </span>
    </div>
  )
}
