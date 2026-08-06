/**
 * The arrow that appears 47 times on the homepage alone.
 *
 * lucide-react renders each icon as a fresh inline <svg>. `ArrowUpRight` is
 * 262 bytes a copy and the homepage ships 47 of them — about 12 KB of one
 * repeated glyph, before the other lucide icons are counted. Gzip hides that
 * on the wire; the decompress, parse and DOM-construction cost is real on the
 * mid-range Android this site is actually served to, and all of it lands
 * before first paint.
 *
 * This is the same fix the star sprite already made: one <symbol> defined once
 * in the root layout, and a ~70-byte <use> at each call site.
 *
 * Decorative by default. Every one of these sits inside a link or button whose
 * text already says where it goes, so repeating "arrow up right" to a screen
 * reader adds nothing. Pass `label` on the rare occasion the glyph is the
 * only content.
 */
export const ARROW_SYMBOL_ID = 'i-arrow-ur'

export default function ArrowUpRight({ className = '', label }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' })}
    >
      <use href={`#${ARROW_SYMBOL_ID}`} />
    </svg>
  )
}

/** The single definition. Rendered once, in the root layout. */
export function IconSymbolDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <symbol
        id={ARROW_SYMBOL_ID}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 7h10v10" />
        <path d="M7 17 17 7" />
      </symbol>
    </svg>
  )
}
