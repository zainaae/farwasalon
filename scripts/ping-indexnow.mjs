#!/usr/bin/env node
/**
 * Ping Bing IndexNow with priority URLs after deploy.
 * Usage: node scripts/ping-indexnow.mjs
 * Env: INDEXNOW_KEY (optional, default matches public/farwa-salon-indexnow.txt)
 */
import { submitIndexNow, getIndexNowUrls } from '../lib/indexnow.js'

const urls = getIndexNowUrls()
console.log(`Submitting ${urls.length} URLs to IndexNow…`)

const result = await submitIndexNow(urls)
console.log(`Status: ${result.status}`)
if (result.body) console.log(result.body)
process.exit(result.ok ? 0 : 1)
