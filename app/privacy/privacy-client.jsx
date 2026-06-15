'use client'

import { motion } from 'framer-motion'

export default function PrivacyClient() {
  return (
    <main id="main" className="page-content">

      <section className="bg-white py-16 md:py-20 border-b border-border-soft">
        <div className="section-shell">
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="eyebrow mb-3">— Legal</motion.p>
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink">
              <span className="block">PRIVACY</span> <span className="block">POLICY</span>
            </motion.h1>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-screen-md mx-auto prose-sm">
          <p className="text-stone text-xs font-['Inter'] mb-8">Last updated: May 2026</p>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Who we are</h2>
              <p className="text-body text-sm">
                Farwa Beauty Salon is a beauty studio located in PECHS, Karachi, Pakistan. This policy explains how we handle data collected through this website.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Data we collect</h2>
              <ul className="text-body text-sm list-disc pl-5 space-y-1.5">
                <li><strong className="font-medium text-ink">WhatsApp booking forms:</strong> Your name, preferred services, date, and time are assembled into a pre-filled WhatsApp message. We do not store this data on our servers — it is sent directly to WhatsApp.</li>
                <li><strong className="font-medium text-ink">Plausible Analytics:</strong> We use Plausible, a privacy-friendly analytics tool that does not use cookies, does not collect personal data, and is fully compliant with GDPR, CCPA, and PECR. Plausible collects anonymous page views and referrer information only.</li>
                <li><strong className="font-medium text-ink">Google Maps embed:</strong> Our contact page embeds a Google Maps iframe. Google may collect data as described in their privacy policy when this embed loads.</li>
                <li><strong className="font-medium text-ink">Instagram links:</strong> We link to our Instagram profile. Instagram/Meta collects data when you visit their platform.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Cookies</h2>
              <p className="text-body text-sm">
                This website does not set any first-party cookies. Third-party embeds (Google Maps) may set their own cookies as governed by their respective privacy policies.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Data retention</h2>
              <p className="text-body text-sm">
                We do not store any personal data on this website. WhatsApp conversations are retained per WhatsApp&apos;s own policies. Plausible analytics data is aggregated and anonymised — no individual user data is stored.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Your rights</h2>
              <p className="text-body text-sm">
                Since we do not collect or store personal data, there is no personal data to access, correct, or delete. If you have questions about your data in WhatsApp conversations, please contact us directly.
              </p>
            </div>

            <div>
              <h2 className="font-['Syne'] font-bold text-base text-ink mb-2">Contact</h2>
              <p className="text-body text-sm">
                For any privacy-related questions, reach us on WhatsApp at +92 322 2782254 or visit us in PECHS, Karachi.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
