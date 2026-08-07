import React from 'react'

/** Small link row on soft ground with trailing arrow. */
export function CardLink({ children, href = '#', ...rest }) {
  return (
    <a href={href} className="card-link" {...rest}>
      <span>{children}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 7h10v10"></path><path d="M7 17 17 7"></path></svg>
    </a>
  )
}
