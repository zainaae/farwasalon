/**
 * Admin inventory server actions — products + stock movements.
 * qty_on_hand changes only via record_stock_movement RPC.
 */
'use server'

import { revalidatePath } from 'next/cache'
import {
  buildAdjustDelta,
  validateProductCreate,
  validateStockMovement,
} from '../../../../lib/pos/stock.js'
import { createClient } from '../../../../lib/supabase/server.js'
import { requireStaff } from '../../../../lib/supabase/staff.js'

function trimStr(v) {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Create a product at qty 0 (seed stock with a purchase movement).
 * @param {object} input
 */
export async function createProductAction(input) {
  await requireStaff()

  const draft = validateProductCreate({
    sku: input?.sku,
    name: input?.name,
    kind: input?.kind,
    unit: input?.unit,
    reorder_level: input?.reorder_level,
    sale_price_pkr: input?.sale_price_pkr,
  })

  if (!draft.ok) {
    return { ok: false, error: draft.errors.join('; ') }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .insert({
      sku: draft.sku,
      name: draft.name,
      kind: draft.kind,
      unit: draft.unit,
      qty_on_hand: 0,
      reorder_level: draft.reorder_level,
      sale_price_pkr: draft.sale_price_pkr,
      active: true,
    })
    .select(
      'id, sku, name, kind, unit, qty_on_hand, reorder_level, sale_price_pkr, active',
    )
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'A product with this SKU already exists.' }
    }
    return { ok: false, error: error.message || 'Could not create product.' }
  }

  revalidatePath('/admin/inventory')
  return { ok: true, product: data }
}

/**
 * Adjust stock in/out via movement (never silent qty edit).
 *
 * @param {{
 *   product_id: string,
 *   direction: 'in' | 'out',
 *   amount: number,
 *   reason?: string,
 *   notes?: string,
 *   qty_on_hand?: number,
 * }} input
 */
export async function adjustStockAction(input) {
  await requireStaff()

  const product_id = trimStr(input?.product_id)
  if (!product_id) return { ok: false, error: 'Select a product.' }

  const built = buildAdjustDelta({
    direction: input?.direction,
    amount: Number(input?.amount),
    reason: input?.reason,
  })
  if (!built.ok) {
    return { ok: false, error: built.errors.join('; ') }
  }

  const draft = validateStockMovement({
    product_id,
    delta: built.delta,
    reason: built.reason,
    notes: input?.notes,
    qty_on_hand:
      input?.qty_on_hand == null || input?.qty_on_hand === ''
        ? undefined
        : Number(input.qty_on_hand),
  })
  if (!draft.ok) {
    return { ok: false, error: draft.errors.join('; ') }
  }

  const supabase = await createClient()
  const payload = {
    product_id: draft.product_id,
    delta: draft.delta,
    reason: draft.reason,
    notes: draft.notes,
  }

  const { data, error } = await supabase.rpc('record_stock_movement', {
    payload,
  })

  if (error) {
    const msg = error.message || 'Stock update failed.'
    if (/insufficient stock/i.test(msg)) {
      return {
        ok: false,
        error: 'Insufficient stock — movement would make qty negative.',
      }
    }
    if (/qty_on_hand only via/i.test(msg)) {
      return { ok: false, error: 'Stock qty can only change via movements.' }
    }
    return { ok: false, error: msg }
  }

  if (!data?.ok || !data?.movement_id) {
    return { ok: false, error: 'Stock update failed — empty RPC response.' }
  }

  revalidatePath('/admin/inventory')
  return {
    ok: true,
    movement_id: data.movement_id,
    product_id: data.product_id,
    delta: Number(data.delta),
    reason: data.reason,
    qty_on_hand: Number(data.qty_on_hand),
  }
}

/**
 * Toggle active flag (does not touch qty_on_hand).
 * @param {{ product_id: string, active: boolean }} input
 */
export async function setProductActiveAction(input) {
  await requireStaff()
  const product_id = trimStr(input?.product_id)
  if (!product_id) return { ok: false, error: 'Missing product id.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .update({ active: Boolean(input?.active) })
    .eq('id', product_id)
    .select('id, active')
    .single()

  if (error) {
    return { ok: false, error: error.message || 'Could not update product.' }
  }

  revalidatePath('/admin/inventory')
  return { ok: true, product: data }
}
