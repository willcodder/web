import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qhtfomwfduldtlgthujz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodGZvbXdmZHVsZHRsZ3RodWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDIyMjYsImV4cCI6MjA5MDYxODIyNn0.KkHYdSqE1LIU5bHjBKbVHtN-RjKfaGJrM9QY92Z8hjo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Auth helpers
export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password })
}

export async function signInWithEmail(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUserFromSupabase() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function resetPassword(email) {
  return supabase.auth.resetPasswordForEmail(email)
}

export async function updatePassword(newPassword) {
  return supabase.auth.updateUser({ password: newPassword })
}
