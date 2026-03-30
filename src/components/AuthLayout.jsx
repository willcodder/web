import { useNavigate } from 'react-router-dom'
import { Film, ChevronLeft } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function AuthLayout({ title, subtitle, children, backTo, backLabel }) {
  const navigate = useNavigate()
  const { dark } = useTheme()

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6"
      style={{
        background: dark ? '#000' : '#F2F2F7',
        backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(0,122,255,0.08) 0%, transparent 60%)',
      }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-[28px] p-8 shadow-xl"
        style={{
          background: dark ? 'rgba(28,28,30,0.85)' : 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(24px)',
          WebkitBackdropFilter: 'saturate(180%) blur(24px)',
          border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* App icon */}
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-3 shadow-lg"
            style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
          >
            <Film size={30} className="text-white" />
          </div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: dark ? '#fff' : '#1c1c1e' }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14px] mt-1 text-center" style={{ color: dark ? '#8e8e93' : '#636366' }}>
              {subtitle}
            </p>
          )}
        </div>

        {children}

        {/* Back link */}
        {backTo && (
          <div className="mt-5 text-center">
            <button
              onClick={() => navigate(backTo)}
              className="inline-flex items-center gap-1 text-[13px] font-medium"
              style={{ color: '#007AFF', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ChevronLeft size={14} />
              {backLabel || 'Volver'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
