/**
 * Salon-owned media paths — swap these when new PECHS photos are ready.
 * See docs/salon-photography-guide.md for the owner checklist.
 */

/** @typedef {{ src: string, label: string, video?: string, alt?: string }} SalonMediaItem */

/** Owned salon footage (not stock). */
export const SALON_OWNED = {
  nailsVideo: '/manicurephotography.webm',
  nailsPoster: '/pedicure.jpg',
}

/**
 * Homepage editorial marquee — prefer owned assets where available.
 * @type {SalonMediaItem[]}
 */
export const EDITORIAL_PHOTOS = [
  { src: '/bridal.jpg', label: 'Bridal' },
  { src: '/eyebrowtattoo.jpg', label: 'Eyebrow Tattoo' },
  { src: SALON_OWNED.nailsPoster, label: 'Nail craft', video: SALON_OWNED.nailsVideo },
  { src: '/glow3.jpg', label: 'Facials' },
  { src: '/threading.jpg', label: 'Threading' },
  { src: '/hairdo.jpg', label: 'Hair' },
  { src: '/oilwax.jpg', label: 'Rica Wax' },
  { src: '/facialcleansing.jpg', label: 'Cleansing' },
  { src: '/massage.jpg', label: 'Massage' },
  { src: '/pedicure.jpg', label: 'Nail finish' },
  { src: '/wax2.jpg', label: 'Honey Wax' },
  { src: '/hairtreatment.jpg', label: 'Hair treatments' },
  { src: '/bleachpolish.jpg', label: 'Bleach & polish' },
]
