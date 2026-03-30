import { useNavigate } from 'react-router-dom'
import { Film, FileText, Receipt, TrendingUp, ChevronRight, Shield, Zap } from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif', minHeight: '100vh', background: '#F2F2F7' }}>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(242,242,247,0.85)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            borderRadius: 10,
            background: 'linear-gradient(145deg, #007AFF, #0055b3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Film size={15} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1c1c1e', letterSpacing: '-0.3px' }}>
            Facturación Audiovisual
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              border: '1.5px solid #007AFF',
              background: 'transparent',
              color: '#007AFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,122,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '8px 18px',
              borderRadius: 12,
              border: 'none',
              background: '#007AFF',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0062CC' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#007AFF' }}
          >
            Crear cuenta
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '96px 24px 80px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(0,122,255,0.1)',
          color: '#007AFF',
          borderRadius: 100,
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 28,
        }}>
          <Zap size={13} />
          Diseñado para productoras audiovisuales
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 62px)',
          fontWeight: 800,
          color: '#1c1c1e',
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: 24,
        }}>
          Gestiona tu productora,<br />
          <span style={{ color: '#007AFF' }}>sin complicaciones</span>
        </h1>

        <p style={{
          fontSize: 18,
          color: '#636366',
          lineHeight: 1.6,
          maxWidth: 560,
          margin: '0 auto 40px',
        }}>
          Facturación profesional, control de gastos y mapa de liquidez pensados
          específicamente para estudios y productoras audiovisuales en España.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 16,
              border: 'none',
              background: '#007AFF',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,122,255,0.35)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0062CC'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#007AFF'; e.currentTarget.style.transform = 'none' }}
          >
            Empezar gratis
            <ChevronRight size={18} />
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              borderRadius: 16,
              border: '1.5px solid rgba(0,0,0,0.12)',
              background: 'white',
              color: '#1c1c1e',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none' }}
          >
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 96px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {[
            {
              icon: <FileText size={22} color="#007AFF" />,
              title: 'Facturación profesional',
              desc: 'Crea y envía facturas con número automático, IVA, IRPF y líneas de servicios. Exporta en PDF en un clic.',
            },
            {
              icon: <Receipt size={22} color="#34C759" />,
              title: 'Control de gastos',
              desc: 'Registra proveedores, gastos con IVA deducible y lleva un registro claro para la declaración trimestral.',
            },
            {
              icon: <TrendingUp size={22} color="#FF9500" />,
              title: 'Mapa de liquidez',
              desc: 'Visualiza cobros pendientes, gastos proyectados y el flujo de caja de tu productora en tiempo real.',
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'saturate(180%) blur(20px)',
                WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                borderRadius: 22,
                padding: '28px 24px',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: 12,
                background: 'rgba(0,0,0,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                {card.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1c1c1e', marginBottom: 8, letterSpacing: '-0.3px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: 14, color: '#636366', lineHeight: 1.6 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Security badge */}
      <section style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '0 24px 80px',
        textAlign: 'center',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderRadius: 22,
          padding: '32px 24px',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        }}>
          <Shield size={32} color="#007AFF" style={{ marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1c1c1e', marginBottom: 8 }}>
            Tus datos son solo tuyos
          </h3>
          <p style={{ fontSize: 14, color: '#636366', lineHeight: 1.6 }}>
            Todo se almacena localmente en tu dispositivo. Sin servidores externos,
            sin suscripciones, sin que nadie acceda a tus datos financieros.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(0,0,0,0.06)',
        padding: '24px',
        textAlign: 'center',
        color: '#8e8e93',
        fontSize: 13,
      }}>
        <p>Facturación Audiovisual — Hecho para productoras españolas</p>
      </footer>
    </div>
  )
}
