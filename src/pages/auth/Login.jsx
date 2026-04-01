import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Download, Upload, X } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { login, setSession, getUsers } from '../../utils/auth'
import { useTheme } from '../../context/ThemeContext'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Cross-browser transfer
  const [showTransfer, setShowTransfer] = useState(false)
  const [transferCode, setTransferCode] = useState('')
  const [importText, setImportText]     = useState('')
  const [importMsg, setImportMsg]       = useState('')

  const inputCls = `w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none`
  const inputStyle = (dark) => ({
    background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
    color: dark ? '#fff' : '#1c1c1e',
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.error) { setError(result.error); return }
      setSession(result.user.id)
      onLogin(result.user)
      navigate('/app/')
    } finally {
      setLoading(false)
    }
  }

  function exportAccount() {
    const users = getUsers()
    if (!users.length) { alert('No hay ninguna cuenta guardada en este navegador.'); return }
    const code = btoa(JSON.stringify(users))
    setTransferCode(code)
  }

  function importAccount() {
    try {
      const users = JSON.parse(atob(importText.trim()))
      if (!Array.isArray(users) || !users[0]?.passwordHash) throw new Error()
      const existing = getUsers()
      const merged = [...existing]
      users.forEach(u => { if (!merged.find(e => e.id === u.id)) merged.push(u) })
      localStorage.setItem('av_users', JSON.stringify(merged))
      setImportMsg('✓ Cuenta importada correctamente. Ya puedes iniciar sesión.')
      setImportText('')
    } catch {
      setImportMsg('Código incorrecto. Cópialo exactamente desde el otro navegador.')
    }
  }

  return (
    <AuthLayout
      title="Facturación Audiovisual"
      subtitle="Inicia sesión en tu cuenta"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="Email"
          autoComplete="email"
          autoFocus
          className={inputCls}
          style={inputStyle(dark)}
        />
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Contraseña"
            autoComplete="current-password"
            className={inputCls + ' pr-12'}
            style={inputStyle(dark)}
          />
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
            style={{ color: dark ? '#8e8e93' : '#636366', background: 'none', border: 'none', cursor: 'pointer' }}
            tabIndex={-1}>
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p className="text-[13px] text-center font-medium" style={{ color: '#FF3B30' }}>{error}</p>}

        <button type="submit" disabled={loading || !email || !password}
          className="w-full py-3.5 mt-1 rounded-[14px] text-white text-[15px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#007AFF', border: 'none', cursor: 'pointer' }}>
          <LogIn size={15} />
          {loading ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-5 space-y-2 text-center">
        <p className="text-[13px]" style={{ color: dark ? '#8e8e93' : '#636366' }}>
          <Link to="/forgot-password" style={{ color: '#007AFF', fontWeight: 500 }}>
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
        <p className="text-[13px]" style={{ color: dark ? '#8e8e93' : '#636366' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: '#007AFF', fontWeight: 500 }}>Crear cuenta</Link>
        </p>
        <button onClick={() => setShowTransfer(s => !s)}
          className="text-[12px] mt-1"
          style={{ color: dark ? '#636366' : '#8e8e93', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Cambiar de navegador / dispositivo
        </button>
      </div>

      {/* ── Transfer panel ── */}
      {showTransfer && (
        <div className="mt-4 rounded-[18px] overflow-hidden" style={{ background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)' }}>
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[13px] font-semibold" style={{ color: dark ? '#fff' : '#1c1c1e' }}>Transferir cuenta a este navegador</p>
            <button onClick={() => { setShowTransfer(false); setTransferCode(''); setImportText(''); setImportMsg('') }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: dark ? '#636366' : '#8e8e93' }}>
              <X size={14} />
            </button>
          </div>

          {/* Export */}
          <div className="px-4 pb-3">
            <p className="text-[11px] mb-2" style={{ color: dark ? '#8e8e93' : '#636366' }}>
              <strong>Paso 1</strong> — En el navegador donde ya funciona, pulsa este botón y copia el código:
            </p>
            <button onClick={exportAccount}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold"
              style={{ background: '#34C759', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <Download size={12} /> Generar código de exportación
            </button>
            {transferCode && (
              <div className="mt-2">
                <textarea readOnly value={transferCode} rows={3}
                  className="w-full text-[10px] rounded-xl p-2 font-mono resize-none"
                  style={{ background: dark ? 'rgba(0,0,0,0.3)' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: dark ? '#ccc' : '#333' }}
                  onClick={e => e.target.select()} />
                <p className="text-[10px] mt-1" style={{ color: '#34C759' }}>Selecciona todo el texto y cópialo (Cmd+A, Cmd+C)</p>
              </div>
            )}
          </div>

          {/* Import */}
          <div className="px-4 pb-4" style={{ borderTop: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', paddingTop: 12 }}>
            <p className="text-[11px] mb-2" style={{ color: dark ? '#8e8e93' : '#636366' }}>
              <strong>Paso 2</strong> — En este navegador (Safari), pega el código aquí:
            </p>
            <textarea value={importText} onChange={e => { setImportText(e.target.value); setImportMsg('') }}
              placeholder="Pega el código aquí…" rows={3}
              className="w-full text-[10px] rounded-xl p-2 font-mono resize-none"
              style={{ background: dark ? 'rgba(0,0,0,0.3)' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: dark ? '#ccc' : '#333' }} />
            <button onClick={importAccount} disabled={!importText.trim()}
              className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold disabled:opacity-40"
              style={{ background: '#007AFF', color: '#fff', border: 'none', cursor: 'pointer' }}>
              <Upload size={12} /> Importar cuenta
            </button>
            {importMsg && (
              <p className="text-[12px] mt-2 font-medium" style={{ color: importMsg.startsWith('✓') ? '#34C759' : '#FF3B30' }}>{importMsg}</p>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  )
}
