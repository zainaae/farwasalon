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
