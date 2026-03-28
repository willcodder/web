import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, TrendingUp, Clock, AlertCircle, ArrowRight, Users, Receipt, ChevronRight } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { calcDocumentTotals, formatCurrency, formatDate, STATUS_LABELS } from '../utils/calculations'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Apple system colors for charts
const CHART_COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA']

export default function Dashboard() {
  const { state } = useApp()
  const { dark } = useTheme()
  const { invoices, clients, expenses, quotes } = state

  const stats = useMemo(() => {
    const paidInvoices    = invoices.filter(i => i.status === 'paid')
    const pendingInvoices = invoices.filter(i => i.status === 'pending')
    const overdueInvoices = pendingInvoices.filter(i => new Date(i.dueDate) < new Date())
    const totalBilled     = invoices.filter(i => i.status !== 'draft').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
    const totalPaid       = paidInvoices.reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
    const totalPending    = pendingInvoices.reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
    const totalExpenses   = expenses.reduce((s, e) => s + e.amount * (1 + e.tax / 100), 0)
    return { totalBilled, totalPaid, totalPending, totalExpenses, overdueInvoices, pendingInvoices }
  }, [invoices, expenses])

  const monthlyData = useMemo(() => {
    const data = MONTHS.map(month => ({ month, facturado: 0, cobrado: 0 }))
    invoices.forEach(inv => {
      const m     = new Date(inv.date).getMonth()
      const total = calcDocumentTotals(inv.lines).total
      if (inv.status !== 'draft') data[m].facturado += total
      if (inv.status === 'paid')  data[m].cobrado   += total
    })
    return data.slice(0, new Date().getMonth() + 1)
  }, [invoices])

  const pieData = useMemo(() => {
    const groups = {}
    invoices.forEach(inv => {
      const s = inv.status === 'pending' && new Date(inv.dueDate) < new Date() ? 'overdue' : inv.status
      groups[s] = (groups[s] || 0) + 1
    })
    return Object.entries(groups).filter(([, v]) => v > 0).map(([key, value]) => ({
      name: STATUS_LABELS[key], value, key
    }))
  }, [invoices])

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const getClient = id => clients.find(c => c.id === id)

  // Chart theme
  const textColor   = dark ? '#636366' : '#8E8E93'
  const gridColor   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const tooltipBg   = dark ? '#2C2C2E' : '#FFFFFF'
  const tooltipBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
  const tooltipStyle  = {
    backgroundColor: tooltipBg,
    border: `1px solid ${tooltipBorder}`,
    borderRadius: 12,
    color: dark ? '#F2F2F7' : '#1C1C1E',
    fontSize: 12,
    boxShadow: dark
      ? '0 4px 16px rgba(0,0,0,0.4)'
      : '0 4px 16px rgba(0,0,0,0.1)',
    padding: '8px 12px',
  }

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = state.company.name.split(' ')[0]

  return (
    <div className="space-y-5 animate-slide-in">

      {/* ── Greeting header ── */}
      <div className="pt-1 pb-2">
        <h2 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
          {greeting}, {firstName}
        </h2>
        <p className="text-[14px] text-gray-400 dark:text-[#636366] mt-0.5">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Facturado"
          value={formatCurrency(stats.totalBilled)}
          subtitle={`${invoices.filter(i => i.status !== 'draft').length} facturas`}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Cobrado"
          value={formatCurrency(stats.totalPaid)}
          subtitle={`${invoices.filter(i => i.status === 'paid').length} cobradas`}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Pendiente"
          value={formatCurrency(stats.totalPending)}
          subtitle={`${stats.pendingInvoices.length} pendientes`}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Gastos"
          value={formatCurrency(stats.totalExpenses)}
          subtitle={`Margen ${formatCurrency(stats.totalPaid - stats.totalExpenses)}`}
          icon={Receipt}
          color="red"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
                Facturación mensual
              </h3>
              <p className="text-[12px] text-gray-400 dark:text-[#636366] mt-0.5">Este año</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-[#636366]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#007AFF]" />
                Facturado
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                Cobrado
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#007AFF" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#34C759" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: textColor }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={v => [formatCurrency(v), '']}
                contentStyle={tooltipStyle}
                cursor={{ stroke: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="facturado"
                stroke="#007AFF"
                fill="url(#gF)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#007AFF', strokeWidth: 0 }}
                name="Facturado"
              />
              <Area
                type="monotone"
                dataKey="cobrado"
                stroke="#34C759"
                fill="url(#gC)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#34C759', strokeWidth: 0 }}
                name="Cobrado"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1">
            Estado
          </h3>
          <p className="text-[12px] text-gray-400 dark:text-[#636366] mb-3">Distribución de facturas</p>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="42%"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={entry.key} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend
                formatter={v => (
                  <span style={{ fontSize: 11, color: textColor }}>{v}</span>
                )}
                iconSize={7}
                iconType="circle"
              />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent invoices */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
              Facturas recientes
            </h3>
            <Link
              to="/facturas"
              className="flex items-center gap-0.5 text-[13px] text-[#007AFF] font-medium hover:opacity-70 transition-opacity"
            >
              Ver todas
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {recentInvoices.map(inv => {
              const client = getClient(inv.clientId)
              const total  = calcDocumentTotals(inv.lines).total
              return (
                <Link
                  key={inv.id}
                  to={`/facturas`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F2F2F7] dark:hover:bg-[#2C2C2E] transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-gray-900 dark:text-white truncate leading-snug">
                      {client?.name || 'Cliente desconocido'}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-[#636366] mt-0.5">
                      {inv.number} · {formatDate(inv.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <Badge status={inv.status} />
                    <span className="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums">
                      {formatCurrency(total)}
                    </span>
                    <ChevronRight size={13} className="text-gray-300 dark:text-[#3A3A3C] group-hover:text-gray-400 transition-colors" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight mb-4">
            Alertas
          </h3>
          <div className="space-y-2.5">
            {stats.overdueInvoices.length > 0 && (
              <Link
                to="/facturas"
                className="flex items-center gap-3.5 p-3.5 bg-[#FF3B30]/[0.07] dark:bg-[#FF3B30]/[0.1] rounded-xl hover:bg-[#FF3B30]/[0.12] dark:hover:bg-[#FF3B30]/[0.16] transition-colors group"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[#FF3B30] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#c0281f] dark:text-[#ff453a] leading-snug">
                    {stats.overdueInvoices.length} factura{stats.overdueInvoices.length > 1 ? 's' : ''} vencida{stats.overdueInvoices.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-[#FF3B30]/80 mt-0.5">Requieren atención inmediata</p>
                </div>
                <ChevronRight size={14} className="text-[#FF3B30]/50 group-hover:text-[#FF3B30] transition-colors" />
              </Link>
            )}

            {quotes.filter(q => q.status === 'pending').length > 0 && (
              <Link
                to="/presupuestos"
                className="flex items-center gap-3.5 p-3.5 bg-[#FF9500]/[0.07] dark:bg-[#FF9500]/[0.1] rounded-xl hover:bg-[#FF9500]/[0.12] dark:hover:bg-[#FF9500]/[0.16] transition-colors group"
              >
                <div className="w-8 h-8 rounded-[10px] bg-[#FF9500] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#c97200] dark:text-[#ff9f0a] leading-snug">
                    {quotes.filter(q => q.status === 'pending').length} presupuesto{quotes.filter(q => q.status === 'pending').length > 1 ? 's' : ''} pendiente{quotes.filter(q => q.status === 'pending').length > 1 ? 's' : ''}
                  </p>
                  <p className="text-[11px] text-[#FF9500]/80 mt-0.5">Esperando respuesta del cliente</p>
                </div>
                <ChevronRight size={14} className="text-[#FF9500]/50 group-hover:text-[#FF9500] transition-colors" />
              </Link>
            )}

            <div className="flex items-center gap-3.5 p-3.5 bg-[#007AFF]/[0.06] dark:bg-[#007AFF]/[0.08] rounded-xl">
              <div className="w-8 h-8 rounded-[10px] bg-[#007AFF] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Users size={15} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#0062cc] dark:text-[#409cff] leading-snug">
                  {clients.length} clientes activos
                </p>
                <p className="text-[11px] text-[#007AFF]/70 mt-0.5">En tu cartera</p>
              </div>
            </div>

            {stats.overdueInvoices.length === 0 && quotes.filter(q => q.status === 'pending').length === 0 && (
              <p className="text-[13px] text-gray-400 dark:text-[#636366] text-center py-4">
                ✓ Todo al día. ¡Buen trabajo!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
