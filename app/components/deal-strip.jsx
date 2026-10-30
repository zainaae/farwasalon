import { connection } from 'next/server'
import {
  getHeadlineDeal,
  getActiveDeals,
  formatDealRange,
  buildDealStripModel,
} from '../../src/deals-data.js'
import DealStripClient from './deal-strip-client.jsx'

/**
 * Request-time gate for the sitewide deal band.
 *
 * A client component that called getHeadlineDeal() during SSG baked the
 * Freedom Deal "Now on" HTML into / and /prices for the whole campaign —
 * and that HTML stayed live for months after validUntil. connection() opts
 * this subtree into dynamic rendering so expiry is evaluated on each request.
 */
export default async function DealStrip({ from = 'home' } = {}) {
  await connection()
  const deal = getHeadlineDeal()
  const model = buildDealStripModel(deal, {
    live: deal ? getActiveDeals().some((d) => d.id === deal.id) : false,
    range: deal ? formatDealRange(deal) : '',
  })
  if (!model) return null
  return <DealStripClient from={from} {...model} />
}
