import { describe, it, expect } from 'vitest'
import {
  karachiDayBounds,
  karachiMonthBounds,
  karachiYmd,
} from './karachi.js'
import {
  aggregateVisitMoney,
  assertKpisMatchRows,
  completedVisits,
  collectedByKarachiDay,
  topServicesFromItems,
  visitsMoneyCsv,
  monthDaysCsv,
  csvEscape,
} from './reports.js'

/** Fixed instant: 2026-08-10 14:30 Asia/Karachi = 09:30 UTC */
const KHI_AFTERNOON = new Date('2026-08-10T09:30:00.000Z')

describe('karachi bounds', () => {
  it('day bounds are Karachi midnight..end in UTC', () => {
    const { start, end, ymd } = karachiDayBounds(KHI_AFTERNOON)
    expect(ymd).toBe('2026-08-10')
    expect(start).toBe('2026-08-09T19:00:00.000Z')
    expect(end).toBe('2026-08-10T18:59:59.999Z')
  })

  it('month bounds cover full Karachi calendar month', () => {
    const { start, end, ym, daysInMonth } = karachiMonthBounds('2026-08')
    expect(ym).toBe('2026-08')
    expect(daysInMonth).toBe(31)
    expect(start).toBe('2026-07-31T19:00:00.000Z')
    expect(end).toBe('2026-08-31T18:59:59.999Z')
  })

  it('karachiYmd uses Asia/Karachi not local TZ', () => {
    // 2026-08-10 00:30 Karachi = previous day UTC
    expect(karachiYmd(new Date('2026-08-09T19:30:00.000Z'))).toBe('2026-08-10')
  })
})

const fixtures = [
  {
    txn_ref: '202608-aaaa',
    visit_at: '2026-08-10T06:00:00.000Z',
    status: 'completed',
    payment_mode: 'Cash',
    clients: { name: 'Ayesha' },
    subtotal_pkr: 5000,
    discount_pkr: 500,
    net_pkr: 4500,
    amount_paid_pkr: 4500,
    due_pkr: 0,
    visit_items: [
      { name_snapshot: 'Threading', qty: 1, final_price_pkr: 200 },
      { name_snapshot: 'Facial', qty: 1, final_price_pkr: 4800 },
    ],
  },
  {
    txn_ref: '202608-bbbb',
    visit_at: '2026-08-10T10:00:00.000Z',
    status: 'completed',
    payment_mode: 'Partial',
    clients: { name: 'Sara' },
    subtotal_pkr: 3000,
    discount_pkr: 0,
    net_pkr: 3000,
    amount_paid_pkr: 1000,
    due_pkr: 2000,
    visit_items: [
      { name_snapshot: 'Threading', qty: 2, final_price_pkr: 200 },
      { name_snapshot: 'Manicure', qty: 1, final_price_pkr: 2600 },
    ],
  },
  {
    txn_ref: '202608-void',
    visit_at: '2026-08-10T12:00:00.000Z',
    status: 'voided',
    payment_mode: 'Cash',
    clients: { name: 'Voided' },
    subtotal_pkr: 9999,
    discount_pkr: 0,
    net_pkr: 9999,
    amount_paid_pkr: 9999,
    due_pkr: 0,
    visit_items: [{ name_snapshot: 'Threading', qty: 1, final_price_pkr: 9999 }],
  },
  {
    txn_ref: '202608-cccc',
    visit_at: '2026-08-11T08:00:00.000Z',
    status: 'completed',
    payment_mode: 'JazzCash',
    clients: { name: 'Nadia' },
    subtotal_pkr: 2000,
    discount_pkr: 200,
    net_pkr: 1800,
    amount_paid_pkr: 1800,
    due_pkr: 0,
    visit_items: [{ name_snapshot: 'Facial', qty: 1, final_price_pkr: 2000 }],
  },
]

describe('aggregateVisitMoney', () => {
  it('sums completed only — never voided, never printed floors', () => {
    const day = fixtures.filter((v) =>
      (v.visit_at || '').startsWith('2026-08-10'),
    )
    const kpis = aggregateVisitMoney(day)
    expect(kpis.visits_count).toBe(2)
    expect(kpis.gross_pkr).toBe(8000)
    expect(kpis.discount_pkr).toBe(500)
    expect(kpis.net_pkr).toBe(7500)
    expect(kpis.collected_pkr).toBe(5500)
    expect(kpis.dues_opened_pkr).toBe(2000)
    expect(kpis.avg_net_ticket_pkr).toBe(3750)
  })

  it('day KPI totals match listed completed rows', () => {
    const day = fixtures.filter((v) => karachiYmd(new Date(v.visit_at)) === '2026-08-10')
    const kpis = aggregateVisitMoney(day)
    const check = assertKpisMatchRows(day, kpis)
    expect(check.ok).toBe(true)
    expect(check.mismatches).toEqual([])

    const completed = completedVisits(day)
    expect(completed.reduce((s, v) => s + v.subtotal_pkr, 0)).toBe(kpis.gross_pkr)
    expect(completed.reduce((s, v) => s + v.amount_paid_pkr, 0)).toBe(
      kpis.collected_pkr,
    )
  })
})

describe('topServicesFromItems', () => {
  it('ranks by qty from name_snapshot on completed visits', () => {
    const top = topServicesFromItems(fixtures, 5)
    expect(top[0].name).toBe('Threading')
    expect(top[0].qty).toBe(3) // 1 + 2; voided ignored
    expect(top.find((t) => t.name === 'Facial')?.qty).toBe(2)
  })
})

describe('collectedByKarachiDay', () => {
  it('buckets collected by Karachi day-of-month', () => {
    const month = karachiMonthBounds('2026-08')
    const days = collectedByKarachiDay(fixtures, month)
    expect(days).toHaveLength(31)
    const d10 = days.find((d) => d.ymd === '2026-08-10')
    const d11 = days.find((d) => d.ymd === '2026-08-11')
    expect(d10.collected_pkr).toBe(5500)
    expect(d10.visits_count).toBe(2)
    expect(d11.collected_pkr).toBe(1800)
    expect(days[0].day).toBe(1)
  })
})

describe('CSV', () => {
  it('escapes quotes and commas', () => {
    expect(csvEscape('a,b')).toBe('"a,b"')
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
  })

  it('visits CSV completed-column sums match KPIs', () => {
    const day = fixtures.filter((v) => karachiYmd(new Date(v.visit_at)) === '2026-08-10')
    const kpis = aggregateVisitMoney(day)
    const csv = visitsMoneyCsv(day, { includeVoided: false })
    const lines = csv.trim().split(/\r?\n/).slice(1)
    expect(lines).toHaveLength(2)
    let gross = 0
    let collected = 0
    for (const line of lines) {
      const cols = line.split(',')
      // subtotal_pkr is index 6 when no commas in fields
      gross += Number(cols[6])
      collected += Number(cols[9])
    }
    expect(gross).toBe(kpis.gross_pkr)
    expect(collected).toBe(kpis.collected_pkr)
  })

  it('month days CSV lists every day', () => {
    const month = karachiMonthBounds('2026-08')
    const days = collectedByKarachiDay(fixtures, month)
    const csv = monthDaysCsv(days)
    expect(csv.split(/\r?\n/).filter(Boolean)).toHaveLength(32) // header + 31
  })
})
