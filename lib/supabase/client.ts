import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Environment variables check:', {
      url: supabaseUrl ? '✅ Present' : '❌ Missing',
      key: supabaseAnonKey ? '✅ Present' : '❌ Missing'
    })
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Missing Supabase environment variables - falling back to localStorage')
    }
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
}


