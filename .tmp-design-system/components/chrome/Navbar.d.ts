export interface NavbarProps {
  /** true = white/95 blur bar (interior/scrolled); false = ink/35 over dark hero */
  light?: boolean;
  /** Active link label */
  active?: string;
  links?: string[];
  /** Path to assets/logo.jpg (image mark, light mode only); omit for FARWA wordmark */
  logoSrc?: string;
  onNavigate?: (label: string) => void;
}
