import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, FileText, ClipboardList,
  Receipt, Settings, ChevronLeft, ChevronRight, Film,
  Sun, Moon, Search, Lock
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import NotificationPanel from './NotificationPanel'

const navItems = [
  { to: '/app/',              icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/facturas',      icon: FileText,        label: 'Facturas' },
  { to: '/app/presupuestos',  icon: ClipboardList,   label: 'Presupuestos' },
  { to: '/app/gastos',        icon: Receipt,         label: 'Gastos' },
  { to: '/app/clientes',      icon: Users,           label: 'Clientes' },
  { to: '/app/servicios',     icon: Package,         label: 'Servicios' },
  { to: '/app/configuracion', icon: Settings,        label: 'Ajustes' },
]

const mobileNavItems = [
  { to: '/app/',             icon: LayoutDashboard, label: 'Inicio' },
  { to: '/app/facturas',     icon: FileText,        label: 'Facturas' },
  { to: '/app/presupuestos', icon: ClipboardList,   label: 'Presup.' },
  { to: '/app/clientes',     icon: Users,           label: 'Clientes' },
  { to: '/app/gastos',       icon: Receipt,         label: 'Gastos' },
]

export default function Layout({ children, onOpenSearch, collapsed, setCollapsed, onLock }) {
  const { state } = useApp()
  const { dark, toggle } = useTheme()
  const location = useLocation()

  const currentPage = navItems.find(item =>
    item.to === '/app/' ? location.pathname === '/app/' || location.pathname === '/app' : location.pathname.startsWith(item.to)
  )

  const initial = state.company.name.charAt(0).toUpperCase()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F2F2F7] dark:bg-black">

      {/* ── Desktop Sidebar ── */}
      <aside
        aria-label="Navegación principal"
        className={`
          ${collapsed ? 'w-[72px]' : 'w-[240px]'}
          hidden lg:flex flex-col flex-shrink-0
          shadow-sidebar relative z-10
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
        `}
        style={{
          background: dark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.82)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        {/* Logo area */}
        <div className={`
          flex items-center h-[60px] px-4
          border-b border-black/[0.06] dark:border-white/[0.06]
          ${collapsed ? 'justify-center' : 'justify-between'}
        `}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
              >
                <Film size={15} className="text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight tracking-tight">
                  {state.company.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">
                  Productora
                </p>
              </div>
            </div>
          )}
          {collapsed && (
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
            >
              <Film size={15} className="text-white" aria-hidden="true" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors flex-shrink-0"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={13} />}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-0.5" aria-label="Secciones">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/app/'}
              title={collapsed ? label : undefined}
              aria-label={label}
              className={({ isActive }) => `
                flex items-center gap-3 py-[9px] rounded-xl text-[13px] font-medium
                transition-all duration-150 select-none
                ${collapsed ? 'justify-center px-0' : 'px-3'}
                ${isActive
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon size={17} className="flex-shrink-0" aria-hidden="true" />
              {!collapsed && <span className="leading-none">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Company footer */}
        {!collapsed && (
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.06]">
            <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate">{state.company.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">{state.company.email}</p>
          </div>
        )}
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top header — frosted glass */}
        <header
          className="h-[56px] lg:h-[60px] flex items-center justify-between px-4 lg:px-6 flex-shrink-0 border-b border-black/[0.06] dark:border-white/[0.05]"
          style={{
            background: dark ? 'rgba(0,0,0,0.85)' : 'rgba(242,242,247,0.88)',
            backdropFilter: 'saturate(180%) blur(20px)',
            WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="flex lg:hidden">
              <div
                className="w-7 h-7 rounded-[9px] flex items-center justify-center"
                style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
              >
                <Film size={13} className="text-white" aria-hidden="true" />
              </div>
            </div>
            <h1 className="text-[17px] font-semibold text-gray-900 dark:text-white tracking-tight truncate">
              {currentPage?.label || 'Facturación'}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Search pill */}
            <button
              onClick={onOpenSearch}
              aria-label="Abrir buscador"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] text-gray-500 dark:text-gray-400 bg-black/[0.05] dark:bg-white/[0.07] hover:bg-black/[0.08] dark:hover:bg-white/[0.11] transition-colors"
            >
              <Search size={13} aria-hidden="true" />
              <span className="hidden sm:inline">Buscar</span>
              <kbd className="hidden md:inline text-[10px] bg-white/80 dark:bg-white/10 rounded-md px-1.5 py-0.5">⌘K</kbd>
            </button>

            <NotificationPanel />

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={dark ? 'Modo claro' : 'Modo oscuro'}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
            >
              {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
            </button>

            {/* Lock button */}
            <button
              onClick={onLock}
              aria-label="Bloquear aplicación"
              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
              title="Bloquear"
            >
              <Lock size={15} aria-hidden="true" />
            </button>

            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px] font-bold select-none"
              style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
              role="img"
              aria-label={`Avatar de ${state.company.name}`}
            >
              {initial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-8"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        aria-label="Navegación inferior"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-black/[0.08] dark:border-white/[0.06]"
        style={{
          background: dark ? 'rgba(28,28,30,0.95)' : 'rgba(255,255,255,0.95)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app/'}
            aria-label={label}
            className={({ isActive }) => `
              flex-1 flex flex-col items-center justify-center pt-2 pb-3 gap-0.5
              text-[10px] font-medium transition-colors min-h-[56px]
              ${isActive ? 'text-[#007AFF]' : 'text-gray-400 dark:text-gray-500'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className={`
                  w-9 h-7 flex items-center justify-center rounded-xl
                  transition-all duration-150
                  ${isActive ? 'bg-[#007AFF]/10 dark:bg-[#007AFF]/15' : ''}
                `}>
                  <Icon size={19} aria-hidden="true" />
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
