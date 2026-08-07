import React from 'react'

/** Farwa primary/secondary button — square, uppercase, tracked Inter 600.
 *  Matches .btn-primary/.btn-secondary in app/globals.css. */
export function Button({ variant = 'primary', arrow = false, children, className = '', as = 'button', href, ...rest }) {
  const cls = `${variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} ${className}`
  const arrowSvg = arrow ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
  ) : null
  if (as === 'a' || href) return <a href={href || '#'} className={cls} {...rest}>{children}{arrowSvg}</a>
  return <button type="button" className={cls} {...rest}>{children}{arrowSvg}</button>
}
