import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { getUsers } from '../../utils/auth'
import { useTheme } from '../../context/ThemeContext'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [email, setEmail]   = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

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
      const users = getUsers()
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())
      if (!found) {
        setError('No existe ninguna cuenta con ese email')
        return
      }
      navigate(`/reset-password?email=${encodeURIComponent(email.toLowerCase().trim())}`)
    } finally {
      setLoading(false)
    }
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
          {loading ? 'Comprobando…' : 'Continuar'}
        </button>
      </form>
    </AuthLayout>
  )
}
