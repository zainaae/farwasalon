#!/usr/bin/env node
/**
 * End-to-end workflow verification using scripts/qa-dataset.mjs.
 *
 * Usage:
 *   node scripts/qa-workflow-run.mjs
 *   BASE_URL=https://farwasalon.com node scripts/qa-workflow-run.mjs
 *   QA_WRITE=1 node scripts/qa-workflow-run.mjs   # optional live booking row
 *   QA_SKIP_CRAWL=1 node scripts/qa-workflow-run.mjs
 */
import {
  QA_BASE_URL_DEFAULT,
  QA_PROBE_ORIGIN,
  API_SCENARIOS,
  ROUTE_CRAWL_PATHS,
  HTML_EXPECTATIONS,
  buildDateScenarios,
  offsetWeekday,
  SAMPLE_SERVICE_IDS,
  BOOKING_CONTACT,
  SLOT_TIMES,
  DATASET_META,
} from './qa-dataset.mjs'

const BASE = (process.env.BASE_URL || QA_BASE_URL_DEFAULT).replace(/\/$/, '')
const WRITE = process.env.QA_WRITE === '1' || process.env.PROBE_WRITE === '1'
const SKIP_CRAWL = process.env.QA_SKIP_CRAWL === '1'
const CRAWL_LIMIT = Number(process.env.QA_CRAWL_LIMIT || '0') || ROUTE_CRAWL_PATHS.length
/** Distinct IP per run avoids 429 when re-running probes against the same host in one session. */
const PROBE_IP = process.env.QA_PROBE_IP || `qa-${Date.now()}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const results = []

function record(group, name, pass, detail = '') {
  results.push({ group, name, pass, detail })
  const tag = pass ? 'OK' : 'FAIL'
  const suffix = detail ? ` — ${detail}` : ''
  console.log(`[${tag}] ${group} :: ${name}${suffix}`)
}

async function probeApi(scenario) {
  const url = `${BASE}${scenario.path}`
  const init = {
    method: scenario.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.PROBE_ORIGIN || QA_PROBE_ORIGIN,
      'X-Forwarded-For': PROBE_IP,
    },
    signal: AbortSignal.timeout(30_000),
  }
  if (scenario.body) {
    init.body = JSON.stringify(scenario.body)
  }

  const start = Date.now()
  try {
    const res = await fetch(url, init)
    const ms = Date.now() - start
    const text = await res.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = text.slice(0, 200)
    }

    const statusOk = scenario.expectStatusIn
      ? scenario.expectStatusIn.includes(res.status)
      : res.status === scenario.expectStatus
    const bodyOk = scenario.bodyCheck ? scenario.bodyCheck(body, res) : true
    const pass = statusOk && bodyOk
    record(
      'api',
      scenario.id,
      pass,
      `${res.status} (${ms}ms)${!pass ? ` expected ${scenario.expectStatusIn || scenario.expectStatus}` : ''}`,
    )
    return { pass, res, body }
  } catch (err) {
    record('api', scenario.id, false, err.message)
    return { pass: false, err }
  }
}

async function crawlRoute(path) {
  const url = `${BASE}${path}`
  const start = Date.now()
  try {
    const res = await fetch(url, {
      headers: { Accept: 'text/html,application/xml,*/*' },
      signal: AbortSignal.timeout(45_000),
      redirect: 'follow',
    })
    const ms = Date.now() - start
    const text = await res.text()
    const passStatus = res.status === 200
    const expectations = HTML_EXPECTATIONS[path]
    let passBody = true
    let missing = ''
    if (path === '/blog/rss.xml') {
      passBody = /<rss|<feed/i.test(text)
      if (!passBody) missing = 'not valid rss'
    } else if (path.endsWith('.xml') || path === '/sitemap.xml') {
      passBody = /urlset|sitemapindex/i.test(text)
      if (!passBody) missing = 'not valid sitemap xml'
    } else if (expectations?.length) {
      for (const snippet of expectations) {
        if (!text.toLowerCase().includes(snippet.toLowerCase())) {
          passBody = false
          missing = `missing "${snippet}"`
          break
        }
      }
    }
    const pass = passStatus && passBody
    record('crawl', path, pass, `${res.status} (${ms}ms)${missing ? ` ${missing}` : ''}`)
    return pass
  } catch (err) {
    record('crawl', path, false, err.message)
    return false
  }
}

function printSummary() {
  const groups = ['api', 'crawl', 'write']
  console.log('\n── Summary ──')
  for (const group of groups) {
    const subset = results.filter((r) => r.group === group)
    if (!subset.length) continue
    const passed = subset.filter((r) => r.pass).length
    console.log(`${group}: ${passed}/${subset.length}`)
  }
  const passed = results.filter((r) => r.pass).length
  const total = results.length
  console.log(`\nTotal: ${passed}/${total}`)
  return passed === total
}

async function main() {
  console.log(`QA workflow run → ${BASE}`)
  console.log(
    `Dataset: ${DATASET_META.categoryCount} categories, ${DATASET_META.serviceCount} services, ${DATASET_META.blogPostCount} blog posts, ${DATASET_META.locationPageCount} location URLs\n`,
  )
  console.log(`Local today: ${buildDateScenarios().today.date}\n`)

  for (const scenario of API_SCENARIOS()) {
    if (scenario.method === 'POST') await sleep(150)
    await probeApi(scenario)
  }

  if (WRITE) {
    console.log('\nQA_WRITE=1 — attempting one real booking…')
    const date = offsetWeekday(3)
    const { pass, body } = await probeApi({
      id: 'book-write',
      method: 'POST',
      path: '/api/book',
      body: {
        serviceId: SAMPLE_SERVICE_IDS.eyebrowThreading,
        date,
        time: SLOT_TIMES.valid[0],
        clientName: BOOKING_CONTACT.name,
        clientPhone: BOOKING_CONTACT.phone,
        notes: BOOKING_CONTACT.notes,
      },
      expectStatusIn: [200, 409],
    })
    if (pass && body?.booking?.cancelToken) {
      record('write', 'cancel-token-present', true, 'token returned — cancel in sheet if needed')
    } else if (pass) {
      record('write', 'cancel-token-present', true, 'booked or slot conflict (409)')
    }
  } else {
    console.log('\nSkip live book write (set QA_WRITE=1 to create one test row).')
  }

  if (!SKIP_CRAWL) {
    console.log(`\nCrawling ${Math.min(CRAWL_LIMIT, ROUTE_CRAWL_PATHS.length)} routes…`)
    const paths = ROUTE_CRAWL_PATHS.slice(0, CRAWL_LIMIT)
    for (const path of paths) {
      await crawlRoute(path)
    }
  } else {
    console.log('\nQA_SKIP_CRAWL=1 — route crawl skipped.')
  }

  const allPass = printSummary()
  if (!allPass) process.exitCode = 1
}

main()
