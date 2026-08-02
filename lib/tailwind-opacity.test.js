import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Tailwind only generates opacity modifiers for values in its theme scale
 *  (multiples of 5). `bg-ink/92` silently compiles to NOTHING — which is how
 *  the mobile sticky CTA shipped with no background at all, rendering white
 *  text on a transparent bar. Bracket syntax (`bg-ink/[0.92]`) always works. */

const ROOT = join(__dirname, '..')
const UTILITIES =
  'bg|text|border|from|via|to|shadow|ring|ring-offset|fill|stroke|divide|placeholder|outline|decoration|accent|caret'
const OPACITY_MODIFIER = new RegExp(`\\b(?:${UTILITIES})-[a-z0-9-]+/(\\d{1,3})\\b`, 'g')

function sourceFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) sourceFiles(full, acc)
    else if (/\.(jsx?|tsx?)$/.test(entry) && !/\.test\./.test(entry)) acc.push(full)
  }
  return acc
}

describe('Tailwind opacity modifiers', () => {
  it('only uses values Tailwind can compile (multiples of 5, or bracket syntax)', () => {
    const offenders = []
    for (const file of [...sourceFiles(join(ROOT, 'app')), ...sourceFiles(join(ROOT, 'src'))]) {
      const text = readFileSync(file, 'utf8')
      for (const [match, value] of text.matchAll(OPACITY_MODIFIER)) {
        if (Number(value) % 5 !== 0) {
          offenders.push(`${file.replace(ROOT, '').replace(/\\/g, '/')}: ${match}`)
        }
      }
    }
    expect(offenders, `Use bracket syntax instead, e.g. bg-ink/[0.92]:\n${offenders.join('\n')}`).toEqual([])
  })
})
