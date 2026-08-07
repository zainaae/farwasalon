import React from 'react'

/** Form input — square, hairline border, ink ring on focus. */
export function InputField({ label, id, hint, className = '', ...rest }) {
  const inputId = id || (label ? label.toLowerCase().replace(/\W+/g, '-') : undefined)
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} style={{ display: 'block', fontFamily: 'var(--font-inter)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, color: 'var(--ink)', marginBottom: 8 }}>{label}</label>}
      <input id={inputId} className="input-field" {...rest} />
      {hint && <p style={{ fontFamily: 'var(--font-inter)', fontSize: 11, fontWeight: 300, color: 'var(--stone)', margin: '6px 0 0' }}>{hint}</p>}
    </div>
  )
}
