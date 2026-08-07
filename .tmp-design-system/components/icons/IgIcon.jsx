import React from 'react'

/** Instagram glyph — custom stroke icon from src/shared-chrome.jsx. */
export function IgIcon({ size = 16, className = '' }) {
  return (
    <svg aria-hidden="true" width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <circle cx="12" cy="12" r="4.5"></circle>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"></circle>
    </svg>
  )
}
