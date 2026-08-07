import React from 'react'

/** Filter chip — uppercase 11px Inter 500. Active = ink fill. */
export function TabPill({ active = false, children, className = '', ...rest }) {
  return <button type="button" className={`tab-pill ${active ? 'tab-pill-active' : ''} ${className}`} {...rest}>{children}</button>
}
