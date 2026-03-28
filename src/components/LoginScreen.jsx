import { useState } from 'react'
import { Film, Eye, EyeOff, Lock } from 'lucide-react'
import { isFirstTime, setPassword, checkPassword, sessionUnlock } from '../utils/auth'

export default function LoginScreen({ onLogin }) {
  const firstTime = isFirstTime()
  const [pwd, setPwd]         = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow]       = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (firstTime) {
        if (pwd.length < 4) { setError('Mínimo 4 caracteres'); return }
        if (pwd !== confirm)  { setError('Las contraseñas no coinciden'); return }
        await setPassword(pwd)
        sessionUnlock()
        onLogin()
      } else {
        const ok = await checkPassword(pwd)
        if (!ok) { setError('Contraseña incorrecta'); return }
        sessionUnlock()
        onLogin()
      }
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `
    w-full px-4 py-3.5 rounded-[14px] text-[15px] border
    bg-white/60 dark:bg-white/[0.07]
    border-black/[0.1] dark:border-white/[0.12]
    text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-[#007AFF]/50 focus:border-[#007AFF]
    transition-all
  `

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F2F2F7] dark:bg-black"
      style={{ backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(0,122,255,0.08) 0%, transparent 60%)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-[28px] p-8 shadow-xl"
        style={{
          background: 'rgba(255,255,255,0.75)',
          backdropFilter: 'saturate(180%) blur(24px)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          border: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* App icon */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-3 shadow-lg"
            style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
          >
            <Film size={30} className="text-white" />
          </div>
          <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">
            Facturación Audiovisual
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">
            {firstTime ? 'Crea tu contraseña de acceso' : 'Introduce tu contraseña'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Password */}
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={pwd}
              onChange={e => { setPwd(e.target.value); setError('') }}
              placeholder={firstTime ? 'Nueva contraseña' : 'Contraseña'}
              autoFocus
              autoComplete={firstTime ? 'new-password' : 'current-password'}
              className={inputCls + ' pr-12'}
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              tabIndex={-1}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Confirm (first time only) */}
          {firstTime && (
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              placeholder="Confirmar contraseña"
              autoComplete="new-password"
              className={inputCls}
            />
          )}

          {/* Error */}
          {error && (
            <p className="text-[13px] text-[#FF3B30] text-center font-medium">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !pwd}
            className="w-full py-3.5 mt-1 rounded-[14px] bg-[#007AFF] hover:bg-[#0062CC] active:bg-[#0055b3] text-white text-[15px] font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock size={15} />
            {loading ? 'Un momento…' : firstTime ? 'Crear contraseña y entrar' : 'Entrar'}
          </button>
        </form>

        {!firstTime && (
          <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 mt-5">
            Tus datos están protegidos localmente
          </p>
        )}
      </div>
    </div>
  )
}
