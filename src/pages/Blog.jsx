import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Navbar, Footer, StickyWA, usePageMeta, SkipLink, useBooking } from '../shared.jsx'
import { WA_DEFAULT } from '../data.js'

const BLOG_POSTS = [
  {
    slug: 'bridal-beauty-timeline',
    title: 'Complete Bridal Beauty Timeline — When to Start Prep Before Your Wedding',
    description: 'A month-by-month beauty preparation guide for Karachi brides, from skincare routines to the final bridal trial.',
    date: '2026-05-10',
    readTime: '8 min read',
    category: 'Bridal',
    content: [
      { type: 'p', text: 'Your wedding day is one of the most photographed days of your life. Every bride deserves to look and feel her absolute best — but that kind of radiance doesn\'t happen overnight. At Farwa Beauty Salon in PECHS Block 2, Karachi, we\'ve helped hundreds of brides prepare for their big day since 2008. Here\'s the timeline we recommend.' },
      { type: 'h2', text: '6 Months Before: Start Your Skincare Routine' },
      { type: 'p', text: 'Begin with a professional facial consultation. Our aestheticians will assess your skin type and create a customised plan. For Karachi\'s humid climate, we typically recommend monthly HD Whitening Facials (Rs 3,000) or Janssen Whitening Facials (Rs 5,500) to build a luminous base. Consistency is key — your skin needs time to respond to treatments.' },
      { type: 'h2', text: '3 Months Before: Hair Treatments & Colour Planning' },
      { type: 'p', text: 'If you\'re planning a colour change, now is the time. This gives you enough room for adjustments. Book a Wellaplex treatment (Rs 3,000) to strengthen your hair before any chemical processes. If hair fall is a concern, start a monthly Hair Fall Treatment with Ampule (Rs 3,000) — three sessions can make a visible difference.' },
      { type: 'h2', text: '1 Month Before: Bridal Trial' },
      { type: 'p', text: 'This is non-negotiable. A bridal trial lets you see the complete look — makeup, hair, dupatta draping — in real lighting. You\'ll get reference photos so both you and your artist are aligned. At Farwa, trials include a full consultation to fine-tune every detail. Many brides discover they want a slightly different lip shade or brow shape than they initially imagined.' },
      { type: 'h2', text: '1 Week Before: Final Prep Services' },
      { type: 'p', text: 'Schedule your full-body wax (Rica or honey), bleach, and a relaxing full-body massage. Don\'t try any new products or treatments this close to the date. Stick with what\'s worked during your preparation months. A Loreal Face Polish (Rs 900) gives a beautiful natural glow without any risk of reaction.' },
      { type: 'h2', text: 'The Day Before: Rest' },
      { type: 'p', text: 'Hydrate, sleep early, and trust the preparation you\'ve done. Your skin is ready, your trial was perfect, and tomorrow you\'ll be the most beautiful bride in Karachi.' },
      { type: 'h2', text: 'Book Your Bridal Consultation' },
      { type: 'p', text: 'Every bride\'s journey is different. WhatsApp us at +92 322 2782254 to start planning your personalised bridal beauty timeline. We\'ll guide you every step of the way.' },
    ],
  },
  {
    slug: 'skincare-mistakes-karachi-summer',
    title: '5 Skincare Mistakes Karachi Women Make in Summer',
    description: 'Avoid these common skincare errors that Karachi\'s heat and humidity make worse. Expert tips from our aestheticians.',
    date: '2026-05-05',
    readTime: '6 min read',
    category: 'Skincare',
    content: [
      { type: 'p', text: 'Karachi\'s summer is relentless — the humidity, the heat, the dust. Your skincare routine needs to adapt, but many women make the same mistakes year after year. After 17+ years of treating Karachi skin, here\'s what we see most often at Farwa Beauty Salon.' },
      { type: 'h2', text: '1. Skipping Moisturiser Because "It\'s Too Hot"' },
      { type: 'p', text: 'This is the biggest myth. Humidity doesn\'t mean your skin is hydrated. Skipping moisturiser triggers your sebaceous glands to overcompensate — producing more oil, more breakouts, more texture. Switch to a lightweight, water-based moisturiser instead of going without.' },
      { type: 'h2', text: '2. Over-Washing Your Face' },
      { type: 'p', text: 'Washing more than twice a day strips your skin barrier. When you feel oily at 3pm, blot with a tissue or use micellar water instead. Your cleanser should be gentle and pH-balanced — harsh soaps worsen the very oiliness you\'re trying to control.' },
      { type: 'h2', text: '3. Ignoring Sunscreen Under Dupatta' },
      { type: 'p', text: 'Fabric doesn\'t block UV. You need SPF 30+ every single day, even if you\'re covered. Karachi\'s UV index regularly hits 10+ in summer. Choose a matte-finish sunscreen that won\'t feel heavy — reapply every 3 hours if you\'re outdoors.' },
      { type: 'h2', text: '4. DIY Bleaching Without Patch Testing' },
      { type: 'p', text: 'Home bleach kits are tempting in summer when you want that quick brightening effect. But without a patch test, you\'re risking burns and pigmentation — especially on heat-sensitised skin. Professional bleach treatments like our Loreal Whitening Face Bleach (Rs 650) are formulated and timed correctly for your skin type.' },
      { type: 'h2', text: '5. Waiting Too Long Between Facials' },
      { type: 'p', text: 'In summer, your pores accumulate more debris faster. A monthly facial isn\'t a luxury — it\'s maintenance. Our Acne Facial (Rs 1,800) and HD Cleansing (Rs 1,700) are specifically designed for congested summer skin. They clear what your daily cleanser can\'t reach.' },
      { type: 'h2', text: 'Get a Summer Skin Assessment' },
      { type: 'p', text: 'Not sure what your skin needs? Book a consultation at our PECHS Block 2 studio. We\'ll build a summer routine that actually works for Karachi weather. WhatsApp us at +92 322 2782254.' },
    ],
  },
  {
    slug: 'threading-vs-waxing',
    title: 'Threading vs Waxing: Which Is Better for Your Skin Type?',
    description: 'A detailed comparison of threading and waxing for facial and body hair removal — pros, cons, and expert recommendations.',
    date: '2026-04-28',
    readTime: '5 min read',
    category: 'Guide',
    content: [
      { type: 'p', text: 'It\'s one of the most common questions we get at Farwa Beauty Salon: "Should I thread or wax?" The answer depends on the area being treated, your skin sensitivity, and what results you\'re after. Here\'s an honest breakdown from our team.' },
      { type: 'h2', text: 'Threading: Precision for the Face' },
      { type: 'p', text: 'Threading uses a twisted cotton thread to lift hair from the follicle. It\'s the gold standard for eyebrows because it offers unmatched precision — individual hairs can be targeted without affecting surrounding skin. At Farwa, our Eyebrow Threading (Rs 200) takes about 10 minutes and gives clean, architectural brows.' },
      { type: 'p', text: 'Best for: Eyebrows, upper lip, forehead, chin, and sideburns. Ideal for sensitive or acne-prone skin because no chemicals or heat touch the skin.' },
      { type: 'h2', text: 'Waxing: Speed for Larger Areas' },
      { type: 'p', text: 'Waxing removes hair in strips, making it far more efficient for arms, legs, and body. Rica hot wax is gentler on sensitive areas (face, bikini) because it grips hair without pulling skin. Honey wax is effective and affordable for larger body areas like Full Legs (Rs 1,200) or Full Body (Rs 2,800).' },
      { type: 'p', text: 'Best for: Arms, legs, back, underarms, and full body. Waxing also lightly exfoliates, leaving skin smoother than threading.' },
      { type: 'h2', text: 'When to Choose What' },
      { type: 'p', text: 'For facial hair: threading wins on precision and gentleness. For body hair: waxing wins on speed and coverage. Many of our regular clients combine both — threading for brows and upper lip, waxing for everything else.' },
      { type: 'h2', text: 'What About Skin Reactions?' },
      { type: 'p', text: 'Threading causes minimal redness that fades in 30 minutes. Waxing can cause temporary redness for 1-2 hours, especially on first visits. Rica wax minimises irritation compared to traditional strip wax. If you have extremely sensitive or rosacea-prone skin, threading is the safer choice for facial areas.' },
      { type: 'h2', text: 'Try Both and Decide' },
      { type: 'p', text: 'Everyone\'s skin responds differently. The best way to know is to experience both with trained professionals. Book a session at Farwa Beauty Salon — we\'ll guide you based on your skin type and preferences. WhatsApp us at +92 322 2782254.' },
    ],
  },
  {
    slug: 'make-manicure-last-two-weeks',
    title: 'How to Make Your Manicure Last 2 Weeks',
    description: 'Professional tips to extend the life of your salon manicure — from nail prep to daily habits that prevent chipping.',
    date: '2026-04-20',
    readTime: '4 min read',
    category: 'Nails',
    content: [
      { type: 'p', text: 'You just got a beautiful manicure at the salon and within three days it\'s chipping. Sound familiar? The problem usually isn\'t the polish — it\'s what happens before and after application. Here\'s how to get a full two weeks out of your next manicure.' },
      { type: 'h2', text: '1. Prep Matters More Than Polish' },
      { type: 'p', text: 'Oil on your nail plate is the number one enemy of adhesion. Before polish, nails should be clean, dry, and lightly buffed. At Farwa Beauty Salon, our manicure services (starting from Rs 900) always include proper nail preparation — filing, cuticle care, and dehydration of the nail plate.' },
      { type: 'h2', text: '2. Always Use Base Coat' },
      { type: 'p', text: 'Base coat isn\'t optional. It creates a bonding layer between your natural nail and the colour. Without it, polish lifts from the edges within 48 hours. A good base coat also prevents staining, especially with darker reds and berries.' },
      { type: 'h2', text: '3. Cap the Free Edge' },
      { type: 'p', text: 'This is the trick most people miss at home. When applying colour and top coat, swipe a thin layer across the tip of the nail. This "caps" the edge and prevents water from getting under the polish — the main cause of tip chipping.' },
      { type: 'h2', text: '4. Wear Gloves for Chores' },
      { type: 'p', text: 'Hot water, detergent, and scrubbing are your manicure\'s worst enemies. Keep rubber gloves by the sink. This one habit alone can double the life of your polish. The same applies to hand sanitiser — the alcohol dries out polish and makes it brittle.' },
      { type: 'h2', text: '5. Refresh With Top Coat on Day 4' },
      { type: 'p', text: 'Apply a thin layer of top coat on day 3 or 4. This refreshes the shine and adds another protective barrier. It takes 2 minutes and can extend your manicure by nearly a week.' },
      { type: 'h2', text: 'Upgrade to a Longer-Lasting Option' },
      { type: 'p', text: 'If you need guaranteed longevity, our Paraffin Manicure (Rs 1,300) or SPA Manicure (Rs 1,400) include conditioning treatments that keep nails healthy and polish adherent for longer. For special occasions, French Manicure (Rs 1,600) with a gel-quality top coat is our most durable finish.' },
      { type: 'p', text: 'Book your next manicure at Farwa Beauty Salon, PECHS Block 2. WhatsApp us at +92 322 2782254.' },
    ],
  },
]

