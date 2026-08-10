import { NextResponse } from 'next/server'
import { requireStaff } from '../../../../../lib/supabase/staff.js'
import { createClient } from '../../../../../lib/supabase/server.js'
import { karachiMonthBounds, karachiYmd } from '../../../../../lib/pos/karachi.js'
import {
  collectedByKarachiDay,
  monthDaysCsv,
  visitsMoneyCsv,
} from '../../../../../lib/pos/reports.js'
import { fetchVisitsInRange } from '../../../../../lib/pos/reports-fetch.js'

export const dynamic = 'force-dynamic'

function parseYm(raw) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}$/.test(raw)) return raw
  return karachiYmd().slice(0, 7)
}

/**
 * GET /admin/export/month?ym=YYYY-MM&kind=visits|days
 * visits = ticket rows; days = day-of-month collected table.
 */
export async function GET(request) {
  await requireStaff()
  const sp = request.nextUrl.searchParams
  const ym = parseYm(sp.get('ym'))
  const kind = sp.get('kind') === 'days' ? 'days' : 'visits'
  const month = karachiMonthBounds(ym)
  const supabase = await createClient()
  const { visits, error } = await fetchVisitsInRange(supabase, month)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  let csv
  let filename
  if (kind === 'days') {
    csv = monthDaysCsv(collectedByKarachiDay(visits, month))
    filename = `farwa-days-${ym}.csv`
  } else {
    csv = visitsMoneyCsv(visits, { includeVoided: true })
    filename = `farwa-visits-${ym}.csv`
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
