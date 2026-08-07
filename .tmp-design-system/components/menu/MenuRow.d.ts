/** @startingPoint section="Menu" subtitle="Priced category row from the couture services menu" viewport="700x220" */
export interface MenuRowProps {
  /** Category photo (framed in a 3px white mat) */
  img?: string;
  name: string;
  tagline?: string;
  /** Number of services in the category */
  count?: number;
  /** e.g. "Usually available same-day" */
  availability?: string;
  /** Formatted floor price, e.g. "Rs 100" */
  fromPrice?: string;
  /** Shows the gold "Most booked" tag */
  popular?: boolean;
  onClick?: () => void;
}
