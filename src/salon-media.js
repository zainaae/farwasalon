/**
 * Salon-owned media paths — swap these when new PECHS photos are ready.
 * See docs/salon-photography-guide.md for the owner checklist.
 */

/** @typedef {{ src: string, label: string, video?: string, alt?: string }} SalonMediaItem */

/** Owned salon footage (not stock). */
export const SALON_OWNED = {
  nailsVideo: '/manicurephotography.mp4',
  nailsPoster: '/pedicure.jpg',
}

/**
 * Homepage editorial marquee removed in Sprint B′ — destinations live in
 * FeaturedServices / QuickPick. Kept empty so stale imports fail closed.
 * @type {(SalonMediaItem & { href?: string })[]}
 */
export const EDITORIAL_PHOTOS = []
