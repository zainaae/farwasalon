import { describe, it, expect, vi, afterEach } from 'vitest'
import { logger, hashIp, errCtx } from './logger.js'

describe('hashIp', () => {
  it('returns "anon" for empty / unknown input', () => {
    expect(hashIp('')).toBe('anon')
    expect(hashIp(null)).toBe('anon')
    expect(hashIp(undefined)).toBe('anon')
    expect(hashIp('unknown')).toBe('anon')
  })

  it('returns a 10-char hex digest for a real IP', () => {
    const h = hashIp('203.0.113.42')
    expect(h).toMatch(/^[a-f0-9]{10}$/)
  })

  it('is deterministic for the same input', () => {
    expect(hashIp('203.0.113.42')).toBe(hashIp('203.0.113.42'))
  })

  it('differs for different inputs', () => {
    expect(hashIp('203.0.113.42')).not.toBe(hashIp('203.0.113.43'))
  })
})

describe('errCtx', () => {
  it('handles undefined / null', () => {
    expect(errCtx(undefined)).toEqual({ error: 'unknown' })
    expect(errCtx(null)).toEqual({ error: 'unknown' })
  })

  it('extracts Error fields safely', () => {
    const e = new TypeError('bad input')
    e.code = 'BAD_INPUT'
    const ctx = errCtx(e)
    expect(ctx.error).toBe('bad input')
    expect(ctx.code).toBe('BAD_INPUT')
    expect(ctx.name).toBe('TypeError')
  })

  it('stringifies non-error values', () => {
    expect(errCtx('a plain string')).toEqual({ error: 'a plain string' })
    expect(errCtx(42)).toEqual({ error: '42' })
  })
})

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('info writes JSON to console.log with expected shape', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('/api/test', 'hello', { foo: 'bar' })
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('info')
    expect(entry.endpoint).toBe('/api/test')
    expect(entry.msg).toBe('hello')
    expect(entry.foo).toBe('bar')
    expect(entry.ts).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })

  it('error writes JSON to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logger.error('/api/test', 'boom', { ip: 'hashed' })
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('error')
    expect(entry.ip).toBe('hashed')
  })

  it('warn writes JSON to console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logger.warn('/api/test', 'maybe-bad')
    expect(spy).toHaveBeenCalledTimes(1)
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.level).toBe('warn')
  })

  it('tolerates missing context', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logger.info('/x', 'no-ctx')
    const entry = JSON.parse(spy.mock.calls[0][0])
    expect(entry.msg).toBe('no-ctx')
  })
})
