export interface ReviewProofProps {
  /** 3–5 photo paths, cropped to square mats (never circles) */
  images?: string[];
  /** e.g. "4.6★" — real numbers only */
  rating?: string;
  /** Trust line under the rating */
  line?: string;
  /** White text for dark grounds */
  onDark?: boolean;
}
