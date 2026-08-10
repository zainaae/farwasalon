import { NextResponse } from 'next/server'
import { requireStaff } from '../../../../../lib/supabase/staff.js'
import { createClient } from '../../../../../lib/supabase/server.js'
import { karachiDayBounds } from '../../../../../lib/pos/karachi.js'
import { visitsMoneyCsv } from '../../../../../lib/pos/reports.js'
import { fetchVisitsInRange } from '../../../../../lib/pos/reports-fetch.js'

export const dynamic = 'force-dynamic'

function dayBoundsFromParam(raw) {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return karachiDayBounds(new Date(`${raw}T12:00:00+05:00`))
  }
  return karachiDayBounds()
}

/** GET /admin/export/day?ymd=YYYY-MM-DD — visit money CSV for Karachi day. */
export async function GET(request) {
  await requireStaff()
  const ymdParam = request.nextUrl.searchParams.get('ymd')
  const bounds = dayBoundsFromParam(ymdParam)
  const supabase = await createClient()
  const { visits, error } = await fetchVisitsInRange(supabase, bounds)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  const csv = visitsMoneyCsv(visits, { includeVoided: true })
  const filename = `farwa-visits-${bounds.ymd}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  })
}
