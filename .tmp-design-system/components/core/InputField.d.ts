export interface InputFieldProps {
  /** Uppercase micro-label above the field */
  label?: string;
  /** Small stone-colored helper below */
  hint?: string;
  id?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: any) => void;
  className?: string;
}
