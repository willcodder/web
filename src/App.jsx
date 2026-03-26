import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import GlobalSearch from './components/GlobalSearch'

// Code-split pages — only loaded when visited
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Invoices = lazy(() => import('./pages/Invoices'))
const Quotes = lazy(() => import('./pages/Quotes'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Clients = lazy(() => import('./pages/Clients'))
const Services = lazy(() => import('./pages/Services'))
const Settings = lazy(() => import('./pages/Settings'))

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-48" role="status" aria-label="Cargando página">
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" aria-hidden="true" />
    </div>
  )
}

function AppInner() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

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
      <Layout onOpenSearch={() => setSearchOpen(true)} collapsed={collapsed} setCollapsed={setCollapsed}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/facturas" element={<Invoices />} />
            <Route path="/presupuestos" element={<Quotes />} />
            <Route path="/gastos" element={<Expenses />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/configuracion" element={<Settings />} />
          </Routes>
        </Suspense>
      </Layout>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter basename="/web">
          <AppInner />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}
