import { describe, it, expect } from 'vitest'
import { escapeXml, buildUrlsetXml, buildSitemapIndexXml, xmlResponse } from './sitemap-xml.js'

describe('escapeXml', () => {
  it('escapes the four XML-sensitive characters', () => {
    expect(escapeXml('a & b < c > d " e')).toBe('a &amp; b &lt; c &gt; d &quot; e')
  })

  it('coerces non-strings', () => {
    expect(escapeXml(0.8)).toBe('0.8')
  })

  it('leaves safe strings untouched', () => {
    expect(escapeXml('https://farwasalon.com/services')).toBe('https://farwasalon.com/services')
  })
})

describe('buildUrlsetXml', () => {
  const entries = [
    {
      url: 'https://farwasalon.com/?a=1&b=2',
      lastModified: '2026-07-01',
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  it('produces a urlset document with XML declaration and namespace', () => {
    const xml = buildUrlsetXml(entries)
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml.trim().endsWith('</urlset>')).toBe(true)
  })

  it('escapes ampersands in loc URLs', () => {
    const xml = buildUrlsetXml(entries)
    expect(xml).toContain('<loc>https://farwasalon.com/?a=1&amp;b=2</loc>')
    expect(xml).not.toContain('a=1&b=2')
  })

  it('renders lastmod, changefreq, and priority per entry', () => {
    const xml = buildUrlsetXml(entries)
    expect(xml).toContain('<lastmod>2026-07-01</lastmod>')
    expect(xml).toContain('<changefreq>weekly</changefreq>')
    expect(xml).toContain('<priority>0.8</priority>')
  })

  it('renders one <url> block per entry', () => {
    const xml = buildUrlsetXml([entries[0], entries[0]])
    expect(xml.match(/<url>/g)).toHaveLength(2)
  })
})

describe('buildSitemapIndexXml', () => {
  it('produces a sitemapindex with loc and lastmod', () => {
    const xml = buildSitemapIndexXml([
      { loc: 'https://farwasalon.com/sitemap-static.xml', lastModified: '2026-07-01' },
    ])
    expect(xml).toContain('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    expect(xml).toContain('<loc>https://farwasalon.com/sitemap-static.xml</loc>')
    expect(xml).toContain('<lastmod>2026-07-01</lastmod>')
    expect(xml.trim().endsWith('</sitemapindex>')).toBe(true)
  })
})

describe('xmlResponse', () => {
  it('sets XML content type and a 1-hour cache header', async () => {
    const res = xmlResponse('<x/>')
    expect(res.headers.get('Content-Type')).toBe('application/xml; charset=utf-8')
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600')
    expect(await res.text()).toBe('<x/>')
    expect(res.status).toBe(200)
  })
})

describe('image entries', () => {
  const entry = { url: 'https://farwasalon.com/x', lastModified: '2026-07-30', changeFrequency: 'weekly', priority: 0.8 }

  it('omits the image namespace entirely when no entry has images', () => {
    const xml = buildUrlsetXml([entry])
    expect(xml).not.toContain('xmlns:image')
    expect(xml).not.toContain('<image:image>')
  })

  it('declares the namespace and emits loc + caption when images are present', () => {
    const xml = buildUrlsetXml([
      { ...entry, images: [{ url: 'https://farwasalon.com/threading.jpg', caption: 'Threading in PECHS' }] },
    ])
    expect(xml).toContain('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"')
    expect(xml).toContain('<image:loc>https://farwasalon.com/threading.jpg</image:loc>')
    expect(xml).toContain('<image:caption>Threading in PECHS</image:caption>')
  })

  it('escapes captions — an unescaped ampersand invalidates the whole sitemap', () => {
    const xml = buildUrlsetXml([{ ...entry, images: [{ url: 'https://f.com/a.jpg', caption: 'Bleach & Polish' }] }])
    expect(xml).toContain('Bleach &amp; Polish')
  })

  it('skips the caption node when a caption is missing', () => {
    const xml = buildUrlsetXml([{ ...entry, images: [{ url: 'https://f.com/a.jpg' }] }])
    expect(xml).toContain('<image:loc>')
    expect(xml).not.toContain('<image:caption>')
  })
})
