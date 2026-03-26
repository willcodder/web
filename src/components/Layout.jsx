import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, FileText, ClipboardList,
  Receipt, Settings, ChevronLeft, ChevronRight, Film, Menu, Sun, Moon, Search
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import NotificationPanel from './NotificationPanel'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/facturas', icon: FileText, label: 'Facturas' },
  { to: '/presupuestos', icon: ClipboardList, label: 'Presupuestos' },
  { to: '/gastos', icon: Receipt, label: 'Gastos' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/servicios', icon: Package, label: 'Servicios' },
  { to: '/configuracion', icon: Settings, label: 'Configuración' },
]

export default function Layout({ children, onOpenSearch }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { state } = useApp()
  const { dark, toggle } = useTheme()
  const location = useLocation()

  const currentPage = navItems.find(item =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        ${collapsed ? 'w-16' : 'w-56'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative inset-y-0 left-0 z-30
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        flex flex-col transition-all duration-200 ease-in-out flex-shrink-0
      `}>
        <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Film size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight">
                {state.company.name.split(' ')[0]}
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Film size={16} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{state.company.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{state.company.email}</p>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white" onClick={() => setMobileOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{currentPage?.label || 'Facturación'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Search size={14} />
              <span className="hidden sm:inline text-xs">Buscar</span>
              <kbd className="hidden sm:inline text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-1.5 py-0.5">⌘K</kbd>
            </button>

            <NotificationPanel />

            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              title={dark ? 'Modo claro' : 'Modo oscuro'}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {state.company.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  )
}
