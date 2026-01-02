import { createClient } from '@supabase/supabase-js'

// Ganti URL dan KEY dengan data dari dashboard Supabase Anda
const supabaseUrl = 'https://gldtqnkgkforiytgecbo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsZHRxbmtna2Zvcml5dGdlY2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNDUyOTksImV4cCI6MjA4MjgyMTI5OX0.V8NTurougjEcNhSYWp3KPrxKVKEex3GxnyDKSaBMrBY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)