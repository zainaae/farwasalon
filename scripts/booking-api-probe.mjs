#!/usr/bin/env node
/**
 * Probe /api/slots and /api/book validation without UI.
 * Usage:
 *   node scripts/booking-api-probe.mjs
 *   BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs
 *   PROBE_WRITE=1 node scripts/booking-api-probe.mjs   # creates one test booking
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const WRITE = process.env.PROBE_WRITE === '1'

/** Local calendar date YYYY-MM-DD (avoids UTC shift from toISOString). */
function localDateIso(ref = new Date()) {
  const y = ref.getFullYear()
  const m = String(ref.getMonth() + 1).padStart(2, '0')
  const d = String(ref.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function offsetDays(n) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return localDateIso(d)
}

/** First weekday (Mon–Sat) at offset n from today. */
function offsetWeekday(n) {
  let d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  while (d.getDay() === 0) d.setDate(d.getDate() + 1)
  return localDateIso(d)
}

async function probe(name, url, init = {}, expect = {}) {
  const { status: expectStatus, statusIn } = expect
  const start = Date.now()
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Origin: process.env.PROBE_ORIGIN || 'https://farwasalon.com',
        ...init.headers,
      },
      signal: AbortSignal.timeout(30_000),
    })
    const ms = Date.now() - start
    let body
    const text = await res.text()
    try {
      body = JSON.parse(text)
    } catch {
      body = text.slice(0, 200)
    }
    const statusOk =
      expectStatus != null
        ? res.status === expectStatus
        : statusIn
          ? statusIn.includes(res.status)
          : res.ok
    const tag = statusOk ? 'OK' : 'FAIL'
    console.log(
      `[${tag}] ${name} → ${res.status} (${ms}ms)`,
      typeof body === 'object' ? JSON.stringify(body).slice(0, 120) : body,
    )
    return { res, body, ms, pass: statusOk }
  } catch (err) {
    console.log(`[ERR] ${name} →`, err.message)
    return { err, pass: false }
  }
}

async function main() {
  console.log(`Probing ${BASE}`)
  console.log(`Local today: ${localDateIso()}\n`)

  const results = []

  results.push(
    await probe(
      'slots today',
      `${BASE}/api/slots?date=${localDateIso()}&serviceId=1`,
      {},
      { status: 200 },
    ),
  )
  results.push(
    await probe(
      'slots +14d',
      `${BASE}/api/slots?date=${offsetDays(14)}&serviceId=1`,
      {},
      { status: 200 },
    ),
  )
  results.push(
    await probe(
      'slots +15d (reject)',
      `${BASE}/api/slots?date=${offsetDays(15)}&serviceId=1`,
      {},
      { status: 400 },
    ),
  )
  results.push(
    await probe(
      'slots yesterday (reject)',
      `${BASE}/api/slots?date=${offsetDays(-1)}&serviceId=1`,
      {},
      { status: 400 },
    ),
  )
  results.push(
    await probe(
      'slots addon',
      `${BASE}/api/slots?date=${offsetWeekday(2)}&serviceId=1&addonIds=2`,
      {},
      { status: 200 },
    ),
  )

  results.push(
    await probe(
      'book past date (reject)',
      `${BASE}/api/book`,
      {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 1,
          date: offsetDays(-1),
          time: '11:00',
          clientName: 'Probe Test',
          clientPhone: '03001234567',
        }),
      },
      { status: 400 },
    ),
  )

  results.push(
    await probe(
      'book invalid time 09:00 (reject)',
      `${BASE}/api/book`,
      {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 1,
          date: offsetWeekday(2),
          time: '09:00',
          clientName: 'Probe Test',
          clientPhone: '03001234567',
        }),
      },
      { status: 400 },
    ),
  )

  if (WRITE) {
    console.log('\nPROBE_WRITE=1 — attempting real booking on +3 weekday 11:00…')
    results.push(
      await probe(
        'book write',
        `${BASE}/api/book`,
        {
          method: 'POST',
          body: JSON.stringify({
            serviceId: 1,
            date: offsetWeekday(3),
            time: '11:00',
            clientName: 'API Probe Test',
            clientPhone: '03009999999',
            notes: 'Safe to cancel — automated probe',
          }),
        },
        { statusIn: [200, 409] },
      ),
    )
  } else {
    console.log('\nSkip live write (set PROBE_WRITE=1 to create one test row).')
  }

  const passed = results.filter((r) => r.pass).length
  const total = results.length
  console.log(`\n${passed}/${total} scenarios matched expected status.`)
  if (passed < total) {
    console.log(
      'Tip: production may lag local fixes (14-day book rules, time grid 400). Deploy latest master then re-run.',
    )
    process.exitCode = 1
  }
}

main()
