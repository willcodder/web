import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { resetPassword } from '../../utils/auth'
import { useTheme } from '../../context/ThemeContext'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dark } = useTheme()
  const email = searchParams.get('email') || ''

  const [code, setCode]         = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const inputStyle = {
    background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
    color: dark ? '#fff' : '#1c1c1e',
  }

  function handleCodeChange(e) {
    // Auto-uppercase and format as XXXX-XXXX
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (val.length > 4) {
      val = val.slice(0, 4) + '-' + val.slice(4, 8)
    }
    setCode(val)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const result = await resetPassword(email, code, password)
      if (result.error) { setError(result.error); return }
      navigate('/login?reset=ok')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle={`Recuperando cuenta de ${email}`}
      backTo="/forgot-password"
      backLabel="Volver"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="Código de recuperación (XXXX-XXXX)"
            autoComplete="off"
            autoFocus
            maxLength={9}
            className="w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none font-mono tracking-widest text-center"
            style={inputStyle}
          />
          <p className="text-[11px] mt-1 pl-1" style={{ color: dark ? '#636366' : '#8e8e93' }}>
            Introduce el código de 8 caracteres que recibiste al registrarte
          </p>
        </div>

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            className="w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none pr-12"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1"
            style={{ color: dark ? '#8e8e93' : '#636366', background: 'none', border: 'none', cursor: 'pointer' }}
            tabIndex={-1}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <input
          type={show ? 'text' : 'password'}
          value={confirm}
          onChange={e => { setConfirm(e.target.value); setError('') }}
          placeholder="Confirmar nueva contraseña"
          autoComplete="new-password"
          className="w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none"
          style={inputStyle}
        />

        {error && (
          <p className="text-[13px] text-center font-medium" style={{ color: '#FF3B30' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !code || !password || !confirm}
          className="w-full py-3.5 mt-1 rounded-[14px] text-white text-[15px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#007AFF', border: 'none', cursor: 'pointer' }}
        >
          <KeyRound size={15} />
          {loading ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link to="/login" className="text-[13px]" style={{ color: '#007AFF', fontWeight: 500 }}>
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  )
}
