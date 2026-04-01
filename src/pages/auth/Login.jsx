import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Download, Upload, X } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { login } from '../../utils/auth-supabase'
import { useTheme } from '../../context/ThemeContext'

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Note: Cross-browser transfer removed - Supabase syncs data automatically across devices

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
      onLogin(result.user)
      navigate('/app/')
    } finally {
      setLoading(false)
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
      </div>

    </AuthLayout>
  )
}
