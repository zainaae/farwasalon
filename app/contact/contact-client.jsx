'use client'

import { useState } from 'react'
import { m } from 'framer-motion'
import Link from 'next/link'
import { Check, ArrowUpRight, MapPin, Phone, Clock, Sparkles, MessageCircle, ChevronDown, X } from 'lucide-react'
import { IgIcon } from '../../src/shared.jsx'
import { useNextSlot } from '../../src/use-next-slot.js'
import { WA_DEFAULT, MAPS_LINK, IG_LINK, SERVICES, waLinkBooking, track, PREFERRED_TIME_OPTIONS } from '../../src/data.js'

export default function ContactClient() {
  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [picked,  setPicked]  = useState([])
  const [addNonce, setAddNonce] = useState(0)
  const [date,    setDate]    = useState('')
  const [time,    setTime]    = useState('')
  const slot    = useNextSlot()

  const addService = (svcName) => {
    const n = String(svcName).trim()
    if (!n) return
    setPicked((prev) => (prev.includes(n) ? prev : [...prev, n]))
    setAddNonce((k) => k + 1)
  }

  const removeService = (svcName) => {
    setPicked((prev) => prev.filter((s) => s !== svcName))
  }

  const [submitted, setSubmitted] = useState(false)
  const [fallbackUrl, setFallbackUrl] = useState(null)

  const handleWhatsApp = e => {
    e.preventDefault()
    if (picked.length === 0) return
    track('WhatsAppIntent', { source: 'ContactPage', services: picked.join(', ') })
    const url = waLinkBooking(picked, { name, phone, date, time })
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    if (w) {
      setSubmitted(true)
    } else {
      setFallbackUrl(url)
    }
  }

  return (
    <main id="main" className="page-content pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">

      <section className="bg-white py-14 md:py-20 border-b border-border-soft">
        <div className="section-shell">
          <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow mb-3">— Contact</m.p>
          <div className="overflow-hidden">
            <m.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">FIND US</span> <span className="block">OR ASK US</span>
            </m.h1>
          </div>
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="inline-flex items-center gap-2 border border-border-soft px-3 py-2 text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone">
              <span className={`w-1.5 h-1.5 rounded-full ${slot.open ? 'bg-[#6b9b5f]' : 'bg-[#c9a98a]'} animate-pulse`} aria-hidden="true" />
              Next slot <span className="text-ink font-medium ml-1">{slot.label}</span>
            </span>
            <Link href="/book" className="tap-safe btn-primary text-[10px] sm:text-[11px] !py-2.5 !px-5">
              <Sparkles className="w-3 h-3" /> Book online
            </Link>
          </m.div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="section-shell grid md:grid-cols-[1.2fr_1fr] gap-14 md:gap-20">

          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
            <p className="eyebrow mb-6">— Find us</p>

            <div className="flex flex-col gap-5 mb-10">
              <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                className="flex items-start gap-4 group">
                <div className="w-9 h-9 border border-border-soft flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                  <MapPin className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                </div>
                <div>
                  <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">Location</p>
                  <p className="text-stone text-sm font-light font-['Inter']">
                    Plot 165/G-1, Saima Terrace, Block 3, PECHS, Karachi 75400
                  </p>
                  <p className="text-stone text-[11px] font-['Inter'] mt-0.5">
                    Women-only PECHS studio · one branch · not an at-home parlour
                  </p>
                  <p className="text-stone text-[11px] font-['Inter'] mt-0.5 hover:text-ink transition-colors">Get directions →</p>
                </div>
              </a>
              <a href="tel:+923222782254"
                className="flex items-start gap-4 group">
                <div className="w-9 h-9 border border-border-soft flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                  <Phone className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                </div>
                <div>
                  <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">Phone</p>
                  <p className="text-stone text-sm font-light font-['Inter']">+92 322 278 2254</p>
                  <p className="text-stone text-[11px] font-['Inter'] mt-0.5 group-hover:text-ink transition-colors">Tap to call →</p>
                </div>
              </a>
              <a href={WA_DEFAULT} target="_blank" rel="noreferrer"
                className="flex items-start gap-4 group">
                <div className="w-9 h-9 border border-border-soft flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                </div>
                <div>
                  <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">WhatsApp</p>
                  <p className="text-stone text-sm font-light font-['Inter']">+92 322 278 2254</p>
                  <p className="text-stone text-[11px] font-['Inter'] mt-0.5 group-hover:text-ink transition-colors">Message us →</p>
                </div>
              </a>
              <a href={IG_LINK} target="_blank" rel="noreferrer"
                className="flex items-start gap-4 group">
                <div className="w-9 h-9 border border-border-soft flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                  <IgIcon className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                </div>
                <div>
                  <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">Instagram</p>
                  <p className="text-stone text-sm font-light font-['Inter']">@farwasalon</p>
                </div>
              </a>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 border border-border-soft flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 text-stone" />
                </div>
                <div>
                  <p className="font-['Syne'] font-bold text-sm text-ink mb-1">Opening Hours</p>
                  <p className="text-stone text-sm font-light font-['Inter']">Monday – Saturday</p>
                  <p className="text-stone text-sm font-['Inter']">11–7</p>
                  <p className="text-stone text-sm font-light font-['Inter'] mt-1">Closed Sunday</p>
                  <p className="text-stone text-[11px] font-['Inter'] mt-2">
                    Book online · WhatsApp · walk-ins when free. Minutes from Tariq Road.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden panel-soft" style={{ aspectRatio: '4/3' }}>
              <iframe
                title="Farwa Beauty Salon location — PECHS, Karachi"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.5!2d67.0584185!3d24.8797532!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f2832975c79%3A0xe55ba4a44d34a210!2sFarwa%20beauty%20salon!5e0!3m2!1sen!2spk!4v1"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full grayscale-[0.15]"
                style={{ border: 0 }}
              />
              <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                className="tap-safe absolute bottom-3 right-3 inline-flex min-h-[44px] items-center gap-1.5 bg-white text-ink text-[10px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-3.5 py-2.5 shadow-md hover:bg-nude transition-colors">
                Open in Maps <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
              </a>
            </div>
          </m.div>

          <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="mb-8 p-6 md:p-8 bg-mist border border-border-soft">
              <p className="eyebrow mb-3">— Instant confirmation</p>
              <p className="text-body text-sm mb-5">
                Pick your service, date, and time online — you&apos;ll get a confirmation page right away.
              </p>
              <Link href="/book" className="tap-safe btn-primary w-full sm:w-auto justify-center">
                Book online <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="eyebrow mb-4">— Or message us on WhatsApp</p>
            <p className="text-body mb-8">
              Prefer WhatsApp? Fill in the details below and we&apos;ll open a pre-filled message. We confirm within a few hours.
            </p>

            <form onSubmit={handleWhatsApp} className="flex flex-col gap-4" aria-label="Booking request form">
              <div>
                <label htmlFor="booking-name" className="block text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone mb-1.5">
                  Your name
                </label>
                <input id="booking-name" name="name" type="text" placeholder="Your name" autoComplete="name"
                  value={name} onChange={e => setName(e.target.value)} required
                  className="input-field" />
              </div>

              <div>
                <label htmlFor="booking-phone" className="block text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone mb-1.5">
                  Phone number
                </label>
                <input id="booking-phone" name="phone" type="tel" placeholder="03xx-xxxxxxx" autoComplete="tel"
                  value={phone} onChange={e => setPhone(e.target.value)} required
                  className="input-field" />
              </div>

              <fieldset className="panel-soft px-5 py-4">
                <legend className="text-[11px] font-['Inter'] text-stone px-1">Services (add one or more)</legend>
                {picked.length === 0 ? (
                  <p id="booking-services-hint" className="text-stone text-xs font-light mb-3">Pick from the menu below — you can add multiple.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2 mb-3" aria-label="Services to book">
                    {picked.map((s) => (
                      <li key={s}>
                        <span className="inline-flex items-center gap-1 pl-3 pr-1 py-1 bg-mist border border-border-soft text-xs font-['Syne'] font-semibold uppercase text-ink">
                          <span className="max-w-[14rem] truncate">{s}</span>
                          <button type="button" className="tap-safe p-1.5 text-stone hover:text-ink" onClick={() => removeService(s)} aria-label={`Remove ${s}`}>
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <label htmlFor="booking-add-service" className="sr-only">Add a service</label>
                <div className="relative">
                  <select
                    key={addNonce}
                    id="booking-add-service"
                    name="service"
                    defaultValue=""
                    aria-describedby={picked.length === 0 ? 'booking-services-hint' : undefined}
                    onChange={(e) => { const v = e.target.value; if (v) addService(v) }}
                    className="input-field appearance-none pr-10">
                    <option value="">Add a service…</option>
                    {Object.entries(SERVICES).map(([cat, svcs]) => (
                      <optgroup key={cat} label={cat}>
                        {svcs.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone pointer-events-none" aria-hidden="true" />
                </div>
              </fieldset>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-date" className="block text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone mb-1.5">
                    Preferred date
                  </label>
                  <input id="booking-date" name="date" type="date" value={date} onChange={e => setDate(e.target.value)}
                    className="input-field" />
                </div>
                <div>
                  <label htmlFor="booking-time" className="block text-[11px] tracking-[0.14em] uppercase font-['Inter'] text-stone mb-1.5">
                    Preferred time
                  </label>
                  <div className="relative">
                    <select id="booking-time" name="time" value={time} onChange={e => setTime(e.target.value)}
                      className="input-field appearance-none pr-10">
                      <option value="">Select a time</option>
                      {PREFERRED_TIME_OPTIONS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone pointer-events-none" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={picked.length === 0} aria-label="Send booking request on WhatsApp"
                className="tap-safe mt-2 btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink">
                Send on WhatsApp <ArrowUpRight className="w-4 h-4" />
              </button>
              {picked.length === 0 && (
                <p className="text-stone text-xs font-['Inter'] font-light -mt-1">
                  Add at least one service above to send your WhatsApp request.
                </p>
              )}
            </form>

            {submitted && (
              <div className="mt-4 p-4 border border-[#9cd48c]/40 bg-[#f4faf2]">
                <p className="text-ink text-sm font-['Inter'] font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#6b9b5f] shrink-0" /> Message opened in WhatsApp
                </p>
                <p className="text-stone text-xs font-['Inter'] mt-1">We&apos;ll confirm your appointment within a few hours.</p>
              </div>
            )}

            {fallbackUrl && (
              <div className="mt-4 p-4 border border-[#c9a98a]/40 bg-[#faf7f5]">
                <p className="text-ink text-sm font-['Inter'] font-medium mb-1">Popup blocked by your browser</p>
                <a href={fallbackUrl} target="_blank" rel="noreferrer"
                  className="text-[#8b6d59] text-sm font-['Inter'] underline hover:text-ink">
                  Click here to open WhatsApp manually →
                </a>
              </div>
            )}

            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
              {['No card required','Quick confirmation'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-[10px] text-stone font-['Inter']">
                  <Check className="w-3 h-3 text-ink/40 shrink-0" /> {t}
                </span>
              ))}
            </div>
          </m.div>

        </div>
      </section>
    </main>
  )
}
