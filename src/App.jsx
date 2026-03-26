import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/Invoices'
import Quotes from './pages/Quotes'
import Expenses from './pages/Expenses'
import Clients from './pages/Clients'
import Services from './pages/Services'
import Settings from './pages/Settings'

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
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
      </BrowserRouter>
    </AppProvider>
  )
}

export default App
