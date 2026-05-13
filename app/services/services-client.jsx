'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { LazyVideo, CAT_SLUGS } from '../../src/shared.jsx'
import { SERVICES, CAT_META, track } from '../../src/data.js'

function getCatMeta(cat) {
  return CAT_META[cat] || { img: '/glow2.jpg', desc: 'Expert beauty services tailored just for you.' }
}

export default function ServicesClient() {
  const router = useRouter()
  const categories = Object.keys(SERVICES)

  return (
    <main id="main" className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen">
        <div className="mb-10 md:mb-14 border-b border-[#e4ddd7] pb-8">
          <div className="overflow-hidden">
            <motion.h1 initial={{ y: '60%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, ease: [0.16,1,0.3,1] }}
              className="display-section text-ink mb-4">
              OUR<span className="text-[#e4ddd7] mx-3 font-light italic text-[0.6em]">—</span>SERVICES
            </motion.h1>
          </div>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
            className="text-stone text-sm font-light max-w-lg">
            From threading to bridal packages — select a category to explore our full menu. Book anything directly on WhatsApp.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat, i) => {
            const meta = getCatMeta(cat)
            const count = SERVICES[cat].length
            return (
              <motion.button type="button" key={cat} onClick={() => { track('ServiceCategoryView', { category: cat }); router.push(`/services/${CAT_SLUGS[cat]}`) }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}
                className="relative overflow-hidden group text-left" style={{ aspectRatio: '3/4' }}>
                <Image src={meta.img} alt={cat} loading="lazy" width={900} height={1200}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105${meta.video ? ' group-hover:opacity-0' : ''}`} />
                {meta.video && (
                  <video src={meta.video} autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-ink/5" />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/20 transition-colors duration-300" />
                <div className="absolute top-3 right-3">
                  <span className="text-[9px] tracking-widest uppercase text-white/50 font-['Inter'] bg-ink/30 backdrop-blur-sm px-2 py-1">{count} services</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-['Syne'] font-bold text-xs sm:text-sm uppercase leading-tight mb-1 line-clamp-2">{cat}</p>
                  <p className="text-white/50 text-[10px] font-['Inter'] leading-snug hidden md:block line-clamp-2">{meta.desc}</p>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-[10px] tracking-widest uppercase font-['Inter']">View services</span>
                    <ChevronRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
