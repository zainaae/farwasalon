import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseAnonEnv } from './env.js'

/**
 * Refresh the Auth session and gate `/admin/*` (except `/admin/login`).
 * Requires a signed-in user with a `staff_profiles` row.
 *
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const env = getSupabaseAnonEnv()
  const pathname = request.nextUrl.pathname
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/')

  if (!env) {
    if (isLogin) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('error', 'config')
    return NextResponse.redirect(url)
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options)
        })
      },
    },
  })

  /* Do not insert logic between createServerClient and getUser(). */
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (isLogin) {
    if (user) {
      const { data: staff } = await supabase
        .from('staff_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()
      if (staff) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin'
        url.search = ''
        return copyCookies(NextResponse.redirect(url), supabaseResponse)
      }
    }
    return supabaseResponse
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return copyCookies(NextResponse.redirect(url), supabaseResponse)
  }

  const { data: staff, error } = await supabase
    .from('staff_profiles')
    .select('user_id, role, display_name')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !staff) {
    await supabase.auth.signOut()
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('error', 'not_staff')
    return copyCookies(NextResponse.redirect(url), supabaseResponse)
  }

  return supabaseResponse
}

/**
 * @param {import('next/server').NextResponse} target
 * @param {import('next/server').NextResponse} source
 */
function copyCookies(target, source) {
  source.cookies.getAll().forEach(({ name, value, ...options }) => {
    target.cookies.set(name, value, options)
  })
  return target
}
