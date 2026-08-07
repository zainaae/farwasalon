export interface QuickPickCardProps {
  /** Category name, e.g. "Threading" */
  title: string;
  /** Second line — usually "From Rs 200" */
  meta?: string;
  /** Dashed "view all" variant */
  all?: boolean;
  onClick?: () => void;
}
