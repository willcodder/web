import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { sendPasswordResetEmail } from '../../utils/auth-supabase'
import { useTheme } from '../../context/ThemeContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const inputStyle = {
    background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
    color: dark ? '#fff' : '#1c1c1e',
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await sendPasswordResetEmail(email.trim())
      if (result.error) {
        setError(result.error)
        return
      }
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Email enviado"
        subtitle="Revisa tu bandeja de entrada"
        backTo="/login"
        backLabel="Volver"
      >
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center">
            <CheckCircle size={24} className="text-[#34C759]" />
          </div>
          <p className="text-[15px] font-semibold text-gray-900 dark:text-white text-center">Email de recuperación enviado</p>
          <p className="text-[12px] text-gray-400 dark:text-[#636366] text-center">Hemos enviado un email a {email} con instrucciones para cambiar tu contraseña.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Introduce tu email para continuar"
      backTo="/login"
      backLabel="Volver al inicio de sesión"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError('') }}
          placeholder="Email"
          autoComplete="email"
          autoFocus
          className="w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none"
          style={inputStyle}
        />

        {error && (
          <p className="text-[13px] text-center font-medium" style={{ color: '#FF3B30' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3.5 mt-1 rounded-[14px] text-white text-[15px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#007AFF', border: 'none', cursor: 'pointer' }}
        >
          <Mail size={15} />
          {loading ? 'Enviando…' : 'Enviar email'}
        </button>
      </form>
    </AuthLayout>
  )
}
