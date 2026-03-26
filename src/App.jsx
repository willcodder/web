import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import GlobalSearch from './components/GlobalSearch'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Quotes from './pages/Quotes'
import Expenses from './pages/Expenses'
import Clients from './pages/Clients'
import Services from './pages/Services'
import Settings from './pages/Settings'

function AppInner() {
  const [searchOpen, setSearchOpen] = useState(false)

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
      <Layout onOpenSearch={() => setSearchOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/facturas" element={<Invoices />} />
          <Route path="/presupuestos" element={<Quotes />} />
          <Route path="/gastos" element={<Expenses />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/configuracion" element={<Settings />} />
        </Routes>
      </Layout>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}

export default App
