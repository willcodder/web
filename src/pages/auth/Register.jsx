import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, UserPlus, Copy, Check } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { register, setSession } from '../../utils/auth'
import { useTheme } from '../../context/ThemeContext'

export default function Register({ onLogin }) {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [name, setName]             = useState('')
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [show, setShow]             = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [recoveryCode, setRecovery] = useState(null)
  const [copied, setCopied]         = useState(false)
  const [user, setUser]             = useState(null)

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
      const result = await register(name, email, password)
      if (result.error) { setError(result.error); return }
      setUser(result.user)
      setRecovery(result.recoveryCode)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(recoveryCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleEnter() {
    setSession(user.id)
    onLogin(user)
    navigate('/app/')
  }

  if (recoveryCode) {
    return (
      <AuthLayout
        title="¡Cuenta creada!"
        subtitle="Guarda tu código de recuperación"
      >
        <div
          className="rounded-[16px] p-4 mb-4"
          style={{
            background: dark ? 'rgba(255,159,10,0.12)' : 'rgba(255,159,10,0.1)',
            border: '1px solid rgba(255,159,10,0.3)',
          }}
        >
          <p className="text-[13px] font-semibold mb-3" style={{ color: '#FF9500' }}>
            ⚠️ Guarda este código — es tu única forma de recuperar la contraseña
          </p>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 text-center font-mono text-[22px] font-bold tracking-[4px] py-2 rounded-[10px]"
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: dark ? '#fff' : '#1c1c1e',
              }}
            >
              {recoveryCode}
            </div>
            <button
              onClick={handleCopy}
              className="w-9 h-9 flex items-center justify-center rounded-[10px] transition-colors"
              style={{
                background: copied ? 'rgba(52,199,89,0.15)' : (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'),
                border: 'none',
                cursor: 'pointer',
                color: copied ? '#34C759' : (dark ? '#8e8e93' : '#636366'),
              }}
              title="Copiar código"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <p className="text-[12px] mt-2" style={{ color: dark ? '#8e8e93' : '#636366' }}>
            Anótalo en un lugar seguro. Sin él no podrás recuperar tu cuenta si olvidas la contraseña.
          </p>
        </div>

        <button
          onClick={handleEnter}
          className="w-full py-3.5 rounded-[14px] text-white text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
          style={{ background: '#007AFF', border: 'none', cursor: 'pointer' }}
        >
          Entrar a la app
        </button>
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
