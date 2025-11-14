/**
 * Server-side Supabase Client
 * 
 * Uses SERVICE_ROLE_KEY for admin operations:
 * - Bypassing Row Level Security (RLS)
 * - Server-side file operations
 * - Admin API calls
 * 
 * ⚠️ DANGER: Never import this in client components!
 * ⚠️ This client has full database access - use carefully
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local for:\n' +
    '- NEXT_PUBLIC_SUPABASE_URL\n' +
    '- SUPABASE_SERVICE_ROLE_KEY'
  )
}

/**
 * Admin Supabase client with elevated permissions
 * Use this for server-side operations only
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
