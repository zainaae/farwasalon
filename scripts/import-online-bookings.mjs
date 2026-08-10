/**
 * Import Google Sheets Bookings into Supabase clients + appointments.
 *
 * Design: Sheets stays the online booking ledger. CRM gets an import-first
 * mirror in `appointments` (source=online, external_id=FBS-…). Completing a
 * visit at the desk creates a real POS ticket — money is never written back
 * to Sheets.
 *
 * Usage:
 *   npm run pos:import-bookings:dry
 *     Parse + validate Sheet rows (needs Google creds). No Supabase writes.
 *
 *   npm run pos:import-bookings
 *     Upsert clients + appointments. Needs Google + Supabase service role.
 *
 * Optional:
 *   --from=YYYY-MM-DD   --to=YYYY-MM-DD   (Karachi calendar dates on Sheet)
 *
 * Env:
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID
 *   NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { isConfigured, listAllBookingRows } from '../lib/google-sheets.js'
import { karachiYmd } from '../lib/pos/karachi.js'
import { importBookingsFromRows } from '../lib/pos/bookings-import-run.js'
import { normalizeImportRow } from '../lib/pos/bookings-import.js'

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run') || argv.includes('-n')
  let fromYmd = null
  let toYmd = null
  for (const a of argv) {
    if (a.startsWith('--from=')) fromYmd = a.slice('--from='.length)
    if (a.startsWith('--to=')) toYmd = a.slice('--to='.length)
  }
  return { dryRun, fromYmd, toYmd }
}

function requireSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error(
      'Missing env. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.',
    )
    process.exit(1)
  }
  return { url: url.replace(/\/$/, ''), key }
}

async function main() {
  const { dryRun, fromYmd, toYmd } = parseArgs(process.argv.slice(2))

  if (!isConfigured()) {
    console.error(
      'Google Sheets credentials missing or incomplete.\n' +
        'Set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY (with BEGIN PRIVATE KEY), and GOOGLE_SHEET_ID.\n' +
        'Skipping import — public /book is unaffected.',
    )
    process.exit(2)
  }

  const from = fromYmd || karachiYmd()
  const to = toYmd || null
  console.log(
    `Import online bookings${dryRun ? ' (dry-run)' : ''} · from=${from}` +
      (to ? ` · to=${to}` : ' · to=∞'),
  )

  let rows
  try {
    rows = await listAllBookingRows()
  } catch (err) {
    console.error('Failed to read Bookings sheet:', err?.message || err)
    process.exit(1)
  }

  console.log(`Sheet rows (data): ${rows.length}`)

  if (dryRun) {
    let ok = 0
    let skipped = 0
    let errors = 0
    for (const row of rows) {
      const n = normalizeImportRow(row, { fromYmd: from, toYmd: to })
      if (n.ok) {
        ok += 1
        console.log(
          `  ✓ ${n.booking.external_id} ${n.booking.ymd} ${n.booking.phone_display} ${n.booking.service_name} → ${n.booking.status}`,
        )
      } else if (n.skip) {
        skipped += 1
      } else {
        errors += 1
        console.log(`  ✗ ${n.error}`)
      }
    }
    console.log(`Dry-run: ok=${ok} skipped=${skipped} errors=${errors}`)
    return
  }

  const { url, key } = requireSupabaseEnv()
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: catalog } = await supabase
    .from('services_catalog')
    .select('id, name, category, price_pkr, from_price')
    .eq('active', true)

  const summary = await importBookingsFromRows(supabase, rows, {
    fromYmd: from,
    toYmd: to,
    catalog: catalog || [],
  })

  console.log(JSON.stringify(summary, null, 2))
  if (summary.errors.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
