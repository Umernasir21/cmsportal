import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase config. Copy .env.example to .env, fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project settings, and restart the dev server.'
  )
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')
