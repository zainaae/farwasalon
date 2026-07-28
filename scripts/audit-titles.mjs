/** Audit title/meta across the live sitemap: length, truncation risk, duplication,
 *  and whether money pages front-load a price hook (the CTR lever). */
const BASE = process.env.QA_BASE || 'http://localhost:3000'

const res = await fetch(`${BASE}/sitemap.xml`)
const index = await res.text()
const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])

const urls = []
for (const child of children) {
  const xml = await (await fetch(child.replace(/^https:\/\/farwasalon\.com/, BASE))).text()
  urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))
}

const rows = []
for (const u of urls) {
  const path = u.replace(/^https:\/\/farwasalon\.com/, '')
  const html = await (await fetch(`${BASE}${path}`)).text()
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] ?? ''
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? ''
  rows.push({ path, title, desc })
}

const byTitle = new Map()
const byDesc = new Map()
for (const r of rows) {
  byTitle.set(r.title, (byTitle.get(r.title) ?? 0) + 1)
  byDesc.set(r.desc, (byDesc.get(r.desc) ?? 0) + 1)
}

const longT = rows.filter((r) => r.title.length > 60)
const shortT = rows.filter((r) => r.title.length < 30)
const longD = rows.filter((r) => r.desc.length > 160)
const shortD = rows.filter((r) => r.desc.length < 70)
const noPrice = rows.filter((r) => !/Rs\s?[\d,]+/.test(r.title))
const dupT = [...byTitle.entries()].filter(([, n]) => n > 1)
const dupD = [...byDesc.entries()].filter(([, n]) => n > 1)

console.log(`pages audited: ${rows.length}`)
console.log(`titles >60 chars (truncation risk): ${longT.length}`)
console.log(`titles <30 chars (under-using space): ${shortT.length}`)
console.log(`descriptions >160 chars: ${longD.length}`)
console.log(`descriptions <70 chars: ${shortD.length}`)
console.log(`titles WITHOUT a price hook: ${noPrice.length}`)
console.log(`duplicate titles: ${dupT.length}  duplicate descriptions: ${dupD.length}`)

if (process.env.VERBOSE) {
  console.log('\n--- longest titles ---')
  for (const r of longT.sort((a, b) => b.title.length - a.title.length).slice(0, 12)) {
    console.log(`  ${r.title.length}  ${r.path}\n      ${r.title}`)
  }
  console.log('\n--- no price hook (sample) ---')
  for (const r of noPrice.slice(0, 15)) console.log(`  ${r.path} :: ${r.title}`)
  if (dupT.length) {
    console.log('\n--- duplicate titles (cannibalization) ---')
    for (const [t, n] of dupT.slice(0, 8)) {
      console.log(`  x${n} ${t}`)
      for (const r of rows.filter((x) => x.title === t)) console.log(`        ${r.path}`)
    }
  }
  console.log('\n--- longest descriptions ---')
  for (const r of longD.sort((a, b) => b.desc.length - a.desc.length).slice(0, 14)) {
    console.log(`  ${r.desc.length}  ${r.path}`)
  }
  const groups = {}
  for (const r of longD) {
    const kind = r.path.startsWith('/blog/') ? 'blog' : r.path.startsWith('/services/') ? (/-in-|^\/services\/best-/.test(r.path) ? 'location' : 'category') : 'other'
    groups[kind] = (groups[kind] ?? 0) + 1
  }
  console.log('\nlong descriptions by page type:', JSON.stringify(groups))
}
