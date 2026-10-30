import { permanentRedirect } from 'next/navigation'

/** Ended campaign — next.config also 301s aliases here to /deals. */
export default function FreedomDealRedirect() {
  permanentRedirect('/deals')
}
