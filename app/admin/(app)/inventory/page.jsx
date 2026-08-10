import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/server.js'
import { isLowStock } from '../../../../lib/pos/stock.js'
import { formatPrice } from '../pos-format.js'
import AdjustStockForm from './adjust-stock-form.jsx'
import NewProductForm from './new-product-form.jsx'

export const metadata = {
  title: 'Inventory',
  robots: { index: false, follow: false },
}

function formatQty(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return '—'
  return Number.isInteger(v) ? String(v) : String(v)
}

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, sku, name, kind, unit, qty_on_hand, reorder_level, sale_price_pkr, active, updated_at',
    )
    .order('name')

  const products = data || []
  const loadError = error?.message || null
  const low = products.filter((p) => isLowStock(p))
  const active = products.filter((p) => p.active !== false)

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink">
            Inventory
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Shelf stock changes only through movements — never silent qty edits.
          </p>
        </div>
        <Link
          href="/admin/visits/new"
          className="inline-flex items-center justify-center rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink"
        >
          New visit
        </Link>
      </div>

      {loadError && (
        <p
          role="alert"
          className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {loadError}
          {/relation .*products.* does not exist|Could not find the table/i.test(
            loadError,
          ) && (
            <span className="mt-1 block text-xs">
              Apply migration{' '}
              <code className="font-mono">20260810170000_inventory.sql</code>{' '}
              (see docs/admin-pos-setup.md).
            </span>
          )}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="border border-ink/10 bg-white/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            Products
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold">
            {active.length}
          </p>
        </div>
        <div className="border border-ink/10 bg-white/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            Low stock
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold">
            {low.length}
          </p>
        </div>
        <div className="border border-ink/10 bg-white/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/55">
            Inactive
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold">
            {products.length - active.length}
          </p>
        </div>
      </div>

      {low.length > 0 && (
        <div className="mt-6 border border-amber-200/80 bg-amber-50/70 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-900/70">
            Low stock
          </p>
          <ul className="mt-2 space-y-1 text-sm text-amber-950">
            {low.map((p) => (
              <li key={p.id}>
                <span className="font-mono text-xs">{p.sku}</span> — {p.name}:{' '}
                {formatQty(p.qty_on_hand)} {p.unit} (reorder{' '}
                {formatQty(p.reorder_level)})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 border-y border-ink/10 bg-white/50 px-4 py-5">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight">
          Adjust in / out
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          Example: Out −5 with reason adjust creates a movement and updates qty.
        </p>
        <AdjustStockForm products={products} />
      </div>

      <div className="mt-8">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight">
          Products
        </h2>
        {products.length === 0 ? (
          <div className="mt-4 rounded-sm border border-dashed border-ink/20 bg-white/60 px-5 py-10 text-center text-sm text-ink/50">
            No products yet — add a SKU below, then record a purchase in.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 bg-white/50">
            {products.map((p) => {
              const lowFlag = isLowStock(p)
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">
                      {p.name}
                      {lowFlag && (
                        <span className="ml-2 inline-block rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-900">
                          Low
                        </span>
                      )}
                      {p.active === false && (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/40">
                          Inactive
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-ink/50">
                      {p.sku} · {p.kind} · {p.unit}
                      {p.sale_price_pkr != null
                        ? ` · ${formatPrice(p.sale_price_pkr)}`
                        : ''}
                    </p>
                  </div>
                  <div className="text-right text-sm tabular-nums text-ink">
                    <span className="font-medium">
                      {formatQty(p.qty_on_hand)}
                    </span>
                    <span className="text-ink/45"> {p.unit}</span>
                    <p className="text-[11px] text-ink/40">
                      reorder {formatQty(p.reorder_level)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="mt-8 border-y border-ink/10 bg-white/50 px-4 py-5">
        <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold tracking-tight">
          Add product
        </h2>
        <p className="mt-1 text-sm text-ink/55">
          New SKUs start at qty 0. Seed stock with a purchase (In) movement.
        </p>
        <NewProductForm />
      </div>
    </section>
  )
}
