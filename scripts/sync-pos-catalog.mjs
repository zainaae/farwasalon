/**
 * Sync POS `services_catalog` from the public menu in `src/data.js`.
 *
 * Source of truth: `ALL_SERVICES` / `SERVICES` (ids, names, categories,
 * pricePkr, durationMinutes, fromPrice). Does not invent prices.
 *
 * `from_price` mirrors site `fromPrice` (Hair, Hair Treatments, Bridal → true).
 *
 * Usage:
 *   node scripts/sync-pos-catalog.mjs --dry-run
 *     Print row count (+ from_price breakdown). No network.
 *
 *   node scripts/sync-pos-catalog.mjs
 *     Upsert into Supabase. Requires env:
 *       NEXT_PUBLIC_SUPABASE_URL   (or SUPABASE_URL)
 *       SUPABASE_SERVICE_ROLE_KEY  (server-only; never expose to browser)
 *
 * Live sync also marks catalog rows missing from the site menu as active=false
 * (keeps history; POS pickers should filter active=true).
 *
 * Loads `.env` then `.env.local` from the repo root (local wins).
 * Existing process.env values are left untouched. Does not print secrets.
 *
 * Settings UI: skip until Foundation ships `/admin/settings` — then wire a
 * “Sync catalog” button that shells this script or calls a trusted server route.
 *
 * README snippet:
 *   # Dry-run (expect count == ALL_SERVICES length, currently 102)
 *   node scripts/sync-pos-catalog.mjs --dry-run
 *   # Apply migration, then upsert against live project
 *   npx supabase db push   # or SQL editor: run migrations in order
 *   # Uses NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local
 *   node scripts/sync-pos-catalog.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ALL_SERVICES } from '../src/data.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Load KEY=VAL from a dotenv-style file. Does not override existing env. */
function loadEnvFile(filePath) {
  let text
  try {
    text = fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    if (err && err.code === 'ENOENT') return false
    throw err
  }
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    if (Object.prototype.hasOwnProperty.call(process.env, key)) continue
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
  return true
}

function loadProjectEnv() {
  const loaded = []
  for (const name of ['.env', '.env.local']) {
    if (loadEnvFile(path.join(ROOT, name))) loaded.push(name)
  }
  if (loaded.length) {
    console.log(`Loaded env from ${loaded.join(', ')}`)
  }
}

const TABLE = 'services_catalog'
const BATCH = 100

function parseArgs(argv) {
  const dryRun = argv.includes('--dry-run') || argv.includes('-n')
  return { dryRun }
}

/** Map one site service → catalog row (snake_case columns). */
export function toCatalogRow(svc, updatedAt = new Date().toISOString()) {
  if (svc == null || typeof svc.id !== 'number') {
    throw new Error(`Invalid service (missing id): ${JSON.stringify(svc)}`)
  }
  if (typeof svc.pricePkr !== 'number' || svc.pricePkr < 0) {
    throw new Error(`Service id=${svc.id} missing pricePkr — refuse to invent`)
  }
  return {
    id: svc.id,
    name: svc.name,
    category: svc.category,
    price_pkr: svc.pricePkr,
    duration_minutes: svc.durationMinutes ?? null,
    from_price: Boolean(svc.fromPrice),
    active: true,
    updated_at: updatedAt,
  }
}

export function buildCatalogRows(services = ALL_SERVICES) {
  return services.map((s) => toCatalogRow(s))
}

function printDryRun(rows) {
  const fromPrice = rows.filter((r) => r.from_price)
  const byCategory = new Map()
  for (const r of rows) {
    byCategory.set(r.category, (byCategory.get(r.category) || 0) + 1)
  }
  console.log(`services_catalog dry-run: ${rows.length} rows`)
  console.log(`  from_price=true: ${fromPrice.length} (Hair / Hair Treatments / Bridal)`)
  console.log('  by category:')
  for (const [cat, n] of [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`    ${cat}: ${n}`)
  }
}

function requireEnv() {
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

async function upsertBatch(url, key, rows) {
  const res = await fetch(`${url}/rest/v1/${TABLE}?on_conflict=id`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Upsert failed (${res.status}): ${body}`)
  }
}

async function deactivateMissing(url, key, keepIds) {
  // Fetch active ids, deactivate any not in the current site menu.
  const res = await fetch(
    `${url}/rest/v1/${TABLE}?select=id&active=eq.true`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    },
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`List active failed (${res.status}): ${body}`)
  }
  const existing = await res.json()
  const keep = new Set(keepIds)
  const stale = existing.map((r) => r.id).filter((id) => !keep.has(id))
  if (stale.length === 0) return 0

  const now = new Date().toISOString()
  const patch = await fetch(`${url}/rest/v1/${TABLE}?id=in.(${stale.join(',')})`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ active: false, updated_at: now }),
  })
  if (!patch.ok) {
    const body = await patch.text()
    throw new Error(`Deactivate stale failed (${patch.status}): ${body}`)
  }
  return stale.length
}

async function syncLive(rows) {
  const { url, key } = requireEnv()
  for (let i = 0; i < rows.length; i += BATCH) {
    await upsertBatch(url, key, rows.slice(i, i + BATCH))
  }
  const deactivated = await deactivateMissing(
    url,
    key,
    rows.map((r) => r.id),
  )
  console.log(
    `services_catalog sync: upserted ${rows.length} rows` +
      (deactivated ? `, deactivated ${deactivated} stale` : ''),
  )
}

async function main() {
  loadProjectEnv()
  const { dryRun } = parseArgs(process.argv.slice(2))
  const rows = buildCatalogRows()

  if (dryRun) {
    printDryRun(rows)
    return
  }

  await syncLive(rows)
}

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('sync-pos-catalog.mjs') ||
    process.argv[1].includes('sync-pos-catalog'))

if (isDirectRun) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
