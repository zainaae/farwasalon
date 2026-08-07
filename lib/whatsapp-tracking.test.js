/**
 * Every WhatsApp entry point must report itself.
 *
 * WhatsApp is how customers here actually reach the salon, and 21 of 25 entry
 * points fired no event — so nothing could say whether the sticky bar beat the
 * hero, whether /prices sent more people than /services, or whether a campaign
 * page earned a single message. An aggregate count you cannot break down by
 * source answers none of those.
 *
 * This test fails when a new wa.me link ships without going through WaCta,
 * because the cost of that is invisible: the link works perfectly, and the
 * measurement is simply absent.
 */
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Post-conversion support links, deliberately outside the lead funnel.
 *  WhatsAppIntent maps to Meta's `Contact`, so counting a confirmed customer's
 *  hand-off or a cancellation as an enquiry would double-count the funnel and
 *  train ad delivery toward people who cancel. */
const EXEMPT = new Set([
  'app/book/book-client.jsx', // post-booking hand-off, already counted as BookingCompleted
  'app/book/cancel/cancel-client.jsx', // a cancellation is not an enquiry
  'app/components/wa-cta.jsx', // the tracker itself
])

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.next', '.git', 'test-results'].includes(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(jsx|js)$/.test(entry) && !entry.includes('.test.')) out.push(full)
  }
  return out
}

const WA_LINK = /href=\{?[^\n]{0,80}(?:wa\.me|waLink|WA_DEFAULT)/g

describe('WhatsApp links are instrumented', () => {
  const offenders = []

  for (const file of walk(join(ROOT, 'app')).concat(walk(join(ROOT, 'src')))) {
    const rel = relative(ROOT, file).split(sep).join('/')
    if (EXEMPT.has(rel)) continue
    const source = readFileSync(file, 'utf8')
    const links = (source.match(WA_LINK) || []).length
    if (!links) continue
    const tracked = (source.match(/<WaCta/g) || []).length + (source.match(/track\('WhatsAppIntent'/g) || []).length
    if (tracked < links) offenders.push(`${rel} (${links} link(s), ${tracked} tracked)`)
  }

  it('every wa.me link goes through WaCta or calls track() itself', () => {
    expect(
      offenders,
      'These WhatsApp links ship untracked. Use <WaCta from="placement"> so the ' +
        'funnel can attribute the message, or add the file to EXEMPT with a reason.\n' +
        offenders.join('\n'),
    ).toEqual([])
  })

  it('each placement name is unique, so the funnel can tell them apart', () => {
    const names = []
    for (const file of walk(join(ROOT, 'app'))) {
      for (const [, name] of readFileSync(file, 'utf8').matchAll(/from="([a-z0-9-]+)"/g)) names.push(name)
    }
    expect(names.length, 'no placements found — did WaCta usage change?').toBeGreaterThan(10)
    expect(new Set(names).size, `duplicate placement names: ${names.join(', ')}`).toBe(names.length)
  })
})
