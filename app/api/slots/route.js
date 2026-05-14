import { NextResponse } from 'next/server'
import { getSheetRows, isConfigured } from '../../../lib/google-sheets.js'
import { ALL_SERVICES } from '../../../src/data.js'

const BASE_SLOTS = []
for (let h = 11; h <= 18; h++) {
  BASE_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  if (h < 18 || h === 18) BASE_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}
const FILTERED_SLOTS = BASE_SLOTS.filter(s => s <= '18:30')

const MAX_WORKERS = 2

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function slotIndex(time) {
  return FILTERED_SLOTS.indexOf(time)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceIdParam = searchParams.get('serviceId')

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const reqDate = new Date(date + 'T00:00:00')
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 14)

  if (reqDate < today || reqDate > maxDate) {
    return NextResponse.json({ error: 'Date must be today or within the next 14 days' }, { status: 400 })
  }

  if (!isConfigured()) {
    const slots = FILTERED_SLOTS.map(time => ({ time, available: true }))
    return NextResponse.json({ slots })
  }

  const bookings = await getSheetRows(date)

  const occupied = new Array(FILTERED_SLOTS.length).fill(0)

  for (const bk of bookings) {
    if (bk.status === 'Cancelled') continue
    const startIdx = slotIndex(bk.timeSlot)
    if (startIdx === -1) continue
    const dur = bk.duration || 30
    const slotsNeeded = Math.ceil(dur / 30)
    for (let i = 0; i < slotsNeeded && startIdx + i < FILTERED_SLOTS.length; i++) {
      occupied[startIdx + i]++
    }
  }

  let serviceDuration = 30
  if (serviceIdParam) {
    const svc = ALL_SERVICES.find(s => s.id === parseInt(serviceIdParam, 10))
    if (svc?.durationMinutes) serviceDuration = svc.durationMinutes
  }

  const slotsNeeded = Math.ceil(serviceDuration / 30)

  const slots = FILTERED_SLOTS.map((time, idx) => {
    let available = occupied[idx] < MAX_WORKERS
    if (available && slotsNeeded > 1) {
      for (let j = 1; j < slotsNeeded; j++) {
        if (idx + j >= FILTERED_SLOTS.length || occupied[idx + j] >= MAX_WORKERS) {
          available = false
          break
        }
      }
    }
    return { time, available }
  })

  return NextResponse.json({ slots })
}
