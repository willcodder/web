async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function genRecoveryCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, (_, i) =>
    i === 4
      ? '-' + chars[Math.floor(Math.random() * chars.length)]
      : chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

export function getUsers() {
  try { return JSON.parse(localStorage.getItem('av_users') || '[]') } catch { return [] }
}

export function getSession() {
  return sessionStorage.getItem('av_session') || null
}

export function setSession(userId) {
  sessionStorage.setItem('av_session', userId)
}

export function clearSession() {
  sessionStorage.removeItem('av_session')
}

export function getCurrentUser() {
  const id = getSession()
  return id ? getUsers().find(u => u.id === id) || null : null
}

export async function register(name, email, password) {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase().trim()))
    return { error: 'Este email ya está registrado' }
  const recoveryCode = genRecoveryCode()
  const normalized = recoveryCode.replace('-', '')
  const [passwordHash, recoveryHash] = await Promise.all([sha256(password), sha256(normalized)])
  const user = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    recoveryHash,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem('av_users', JSON.stringify([...users, user]))
  return { user, recoveryCode }
}

export async function login(email, password) {
  const user = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase().trim())
  if (!user) return { error: 'Email o contraseña incorrectos' }
  if (await sha256(password) !== user.passwordHash) return { error: 'Email o contraseña incorrectos' }
  return { user }
}

export async function resetPassword(email, recoveryCode, newPassword) {
  const users = getUsers()
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim())
  if (idx === -1) return { error: 'No existe ninguna cuenta con ese email' }
  const codeHash = await sha256(recoveryCode.replace('-', '').toUpperCase())
  if (codeHash !== users[idx].recoveryHash) return { error: 'Código de recuperación incorrecto' }
  users[idx].passwordHash = await sha256(newPassword)
  localStorage.setItem('av_users', JSON.stringify(users))
  return { ok: true }
}
