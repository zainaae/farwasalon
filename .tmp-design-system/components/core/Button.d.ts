/** @startingPoint section="Core" subtitle="Square uppercase CTA — primary ink / secondary outline" viewport="700x180" */
export interface ButtonProps {
  /** 'primary' (ink fill) or 'secondary' (outline) */
  variant?: 'primary' | 'secondary';
  /** Append the brand ArrowUpRight glyph */
  arrow?: boolean;
  /** Render as anchor */
  as?: 'button' | 'a';
  href?: string;
  children?: React.ReactNode;
  className?: string;
}
