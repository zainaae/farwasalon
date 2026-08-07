export interface StarRatingProps {
  /** Number of stars (default 5) */
  count?: number;
  /** Star height in px (default 8 — they run small) */
  size?: number;
  className?: string;
  /** aria-label when the stars ARE the statement */
  label?: string;
}
