async function hashPassword(pwd) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function isFirstTime() {
  return !localStorage.getItem('app_pwd_hash')
}

export async function setPassword(pwd) {
  const hash = await hashPassword(pwd)
  localStorage.setItem('app_pwd_hash', hash)
}

export async function checkPassword(pwd) {
  const stored = localStorage.getItem('app_pwd_hash')
  if (!stored) return false
  return (await hashPassword(pwd)) === stored
}

export function sessionUnlocked() {
  return sessionStorage.getItem('app_unlocked') === '1'
}

export function sessionLock() {
  sessionStorage.removeItem('app_unlocked')
}

export function sessionUnlock() {
  sessionStorage.setItem('app_unlocked', '1')
}
