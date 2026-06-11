import { NextResponse } from 'next/server'
import { appendSubscriber, isConfigured, sheetsErrorDetail } from '../../../lib/google-sheets.js'
import { checkRateLimit } from '../../../lib/rate-limit.js'
import { isAllowedOrigin } from '../../../lib/origin-check.js'
import { requireStringField } from '../../../lib/sanitize.js'
import { isValidEmail, normalizeEmail } from '../../../lib/email-validate.js'
import { logger, hashIp, errCtx } from '../../../lib/logger.js'

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rl = checkRateLimit(ip, { window: 300, max: 5 })
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Honeypot — silent reject on filled fields
  if (body?.website?.trim?.() || body?._hp?.trim?.()) {
    return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
  }

  const emailField = requireStringField(body, 'email', { maxLen: 254 })
  if (emailField.error) {
    return NextResponse.json({ error: emailField.error }, { status: 400 })
  }
  const firstNameField = requireStringField(body, 'firstName', { required: false, maxLen: 60 })
  if (firstNameField.error) {
    return NextResponse.json({ error: firstNameField.error }, { status: 400 })
  }
  const sourceField = requireStringField(body, 'source', { required: false, maxLen: 200 })

  const email = normalizeEmail(emailField.value)
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 })
  }

  if (!isConfigured()) {
    logger.error('/api/subscribe', 'sheets-not-configured', { ip: hashIp(ip) })
    return NextResponse.json(
      { error: 'Subscription temporarily unavailable. Please WhatsApp the salon.' },
      { status: 503 },
    )
  }

  try {
    await appendSubscriber({
      email,
      firstName: firstNameField.value,
      source: sourceField.value || '',
    })
  } catch (err) {
    logger.error('/api/subscribe', 'sheets-append-failed', {
      ip: hashIp(ip),
      ...errCtx(err),
      sheets: sheetsErrorDetail(err),
    })
    return NextResponse.json(
      { error: 'Could not save your subscription. Please try again later.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ success: true })
}
