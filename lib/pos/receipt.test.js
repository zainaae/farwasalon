import { describe, it, expect } from 'vitest'
import { buildReceiptText } from './receipt.js'
import { buildQuoteWaText } from '../quote-request.js'

describe('pos receipt', () => {
  it('renders finals, discount, net, paid, due — not marketing quote format', () => {
    const text = buildReceiptText({
      clientName: 'Ayesha Khan',
      clientPhone: '923001234567',
      txn_ref: 'FBS-POS-1',
      visit_at: '2026-08-10 15:00',
      payment_mode: 'Cash',
      lines: [
        {
          name: 'Threading',
          qty: 1,
          final_price_pkr: 300,
          line_total: 300,
        },
        {
          name: 'Hair Colour',
          qty: 1,
          final_price_pkr: 5500,
          line_total: 5500,
        },
      ],
      subtotal_pkr: 5800,
      discount_pkr: 812,
      discount_note: 'Freedom Deal',
      net_pkr: 4988,
      amount_paid_pkr: 4988,
      due_pkr: 0,
    })

    expect(text).toContain('Farwa Beauty Salon — Receipt')
    expect(text).toContain('Txn: FBS-POS-1')
    expect(text).toContain('Client: Ayesha Khan')
    expect(text).toContain('Phone: 03001234567')
    expect(text).toContain('Hair Colour')
    expect(text).toContain('Rs 5,500')
    expect(text).toContain('Discount: Rs 812 (Freedom Deal)')
    expect(text).toContain('Net: Rs 4,988')
    expect(text).toContain('Paid (Cash): Rs 4,988')
    expect(text).toContain('Due: Rs 0')
    expect(text).not.toMatch(/Quote please/i)
    expect(text).not.toMatch(/\bfrom Rs\b/i)

    const quote = buildQuoteWaText({
      label: 'Hair Colour',
      floorLabel: 'from Rs 4,000',
      length: 'Long',
    })
    expect(quote).toMatch(/Quote please/)
    expect(text).not.toContain(quote)
  })
})
