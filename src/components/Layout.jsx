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
  { to: '/configuracion', icon: Settings, label: 'Config.' },
]

// Items shown in the mobile bottom bar (most used)
const mobileNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Inicio' },
  { to: '/facturas', icon: FileText, label: 'Facturas' },
  { to: '/presupuestos', icon: ClipboardList, label: 'Presup.' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/gastos', icon: Receipt, label: 'Gastos' },
]

export default function Layout({ children, onOpenSearch, collapsed, setCollapsed }) {
  const { state } = useApp()
  const { dark, toggle } = useTheme()
  const location = useLocation()

  const currentPage = navItems.find(item =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">

      {/* ── Desktop Sidebar ── */}
      <aside
        aria-label="Navegación principal"
        className={`
          ${collapsed ? 'w-16' : 'w-56'}
          hidden lg:flex flex-col flex-shrink-0
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-200 ease-in-out
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-gray-200 dark:border-gray-700 px-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Film size={16} className="text-white" aria-hidden="true" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm truncate">
                {state.company.name.split(' ')[0]}
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Film size={16} className="text-white" aria-hidden="true" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Secciones">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? label : undefined}
              aria-label={label}
            >
              <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
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

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header */}
        <header className="h-14 lg:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
                <Film size={14} className="text-white" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
              {currentPage?.label || 'Facturación'}
            </h1>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            {/* Search button */}
            <button
              onClick={onOpenSearch}
              aria-label="Abrir buscador"
              className="flex items-center gap-2 px-2 lg:px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Search size={14} aria-hidden="true" />
              <span className="hidden sm:inline text-xs">Buscar</span>
              <kbd className="hidden md:inline text-xs bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded px-1.5 py-0.5">⌘K</kbd>
            </button>

            <NotificationPanel />

            {/* Dark mode */}
            <button
              onClick={toggle}
              aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
              className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {dark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
            </button>

            <div
              className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold"
              role="img"
              aria-label={`Avatar de ${state.company.name}`}
            >
              {state.company.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content — extra bottom padding on mobile for the bottom nav */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 pb-20 lg:pb-6"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom navigation ── */}
      <nav
        aria-label="Navegación inferior"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex"
      >
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors min-h-[56px]
              ${isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400'
              }
            `}
            aria-label={label}
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 flex items-center justify-center rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className="leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
