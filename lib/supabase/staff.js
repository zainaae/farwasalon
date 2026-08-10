import { redirect } from 'next/navigation'
import { createClient } from './server.js'
import { getSupabaseAnonEnv } from './env.js'

/**
 * Defense-in-depth staff check for Server Components under /admin/(app).
 * Proxy already gates; this catches matcher gaps / stale cookies.
 * @returns {Promise<{ user: import('@supabase/supabase-js').User, staff: { user_id: string, role: string, display_name: string | null } }>}
 */
export async function requireStaff() {
  if (!getSupabaseAnonEnv()) {
    redirect('/admin/login?error=config')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: staff, error } = await supabase
    .from('staff_profiles')
    .select('user_id, role, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !staff) {
    redirect('/admin/login?error=not_staff')
  }

  return { user, staff }
}
