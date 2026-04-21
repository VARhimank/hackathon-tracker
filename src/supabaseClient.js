import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing env vars:', { supabaseUrl: !!supabaseUrl, supabaseAnonKey: !!supabaseAnonKey })
  throw new Error('Supabase env vars not loaded. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local and restart the dev server.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
