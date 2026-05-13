import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, ArrowUpRight, MapPin, Phone, Clock, Sparkles, ChevronDown, X } from 'lucide-react'
import { Navbar, Footer, IgIcon, StickyWA, usePageMeta, useBooking, useNextSlot, SkipLink } from '../shared.jsx'
import { WA_DEFAULT, MAPS_LINK, IG_LINK, SERVICES, waLinkBooking, track } from '../data.js'

export default function Contact() {
  const [name,    setName]    = useState('')
  const [picked,  setPicked]  = useState([])
  const [addNonce, setAddNonce] = useState(0)
  const [date,    setDate]    = useState('')
  const [time,    setTime]    = useState('')
  const booking = useBooking()
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

  usePageMeta({
    title: 'Book an Appointment — Farwa Beauty Salon, Karachi',
    description: 'Book your salon visit in PECHS Block 2, Karachi. WhatsApp +92 322 2782254 · Mon–Sat 11am–7pm.',
    canonical: 'https://farwasalon.com/contact',
    ogImage: 'https://farwasalon.com/logo.jpg',
  })

  const [submitted, setSubmitted] = useState(false)
  const [fallbackUrl, setFallbackUrl] = useState(null)

  const handleWhatsApp = e => {
    e.preventDefault()
    if (picked.length === 0) return
    track('WhatsAppIntent', { source: 'ContactPage', services: picked.join(', ') })
    const url = waLinkBooking(picked, { name, date, time })
    const w = window.open(url, '_blank', 'noopener,noreferrer')
    if (w) {
      setSubmitted(true)
    } else {
      setFallbackUrl(url)
    }
  }

  return (
    <div className="bg-white overflow-x-hidden">
      <SkipLink />
      <Navbar />
      <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">

        {/* Header */}
        <section className="bg-white py-14 md:py-20 px-4 sm:px-5 md:px-10 border-b border-[#e4ddd7]">
          <div className="max-w-screen-xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-3">— Ready?</motion.p>
            <div className="overflow-hidden">
              <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
                className="display-section text-ink">
                BOOK YOUR<br />APPOINTMENT
              </motion.h1>
            </div>
            {/* Live slot pill + 3-tap sheet shortcut */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
              <span className="inline-flex items-center gap-2 border border-[#e4ddd7] px-3 py-2 text-[10px] tracking-[0.2em] uppercase font-['Inter'] text-stone">
                <span className={`w-1.5 h-1.5 rounded-full ${slot.open ? 'bg-[#6b9b5f]' : 'bg-[#c9a98a]'} animate-pulse`} aria-hidden="true" />
                Next slot <span className="text-ink font-medium ml-1">{slot.label}</span>
              </span>
              <button onClick={() => booking.open()}
                className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[10px] sm:text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-5 py-2.5 hover:bg-stone transition-colors">
                <Sparkles className="w-3 h-3" /> Quick 3-tap booking
              </button>
            </motion.div>
          </div>
        </section>

        {/* Main grid */}
        <section className="py-14 md:py-20 px-4 sm:px-5 md:px-10">
          <div className="max-w-screen-xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-14 md:gap-20">

            {/* Contact info */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-6">— Find us</p>

              <div className="flex flex-col gap-5 mb-10">
                <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                  className="flex items-start gap-4 group">
                  <div className="w-9 h-9 border border-[#e4ddd7] flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">Location</p>
                    <p className="text-stone text-sm font-light font-['Inter']">PECHS Block 2, Karachi</p>
                    <p className="text-stone text-[11px] font-['Inter'] mt-0.5 hover:text-ink transition-colors">Get directions →</p>
                  </div>
                </a>
                <a href={WA_DEFAULT} target="_blank" rel="noreferrer"
                  className="flex items-start gap-4 group">
                  <div className="w-9 h-9 border border-[#e4ddd7] flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                    <Phone className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">WhatsApp</p>
                    <p className="text-stone text-sm font-light font-['Inter']">+92 322 2782254</p>
                  </div>
                </a>
                <a href={IG_LINK} target="_blank" rel="noreferrer"
                  className="flex items-start gap-4 group">
                  <div className="w-9 h-9 border border-[#e4ddd7] flex items-center justify-center shrink-0 group-hover:border-ink transition-colors">
                    <IgIcon className="w-3.5 h-3.5 text-stone group-hover:text-ink transition-colors" />
                  </div>
                  <div>
                    <p className="font-['Syne'] font-bold text-sm text-ink mb-0.5">Instagram</p>
                    <p className="text-stone text-sm font-light font-['Inter']">@farwasalon</p>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 border border-[#e4ddd7] flex items-center justify-center shrink-0">
                    <Clock className="w-3.5 h-3.5 text-stone" />
                  </div>
                  <div>
                    <p className="font-['Syne'] font-bold text-sm text-ink mb-1">Opening Hours</p>
                    <p className="text-stone text-sm font-light font-['Inter']">Monday – Saturday</p>
                    <p className="text-stone text-sm font-['Inter']">11:00 am – 7:00 pm</p>
                    <p className="text-stone text-sm font-light font-['Inter'] mt-1">Closed Sunday</p>
                  </div>
                </div>
              </div>

              {/* Embedded Google Map */}
              <div className="relative overflow-hidden bg-mist border border-[#e4ddd7]" style={{ aspectRatio: '4/3' }}>
                <iframe
                  title="Farwa Beauty Salon location — PECHS Block 2, Karachi"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.5!2d67.0513!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sFarwa+Beauty+Salon+PECHS+Block+2+Karachi!5e0!3m2!1sen!2spk!4v1"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full grayscale-[0.15]"
                  style={{ border: 0 }}
                />
                <a href={MAPS_LINK} target="_blank" rel="noreferrer"
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 bg-white text-ink text-[10px] tracking-[0.14em] uppercase font-medium font-['Inter'] px-3 py-2 shadow-md hover:bg-nude transition-colors">
                  Open in Maps <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>

            {/* Booking form */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
              <p className="text-stone text-[10px] tracking-[0.28em] uppercase font-['Inter'] mb-6">— Book via WhatsApp</p>
              <p className="text-stone font-light text-sm leading-relaxed mb-8">
                Fill in the details below and we'll open a pre-filled WhatsApp message. We confirm within a few hours.
              </p>

              <form onSubmit={handleWhatsApp} className="flex flex-col gap-3" aria-label="Booking request form">
                <label htmlFor="booking-name" className="sr-only">Your name</label>
                <input id="booking-name" name="name" type="text" placeholder="Your name" autoComplete="name"
                  value={name} onChange={e => setName(e.target.value)} required
                  className="border border-[#e4ddd7] text-ink placeholder-stone text-sm font-['Inter'] px-5 py-3.5 focus:outline-none focus:border-ink transition-colors w-full bg-white" />

                <fieldset className="border border-[#e4ddd7] bg-white px-5 py-4">
                  <legend className="text-[11px] font-['Inter'] text-stone px-1">Services (add one or more)</legend>
                  {picked.length === 0 ? (
                    <p id="booking-services-hint" className="text-stone text-xs font-light mb-3">Pick from the menu below — you can add multiple.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2 mb-3" aria-label="Services to book">
                      {picked.map((s) => (
                        <li key={s}>
                          <span className="inline-flex items-center gap-1 pl-3 pr-1 py-1 bg-mist border border-[#e4ddd7] text-xs font-['Syne'] font-semibold uppercase text-ink">
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
                      className="border border-[#e4ddd7] text-stone text-sm font-['Inter'] px-5 py-3.5 pr-10 focus:outline-none focus:border-ink transition-colors appearance-none w-full bg-white">
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

                <label htmlFor="booking-date" className="sr-only">Preferred date</label>
                <input id="booking-date" name="date" type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="border border-[#e4ddd7] text-stone text-sm font-['Inter'] px-5 py-3.5 focus:outline-none focus:border-ink transition-colors w-full bg-white" />

                <label htmlFor="booking-time" className="sr-only">Preferred time</label>
                <div className="relative">
                  <select id="booking-time" name="time" value={time} onChange={e => setTime(e.target.value)}
                    className="border border-[#e4ddd7] text-stone text-sm font-['Inter'] px-5 py-3.5 pr-10 focus:outline-none focus:border-ink transition-colors appearance-none w-full bg-white">
                    <option value="">Preferred time</option>
                    {['11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone pointer-events-none" aria-hidden="true" />
                </div>

                <button type="submit" disabled={picked.length === 0}
                  className="mt-2 bg-ink text-white text-[11px] tracking-[0.16em] uppercase font-semibold font-['Inter'] px-6 py-4 hover:bg-stone disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-300 w-full flex items-center justify-center gap-2">
                  Send on WhatsApp <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>

              {submitted && (
                <div className="mt-4 p-4 border border-[#9cd48c]/40 bg-[#f4faf2]">
                  <p className="text-ink text-sm font-['Inter'] font-medium flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#6b9b5f] shrink-0" /> Message opened in WhatsApp
                  </p>
                  <p className="text-stone text-xs font-['Inter'] mt-1">We'll confirm your appointment within a few hours.</p>
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
            </motion.div>

          </div>
        </section>

      </main>
      <Footer />
      <StickyWA />
    </div>
  )
}
