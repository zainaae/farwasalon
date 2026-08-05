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
 * Homepage editorial marquee — prefer owned assets where available.
 * `href` is a stay-path (gallery or money page); default /gallery.
 * @type {(SalonMediaItem & { href?: string })[]}
 */
export const EDITORIAL_PHOTOS = [
  { src: '/bridal.jpg', label: 'Bridal', href: '/bridal' },
  { src: '/eyebrowtattoo.jpg', label: 'Eyebrow Tattoo', href: '/services/eyebrow-tattoo' },
  { src: SALON_OWNED.nailsPoster, label: 'Nail craft', video: SALON_OWNED.nailsVideo, href: '/services/nails' },
  { src: '/glow3.jpg', label: 'Facials', href: '/services/facials' },
  { src: '/threading.jpg', label: 'Threading', href: '/services/threading' },
  { src: '/hairdo.jpg', label: 'Hair', href: '/services/hair' },
  { src: '/oilwax.jpg', label: 'Rica Wax', href: '/services/rica-hot-wax' },
  { src: '/facialcleansing.jpg', label: 'Cleansing', href: '/services/facials' },
  { src: '/massage.jpg', label: 'Massage', href: '/services/massage' },
  { src: '/pedicure.jpg', label: 'Nail finish', href: '/services/nails' },
  { src: '/wax2.jpg', label: 'Honey Wax', href: '/services/honey-wax' },
  { src: '/hairtreatment.jpg', label: 'Hair treatments', href: '/services/hair' },
  { src: '/bleachpolish.jpg', label: 'Bleach & polish', href: '/gallery' },
]
