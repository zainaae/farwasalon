export interface TabPillProps {
  /** Selected state — ink fill, white text */
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
