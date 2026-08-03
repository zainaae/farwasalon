'use client'

import { m } from 'framer-motion'

export default function PrivacyClient() {
  return (
    <main id="main" className="page-content">

      <section className="bg-white py-16 md:py-20 border-b border-border-soft">
        <div className="section-shell">
          <m.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow mb-3">— Legal</m.p>
          <div className="overflow-hidden">
            <m.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">PRIVACY</span> <span className="block">POLICY</span>
            </m.h1>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-screen-md mx-auto prose-sm">
          <p className="text-stone text-xs font-['Inter'] mb-8">Last updated: August 2026</p>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Who we are</h2>
              <p className="text-body text-sm">
                Farwa Beauty Salon is a beauty studio in PECHS, Karachi, Pakistan. This page explains what happens when you use farwasalon.com — online booking, the newsletter, and a few third-party tools.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Data we collect</h2>
              <ul className="text-body text-sm list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="font-medium text-ink">Online booking:</strong> When you book at /book, we store your name, phone number, chosen service(s), date, and time in our Google Sheet so we can run the appointment diary. A cancel code for that booking is also saved on this device (see below).
                </li>
                <li>
                  <strong className="font-medium text-ink">Newsletter:</strong> If you subscribe, your email (and first name if you give one) is stored in our Google Sheet&apos;s Subscribers tab so we can send updates and welcome offers.
                </li>
                <li>
                  <strong className="font-medium text-ink">On this device:</strong> Confirmation and cancellation details for a booking you made here are kept in this browser&apos;s local storage (and sometimes session storage) so you can reopen the confirmation or cancel link on the same phone without putting your name or phone in the URL.
                </li>
                <li>
                  <strong className="font-medium text-ink">Salon email notify:</strong> After a new online booking, our Google Apps Script may email the salon so the desk sees the appointment. That email uses the booking details already in the sheet.
                </li>
                <li>
                  <strong className="font-medium text-ink">Plausible Analytics:</strong> We use Plausible for anonymous page views and referrers. It does not use cookies for tracking and does not build individual marketing profiles.
                </li>
                <li>
                  <strong className="font-medium text-ink">Google Maps:</strong> Our contact page can load a Google Maps embed. Google may collect data under their own privacy policy when that embed loads.
                </li>
                <li>
                  <strong className="font-medium text-ink">WhatsApp:</strong> Links that open WhatsApp take you off this site. Messages and any data you send there are handled by WhatsApp / Meta under their policies — we do not host that chat on our servers.
                </li>
                <li>
                  <strong className="font-medium text-ink">Instagram:</strong> Links to our Instagram profile are off-site; Meta collects data when you visit their platform.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Cookies</h2>
              <p className="text-body text-sm">
                This website does not set first-party tracking cookies. Booking drafts and confirmation details use browser storage on your device, not cookies. Third-party embeds (such as Google Maps) may set their own cookies under their policies.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">How long we keep it</h2>
              <p className="text-body text-sm">
                Booking rows stay in our Google Sheet while we need them for the diary and follow-up. Newsletter emails stay until you ask to be removed. Data on your device stays until you clear site data or cancel/remove that booking record. WhatsApp and Google retain their own copies under their policies.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Your rights</h2>
              <p className="text-body text-sm">
                You can ask us to correct or delete booking or newsletter details we hold. Message the salon on WhatsApp at +92 322 2782254 with your name, phone or email, and (if relevant) Booking ID — we will handle the request from the sheet. Clearing this site&apos;s data in your browser removes the local confirmation/cancel copy on that device only.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Contact</h2>
              <p className="text-body text-sm">
                For privacy questions, WhatsApp +92 322 2782254 or visit us in PECHS, Karachi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
