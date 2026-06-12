import { NextResponse } from 'next/server'
import { INDEXNOW_KEY, INDEXNOW_KEY_LOCATION } from '../../../lib/indexnow.js'

const HOST = 'https://farwasalon.com'

export async function POST(request) {
  const secret = process.env.INDEXNOW_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Endpoint disabled' }, { status: 503 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { urls } = await request.json()
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'urls array required' }, { status: 400 })
    }

    const fullUrls = urls.map(u => u.startsWith('http') ? u : `${HOST}${u}`)

    const payload = {
      host: 'farwasalon.com',
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: fullUrls,
    }

    const endpoints = [
      'https://api.indexnow.org/indexnow',
      'https://www.bing.com/indexnow',
      'https://yandex.com/indexnow',
    ]

    const results = await Promise.allSettled(
      endpoints.map(ep =>
        fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
    )

    return NextResponse.json({
      submitted: fullUrls.length,
      results: results.map((r, i) => ({
        engine: endpoints[i],
        status: r.status === 'fulfilled' ? r.value.status : 'failed',
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
