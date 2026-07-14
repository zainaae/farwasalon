function pad(n) {
  return String(n).padStart(2, '0')
}

/** Floating local time (no TZ) — matches salon wall-clock in Karachi for clients in PK. */
function toIcsLocal(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join('')
}

function escapeIcs(text) {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/** Build a minimal VEVENT .ics string for a salon appointment. */
export function buildBookingIcs({ id, service, date, time, name, durationMinutes = 60 }) {
  const start = new Date(`${date}T${time}:00`)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)
  const now = new Date()
  const uid = `${id || 'booking'}@farwasalon.com`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Farwa Beauty Salon//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toIcsLocal(now)}`,
    `DTSTART:${toIcsLocal(start)}`,
    `DTEND:${toIcsLocal(end)}`,
    `SUMMARY:${escapeIcs(service)} — Farwa Beauty Salon`,
    `DESCRIPTION:${escapeIcs(`Booking ID: ${id}\nGuest: ${name}`)}`,
    'LOCATION:Farwa Beauty Salon\\, Plot 165/G-1\\, Saima Terrace\\, PECHS\\, Karachi',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
