import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonEnv } from './env.js'

/**
 * Browser Supabase client (Client Components). Cookie-based auth via @supabase/ssr.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createClient() {
  const env = getSupabaseAnonEnv()
  if (!env) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    )
  }
  return createBrowserClient(env.url, env.anonKey)
}
