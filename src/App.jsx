import { useState, useEffect, lazy, Suspense, Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import GlobalSearch from './components/GlobalSearch'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import { getCurrentUser, clearSession } from './utils/auth'

// Code-split pages — only loaded when visited
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Invoices  = lazy(() => import('./pages/Invoices'))
const Quotes    = lazy(() => import('./pages/Quotes'))
const Expenses  = lazy(() => import('./pages/Expenses'))
const Clients   = lazy(() => import('./pages/Clients'))
const Services  = lazy(() => import('./pages/Services'))
const Settings  = lazy(() => import('./pages/Settings'))

// Catch React render errors and show them instead of blank page
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(err) { return { error: err } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'system-ui', background: '#ffffff', minHeight: '100vh', color: '#1c1c1e' }}>
          <h2 style={{ color: '#FF3B30', marginBottom: 8 }}>Algo ha fallado</h2>
          <pre style={{ background: '#f2f2f7', color: '#1c1c1e', padding: 16, borderRadius: 12, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: 300, overflow: 'auto' }}>
            {String(this.state.error?.message || this.state.error || 'Error desconocido')}
            {'\n\n'}
            {String(this.state.error?.stack || '')}
          </pre>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload() }}
            style={{ marginTop: 16, padding: '10px 20px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}
          >
            Recargar
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48" role="status" aria-label="Cargando página">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" aria-hidden="true" />
    </div>
  )
}

function AppInner({ onLock }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [collapsed, setCollapsed]   = useState(false)

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Layout onOpenSearch={() => setSearchOpen(true)} collapsed={collapsed} setCollapsed={setCollapsed} onLock={onLock}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/facturas"      element={<Invoices />} />
            <Route path="/presupuestos"  element={<Quotes />} />
            <Route path="/gastos"        element={<Expenses />} />
            <Route path="/clientes"      element={<Clients />} />
            <Route path="/servicios"     element={<Services />} />
            <Route path="/configuracion" element={<Settings />} />
          </Routes>
        </Suspense>
      </Layout>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function ProtectedApp({ user, onLock }) {
  if (!user) return <Navigate to="/login" replace />

  return (
    <AppProvider userId={user.id}>
      <AppInner onLock={onLock} />
    </AppProvider>
  )
}

export default function App() {
  const [user, setUser] = useState(() => getCurrentUser())

  function handleLogin(u) { setUser(u) }
  function handleLock()   { clearSession(); setUser(null) }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter basename="/web">
          <Routes>
            <Route path="/"                element={<Landing />} />
            <Route path="/login"           element={<Login onLogin={handleLogin} />} />
            <Route path="/register"        element={<Register onLogin={handleLogin} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/app/*"           element={<ProtectedApp user={user} onLock={handleLock} />} />
            {/* Catch-all redirect */}
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
