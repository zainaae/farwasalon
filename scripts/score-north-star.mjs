import fs from 'fs'

const checks = [
  ['/', 'app/page.jsx', 'app/home-below-fold.jsx', 'home'],
  ['/services', 'app/services/page.jsx', 'app/services/services-client.jsx', 'money'],
  ['/book', 'app/book/page.jsx', 'app/book/page.jsx', 'flow'],
  ['/book/confirmation', 'app/book/confirmation/page.jsx', 'app/book/confirmation/confirmation-client.jsx', 'flow'],
  ['/book/cancel', 'app/book/cancel/page.jsx', 'app/book/cancel/cancel-client.jsx', 'flow'],
  ['/prices', 'app/prices/page.jsx', 'app/prices/page.jsx', 'money'],
  ['/bridal', 'app/bridal/page.jsx', 'app/bridal/page.jsx', 'money'],
  ['/deals', 'app/deals/page.jsx', 'app/deals/page.jsx', 'money'],
  ['/freedom-deal', 'app/freedom-deal/page.jsx', 'app/freedom-deal/page.jsx', 'money'],
  ['/about', 'app/about/page.jsx', 'app/about/about-client.jsx', 'info'],
  ['/faq', 'app/faq/page.jsx', 'app/faq/faq-client.jsx', 'info'],
  ['/contact', 'app/contact/page.jsx', 'app/contact/contact-client.jsx', 'money'],
  ['/gallery', 'app/gallery/page.jsx', 'app/gallery/gallery-client.jsx', 'info'],
  ['/blog', 'app/blog/page.jsx', 'app/blog/blog-index-client.jsx', 'info'],
  ['/blog/[slug]', 'app/blog/[slug]/page.jsx', 'app/blog/[slug]/blog-article.jsx', 'info'],
  ['/privacy', 'app/privacy/page.jsx', 'app/privacy/privacy-client.jsx', 'legal'],
  ['/beauty-salon-karachi', 'app/beauty-salon-karachi/page.jsx', 'app/beauty-salon-karachi/page.jsx', 'seo'],
  ['/areas/[area]', 'app/areas/[area]/page.jsx', 'app/areas/[area]/page.jsx', 'seo'],
  ['/services/[category]', 'app/services/[categorySlug]/page.jsx', 'app/services/[categorySlug]/category-detail-client.jsx', 'money'],
]

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8')
  } catch {
    return ''
  }
}

const rows = []
for (const [route, page, body, kind] of checks) {
  let src = read(body) + '\n' + read(page)
  if (kind === 'home') src += '\n' + read('app/home-hero.jsx')
  const titleStack = src.includes('title-stack')
  const displayPage = /display-page|display-section/.test(src)
  const eyebrow = src.includes('eyebrow')
  /* PageCloseCta owns the ink Book + WhatsApp pair (btn-loud inside the shared component). */
  const pageClose = src.includes('PageCloseCta')
  const bookWa =
    pageClose ||
    ((/\/book|Book an|Book online|btn-primary/.test(src)) && (/wa\.me|WaCta|WhatsApp/i.test(src)))
  const btnLoud = src.includes('btn-loud') || pageClose
  const gaps = []

  if (kind === 'home') {
    if (!/hard-numbers-band|HardNumbersBand/.test(src)) gaps.push('missing hard-numbers band')
    if (!btnLoud) gaps.push('missing loud CTA')
    if (/More glow|display-staccato/.test(src)) gaps.push('BAD Quoti dress')
    if (!/Farwa Beauty Salon|PECHS/.test(src)) gaps.push('weak brand in hero files')
    if (!/LiveAvailability/.test(src)) gaps.push('missing live availability on home')
    if (/EditorialSlideshow/.test(src)) gaps.push('EditorialSlideshow must be removed')
    if (!/formatSalonHoursLine|formatSalonHoursExact/.test(src)) {
      gaps.push('hours not using single-format helper')
    }
  } else if (kind === 'flow' || kind === 'legal') {
    if (/display-staccato|More glow|plum-gradient|380 Google/.test(src)) gaps.push('BAD Quoti dress')
  } else {
    if (!titleStack) gaps.push('no title-stack')
    if (!eyebrow) gaps.push('no eyebrow')
    if (!displayPage) gaps.push('no display-page/section')
    if ((kind === 'money' || kind === 'info' || kind === 'seo') && !bookWa) gaps.push('weak Book+WA')
    if (kind === 'money' && !btnLoud) gaps.push('no btn-loud close')
    if (/display-staccato|More glow|plum-gradient|380 Google/.test(src)) gaps.push('BAD Quoti dress')
  }

  rows.push({ route, kind, ok: gaps.length === 0, gaps })
}

for (const r of rows) {
  const mark = r.ok ? 'PASS' : 'FAIL'
  console.log(`${mark}\t${r.route}\t[${r.kind}]\t${r.gaps.join('; ') || '—'}`)
}
console.log(`\n${rows.filter((r) => r.ok).length}/${rows.length} pass`)
fs.writeFileSync('page-north-star-score.json', JSON.stringify(rows, null, 2))
