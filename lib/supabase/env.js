/**
 * Shared env lookup for Supabase browser/server/proxy clients.
 * Fails soft when unset so marketing routes keep working without admin keys.
 */

export function getSupabaseAnonEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) return null
  return { url, anonKey }
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null
}
