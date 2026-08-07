import React from 'react'

/** "فروا بیوٹی سیلون" in Noto Nastaliq Urdu — footer/brand signature. */
export function UrduSignature({ className = '', style }) {
  return (
    <span className={`font-nastaliq ${className}`} dir="rtl" lang="ur" aria-label="Farwa Beauty Salon in Urdu" style={{ fontSize: '1.1em', ...style }}>
      فروا بیوٹی سیلون
    </span>
  )
}
