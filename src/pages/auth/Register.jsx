import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { register } from '../../utils/auth-supabase'
import { useTheme } from '../../context/ThemeContext'

export default function Register({ onLogin }) {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)

  const inputCls = `w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none`
  const inputStyle = {
    background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
    color: dark ? '#fff' : '#1c1c1e',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Introduce tu nombre'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const result = await register(email, password, name)
      if (result.error) { setError(result.error); return }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="¡Cuenta creada!"
        subtitle="Redirigiendo a login…"
      >
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-gray-900 dark:text-white">Cuenta creada exitosamente</p>
          <p className="text-[12px] text-gray-400 dark:text-[#636366]">Redirigiendo a login en 3 segundos…</p>
          <button onClick={() => navigate('/login')} className="mt-2 text-[13px] text-[#007AFF] hover:underline">
            O haz clic aquí para ir a login
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Únete a Facturación Audiovisual"
      backTo="/"
      backLabel="Volver al inicio"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="Nombre completo"
          autoComplete="name"
          autoFocus
          className={inputCls}
          style={inputStyle}
        />
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="Email"
          autoComplete="email"
          className={inputCls}
          style={inputStyle}
        />
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Contraseña (mín. 6 caracteres)"
            autoComplete="new-password"
            className={inputCls + ' pr-12'}
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
          placeholder="Confirmar contraseña"
          autoComplete="new-password"
          className={inputCls}
          style={inputStyle}
        />

        {error && (
          <p className="text-[13px] text-center font-medium" style={{ color: '#FF3B30' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !name || !email || !password || !confirm}
          className="w-full py-3.5 mt-1 rounded-[14px] text-white text-[15px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#007AFF', border: 'none', cursor: 'pointer' }}
        >
          <UserPlus size={15} />
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-[13px]" style={{ color: dark ? '#8e8e93' : '#636366' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#007AFF', fontWeight: 500 }}>
            Iniciar sesión
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