export { BLOG_POSTS }

function ArticleJsonLd({ post }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'Farwa Beauty Salon' },
    publisher: {
      '@type': 'Organization',
      name: 'Farwa Beauty Salon',
      logo: { '@type': 'ImageObject', url: 'https://farwasalon.com/logo.jpg' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://farwasalon.com/blog/${post.slug}`,
    },
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function BreadcrumbJsonLd({ items }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

function BlogIndex() {
  const booking = useBooking()
  usePageMeta({
    title: 'Beauty Tips & Blog — Farwa Beauty Salon, Karachi',
    description: 'Expert beauty tips, bridal prep guides, skincare advice, and salon insights from Farwa Beauty Salon in PECHS Block 2, Karachi.',
    canonical: 'https://farwasalon.com/blog',
    ogImage: 'https://farwasalon.com/logo.jpg',
  })

  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://farwasalon.com/' },
        { name: 'Blog', url: 'https://farwasalon.com/blog' },
      ]} />
      <div className="mb-10 md:mb-14 border-b border-[#e4ddd7] pb-8">
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: '60%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="display-section text-ink mb-4"
          >
            BEAUTY TIPS<span className="text-[#e4ddd7] mx-3 font-light italic text-[0.6em]">—</span>&amp; GUIDES
          </motion.h1>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-stone text-sm font-light max-w-lg"
        >
          Expert advice from our team — bridal prep timelines, skincare for Karachi weather, and professional tips you can use at home.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        {BLOG_POSTS.map((post, i) => (
          <motion.article
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group border border-[#e4ddd7] hover:border-ink transition-colors duration-300"
          >
            <Link to={`/blog/${post.slug}`} className="block p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[9px] tracking-[0.24em] uppercase text-stone font-['Inter'] bg-mist px-2 py-1">
                  {post.category}
                </span>
                <span className="text-stone/50 text-[10px] font-['Inter']">{post.readTime}</span>
              </div>
              <h2 className="font-['Syne'] font-bold text-base md:text-lg text-ink leading-snug mb-3 group-hover:text-stone transition-colors">
                {post.title}
              </h2>
              <p className="text-stone text-sm font-light leading-relaxed line-clamp-2 mb-4">
                {post.description}
              </p>
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.16em] uppercase font-medium font-['Inter'] text-ink group-hover:gap-2 transition-all">
                Read article <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </motion.article>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-[#e4ddd7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-stone text-sm font-light font-['Inter']">
          Have a beauty question? We&apos;d love to answer it.
        </p>
        <button
          onClick={() => booking.open()}
          className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors"
        >
          Book a Consultation <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </>
  )
}

function BlogArticle({ post }) {
  usePageMeta({
    title: `${post.title} — Farwa Beauty Salon`,
    description: post.description,
    canonical: `https://farwasalon.com/blog/${post.slug}`,
    ogImage: 'https://farwasalon.com/logo.jpg',
  })

  const formatted = new Date(post.date + 'T12:00:00').toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <ArticleJsonLd post={post} />
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: 'https://farwasalon.com/' },
        { name: 'Blog', url: 'https://farwasalon.com/blog' },
        { name: post.title, url: `https://farwasalon.com/blog/${post.slug}` },
      ]} />

      <div className="max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/blog"
            className="flex items-center gap-2 text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors mb-8"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> All Articles
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 pb-8 border-b border-[#e4ddd7]"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[9px] tracking-[0.24em] uppercase text-stone font-['Inter'] bg-mist px-2 py-1">
              {post.category}
            </span>
            <span className="text-stone/50 text-[10px] font-['Inter']">{post.readTime}</span>
          </div>
          <h1 className="font-['Unbounded'] font-bold text-2xl md:text-3xl text-ink leading-tight mb-3">
            {post.title}
          </h1>
          <p className="text-stone text-sm font-light">
            Published {formatted} · Farwa Beauty Salon
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose-farwa"
        >
          {post.content.map((block, i) => {
            if (block.type === 'h2') {
              return (
                <h2
                  key={i}
                  className="font-['Syne'] font-bold text-lg text-ink mt-8 mb-3"
                >
                  {block.text}
                </h2>
              )
            }
            return (
              <p
                key={i}
                className="text-stone text-[15px] font-light leading-relaxed mb-4 font-['Inter']"
              >
                {block.text}
              </p>
            )
          })}
        </motion.div>

        <div className="mt-10 pt-8 border-t border-[#e4ddd7] flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href={WA_DEFAULT}
            target="_blank"
            rel="noreferrer"
            className="tap-safe inline-flex items-center gap-2 bg-ink text-white text-[11px] tracking-[0.14em] uppercase font-semibold font-['Inter'] px-7 py-4 hover:bg-stone transition-colors"
          >
            Book on WhatsApp <ArrowUpRight className="w-4 h-4" />
          </a>
          <Link
            to="/blog"
            className="text-stone text-[11px] tracking-[0.14em] uppercase font-['Inter'] hover:text-ink transition-colors"
          >
            ← More articles
          </Link>
        </div>
      </div>
    </>
  )
}

export default function Blog() {
  const { slug } = useParams()
  const post = slug ? BLOG_POSTS.find((p) => p.slug === slug) : null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  return (
    <div className="bg-white overflow-x-hidden">
      <SkipLink />
      <Navbar />
      <div className="pt-[calc(3.375rem+env(safe-area-inset-top,0px))] md:pt-[calc(3.5rem+env(safe-area-inset-top,0px))]">
        <main
          id="main"
          className="max-w-screen-xl mx-auto px-4 sm:px-5 md:px-10 py-14 md:py-20 min-h-screen"
        >
          {post ? <BlogArticle post={post} /> : <BlogIndex />}
        </main>
      </div>
      <Footer />
      <StickyWA />
    </div>
  )
}
