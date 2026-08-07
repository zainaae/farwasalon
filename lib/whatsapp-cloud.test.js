import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('whatsapp-cloud', () => {
  const prev = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.WHATSAPP_TOKEN
    delete process.env.WHATSAPP_PHONE_NUMBER_ID
    delete process.env.WHATSAPP_SEND_BOOKING_CONFIRM
    delete process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMED
    delete process.env.WHATSAPP_TEMPLATE_LANG
  })

  afterEach(() => {
    process.env = { ...prev }
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('toWhatsAppE164 normalizes PK mobiles', async () => {
    const { toWhatsAppE164 } = await import('./whatsapp-cloud.js')
    expect(toWhatsAppE164('0322 2782254')).toBe('923222782254')
    expect(toWhatsAppE164('+92 322-2782254')).toBe('923222782254')
    expect(toWhatsAppE164('923222782254')).toBe('923222782254')
    expect(toWhatsAppE164('not-a-phone')).toBe(null)
  })

  it('isWhatsAppCloudConfigured is false without env', async () => {
    const { isWhatsAppCloudConfigured } = await import('./whatsapp-cloud.js')
    expect(isWhatsAppCloudConfigured()).toBe(false)
  })

  it('sendWhatsAppTemplate no-ops when unconfigured', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { sendWhatsAppTemplate } = await import('./whatsapp-cloud.js')
    const result = await sendWhatsAppTemplate({
      toPhone: '03222782254',
      templateName: 'booking_confirmed',
    })
    expect(result).toEqual({ ok: false, skipped: true })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maybeSendBookingConfirmed skips when flag off even if token set', async () => {
    process.env.WHATSAPP_TOKEN = 'token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123'
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { maybeSendBookingConfirmed } = await import('./whatsapp-cloud.js')
    const result = await maybeSendBookingConfirmed({
      clientName: 'Ayesha',
      clientPhone: '03222782254',
      service: 'Threading',
      date: '2026-08-10',
      time: '12:00',
    })
    expect(result.skipped).toBe(true)
    expect(result.reason).toBe('flag_off')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('maybeSendBookingConfirmed posts template when flag + creds set', async () => {
    process.env.WHATSAPP_TOKEN = 'token'
    process.env.WHATSAPP_PHONE_NUMBER_ID = '999'
    process.env.WHATSAPP_SEND_BOOKING_CONFIRM = 'true'
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ messages: [{ id: 'wamid.TEST' }] }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const { maybeSendBookingConfirmed } = await import('./whatsapp-cloud.js')
    const result = await maybeSendBookingConfirmed({
      clientName: 'Ayesha',
      clientPhone: '03222782254',
      service: 'Eyebrow Threading',
      date: '2026-08-10',
      time: '12:00',
    })
    expect(result.ok).toBe(true)
    expect(result.messageId).toBe('wamid.TEST')
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/999/messages')
    expect(init.headers.Authorization).toBe('Bearer token')
    const payload = JSON.parse(init.body)
    expect(payload.to).toBe('923222782254')
    expect(payload.template.name).toBe('booking_confirmed')
    expect(payload.template.components[0].parameters).toHaveLength(4)
  })
})
