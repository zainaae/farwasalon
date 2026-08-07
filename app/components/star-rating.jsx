/**
 * Five stars as ONE inline <svg>, not five.
 *
 * The homepage shipped 97 copies of lucide's Star at 589 bytes each — 55.8 KB
 * of a 288 KB document, for a single repeated shape, because every review card
 * rendered five separate <svg> elements. Gzip hides that on the wire; the
 * decompress, parse and DOM-construction cost is entirely real on the
 * mid-range Android this site is actually served to, and all of it lands
 * before first paint.
 *
 * One <svg> with five <use> references to a single <symbol> (defined once in
 * the root layout) is ~90 bytes instead of ~2,950 per card.
 *
 * Decorative by default: a rating already stated in adjacent text does not need
 * repeating to a screen reader. Pass `label` where the stars ARE the statement.
 */
export const STAR_SYMBOL_ID = 'i-star'

export default function StarRating({ count = 5, size = 8, className = '', label }) {
  const gap = size * 0.25
  const width = count * size + (count - 1) * gap

  return (
    <svg
      width={width}
      height={size}
      viewBox={`0 0 ${width} ${size}`}
      className={className}
      fill="currentColor"
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' })}
    >
      {Array.from({ length: count }, (_, i) => (
        <use key={i} href={`#${STAR_SYMBOL_ID}`} x={i * (size + gap)} width={size} height={size} />
      ))}
    </svg>
  )
}

/** The single definition. Rendered once, in the root layout. */
export function StarSymbolDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <symbol id={STAR_SYMBOL_ID} viewBox="0 0 24 24">
        <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
      </symbol>
    </svg>
  )
}
