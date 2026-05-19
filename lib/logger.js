import { createHash } from 'node:crypto'

/** SHA-256 → first 10 hex of an IP. Lets us correlate without storing PII. */
export function hashIp(ip) {
  if (!ip || ip === 'unknown') return 'anon'
  return createHash('sha256').update(String(ip)).digest('hex').slice(0, 10)
}

function emit(level, endpoint, msg, ctx) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    endpoint,
    msg,
    ...(ctx || {}),
  }
  const line = JSON.stringify(entry)
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const logger = {
  info: (endpoint, msg, ctx) => emit('info', endpoint, msg, ctx),
  warn: (endpoint, msg, ctx) => emit('warn', endpoint, msg, ctx),
  error: (endpoint, msg, ctx) => emit('error', endpoint, msg, ctx),
}

/** Convert an unknown error into a safe loggable object. */
export function errCtx(err) {
  if (!err) return { error: 'unknown' }
  if (err instanceof Error) {
    return { error: err.message, code: err.code, name: err.name }
  }
  return { error: String(err) }
}
