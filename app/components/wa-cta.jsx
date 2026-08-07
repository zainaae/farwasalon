'use client'

import { track } from '../../src/site-config.js'

/**
 * A WhatsApp link that reports itself.
 *
 * WhatsApp is the primary way customers here actually reach the salon, and 21
 * of the site's 25 entry points fired no event at all — so nothing could answer
 * whether the sticky bar outperformed the hero, whether /prices sent more
 * people to WhatsApp than /services, or whether a campaign page earned a single
 * message. `from` names the placement, which is the whole point: an aggregate
 * WhatsApp count you cannot break down by source tells you almost nothing.
 *
 * track() also maps WhatsAppIntent to Meta's `Contact`, so every site converted
 * here feeds ad optimisation the moment a Pixel ID is set. Before this, the ads
 * would have been optimising against 4 of 25 signals.
 *
 * Server components can drop this in place of a bare <a> without becoming
 * client components — it is a client leaf.
 *
 * The click is never intercepted: no preventDefault, no delay, no awaiting the
 * beacon. If tracking fails the message still opens, which is the only outcome
 * that matters.
 */
export default function WaCta({ href, from, className, children, onClick, ...rest }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={(e) => {
        track('WhatsAppIntent', { from })
        onClick?.(e)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
