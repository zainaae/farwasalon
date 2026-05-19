/** Videos that have a smaller WebM variant in /public.
 *  Built by scripts/compress-videos.sh — VP9 isn't always smaller than H.264. */
export const HAS_WEBM = new Set([
  'hero-mp4',
  'manicurephotography',
])

/** Given an MP4 src like "/hero-mp4.mp4", return the webm src if it exists, else null. */
export function webmSourceFor(mp4Src) {
  if (typeof mp4Src !== 'string') return null
  const m = mp4Src.match(/^\/?(.+)\.mp4$/)
  if (!m) return null
  return HAS_WEBM.has(m[1]) ? mp4Src.replace(/\.mp4$/, '.webm') : null
}
