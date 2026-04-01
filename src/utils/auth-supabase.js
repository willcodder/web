import { supabase, signUpWithEmail, signInWithEmail, signOut as supabaseSignOut, getCurrentUserFromSupabase, resetPassword, updatePassword } from './supabase'

// Get current authenticated user
export async function getCurrentUser() {
  try {
    const user = await getCurrentUserFromSupabase()
    if (!user) return null
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email,
    }
  } catch (e) {
    console.error('Error getting current user:', e)
    return null
  }
}

// Register new user
export async function register(email, password, name) {
  try {
    const { data, error } = await signUpWithEmail(email, password)
    if (error) return { error: error.message }

    // Update user metadata with name
    if (data.user) {
      await supabase.auth.updateUser({
        data: { name }
      })
    }

    return { user: { id: data.user.id, email: data.user.email, name } }
  } catch (e) {
    return { error: 'Error en el registro: ' + e.message }
  }
}

// Login user
export async function login(email, password) {
  try {
    const { data, error } = await signInWithEmail(email, password)
    if (error) return { error: error.message }
    return { user: { id: data.user.id, email: data.user.email } }
  } catch (e) {
    return { error: 'Error al iniciar sesión: ' + e.message }
  }
}

// Logout user
export async function logout() {
  try {
    const { error } = await supabaseSignOut()
    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: 'Error al cerrar sesión: ' + e.message }
  }
}

// Reset password
export async function sendPasswordResetEmail(email) {
  try {
    const { error } = await resetPassword(email)
    if (error) return { error: error.message }
    return { success: true, message: 'Email de recuperación enviado' }
  } catch (e) {
    return { error: 'Error: ' + e.message }
  }
}

// Update password with token (from reset email)
export async function resetPasswordWithToken(newPassword) {
  try {
    const { error } = await updatePassword(newPassword)
    if (error) return { error: error.message }
    return { success: true }
  } catch (e) {
    return { error: 'Error: ' + e.message }
  }
}

// Session management (for compatibility with old auth.js)
export function setSession(userId) {
  // Supabase handles this automatically
}

export function clearSession() {
  // Session cleared on logout via supabase.auth.signOut()
}

export function getUsers() {
  // This is deprecated with cloud auth - only one user per session
  return []
}
