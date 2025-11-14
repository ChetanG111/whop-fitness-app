/**
 * Client-side Supabase Client
 * 
 * Uses ANON_KEY for browser operations:
 * - File uploads from the browser
 * - Public data access
 * - RLS-protected operations
 * 
 * ✅ SAFE: This can be imported in client components
 * The anon key is public and safe to expose in the browser
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local for:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

/**
 * Public Supabase client for browser usage
 * Safe to use in client components
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
