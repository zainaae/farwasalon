/**
 * Paginated visits fetch for report windows (Today / Month / CSV).
 */

const PAGE = 500

const VISIT_MONEY_SELECT = `
  id, txn_ref, visit_at, status,
  subtotal_pkr, discount_pkr, net_pkr, amount_paid_pkr, due_pkr, payment_mode,
  clients ( id, name, phone_display ),
  visit_items ( name_snapshot, qty, final_price_pkr )
`

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{ start: string, end: string }} range
 * @returns {Promise<{ visits: object[], error: string | null }>}
 */
export async function fetchVisitsInRange(supabase, range) {
  const visits = []
  let from = 0
  let error = null

  while (true) {
    const { data, error: qErr } = await supabase
      .from('visits')
      .select(VISIT_MONEY_SELECT)
      .gte('visit_at', range.start)
      .lte('visit_at', range.end)
      .order('visit_at', { ascending: false })
      .range(from, from + PAGE - 1)

    if (qErr) {
      error = qErr.message
      break
    }

    const batch = data || []
    visits.push(...batch)
    if (batch.length < PAGE) break
    from += PAGE
  }

  return { visits, error }
}
