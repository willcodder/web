import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import AuthLayout from '../../components/AuthLayout'
import { resetPasswordWithToken } from '../../utils/auth-supabase'
import { supabase } from '../../utils/supabase'
import { useTheme } from '../../context/ThemeContext'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid]   = useState(false)

  const inputStyle = {
    background: dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.6)',
    border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)',
    color: dark ? '#fff' : '#1c1c1e',
  }

  // Validate recovery token in URL
  useEffect(() => {
    async function validateToken() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setIsValid(true)
        } else {
          setError('El enlace de recuperación ha expirado. Solicita uno nuevo.')
        }
      } catch (e) {
        setError('Error al validar el enlace: ' + e.message)
      } finally {
        setValidating(false)
      }
    }
    validateToken()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      const result = await resetPasswordWithToken(password)
      if (result.error) { setError(result.error); return }
      navigate('/login?reset=ok')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <AuthLayout title="Validando enlace…">
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </AuthLayout>
    )
  }

  if (!isValid) {
    return (
      <AuthLayout
        title="Enlace inválido"
        subtitle="No pudimos procesar tu solicitud"
        backTo="/forgot-password"
        backLabel="Solicitar nuevo enlace"
      >
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
          </div>
          <p className="text-[13px] text-gray-600 dark:text-gray-400 text-center">{error}</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Nueva contraseña"
      subtitle="Establece tu nueva contraseña"
      backTo="/login"
      backLabel="Volver"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            autoFocus
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
          placeholder="Confirmar contraseña"
          autoComplete="new-password"
          className="w-full px-4 py-3.5 rounded-[14px] text-[15px] border transition-all outline-none"
          style={inputStyle}
        />

        {error && (
          <p className="text-[13px] text-center font-medium" style={{ color: '#FF3B30' }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full py-3.5 mt-1 rounded-[14px] text-white text-[15px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#007AFF', border: 'none', cursor: 'pointer' }}
        >
          <KeyRound size={15} />
          {loading ? 'Guardando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </AuthLayout>
  )
}
