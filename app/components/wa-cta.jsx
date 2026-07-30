'use client'

import { track } from '../../src/site-config.js'

/* A WhatsApp link that reports itself. Server-rendered pages can drop this in
   place of a bare <a href="wa.me/…"> without becoming client components.
   `from` names the placement so the funnel shows which CTA earned the message.

   The click is not intercepted — no preventDefault, no delay. If tracking
   fails the message still opens, which is the only outcome that matters. */
export default function WaCta({ href, from, className, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={() => track('WhatsAppIntent', { from })}
    >
      {children}
    </a>
  )
}
