import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, TrendingUp, Clock, AlertCircle, ArrowRight, Users, Receipt } from 'lucide-react'
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
const COLORS = ['#6172f3', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const { state } = useApp()
  const { dark } = useTheme()
  const { invoices, clients, expenses, quotes } = state

  const stats = useMemo(() => {
    const paidInvoices = invoices.filter(i => i.status === 'paid')
    const pendingInvoices = invoices.filter(i => i.status === 'pending')
    const overdueInvoices = pendingInvoices.filter(i => new Date(i.dueDate) < new Date())
    const totalBilled = invoices.filter(i => i.status !== 'draft').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
    const totalPaid = paidInvoices.reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
    const totalPending = pendingInvoices.reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
    const totalExpenses = expenses.reduce((s, e) => s + e.amount * (1 + e.tax / 100), 0)
    return { totalBilled, totalPaid, totalPending, totalExpenses, overdueInvoices, pendingInvoices }
  }, [invoices, expenses])

  const monthlyData = useMemo(() => {
    const data = MONTHS.map(month => ({ month, facturado: 0, cobrado: 0 }))
    invoices.forEach(inv => {
      const m = new Date(inv.date).getMonth()
      const total = calcDocumentTotals(inv.lines).total
      if (inv.status !== 'draft') data[m].facturado += total
      if (inv.status === 'paid') data[m].cobrado += total
    })
    return data.slice(0, new Date().getMonth() + 1)
  }, [invoices])

  const pieData = useMemo(() => {
    const groups = {}
    invoices.forEach(inv => {
      const s = inv.status === 'pending' && new Date(inv.dueDate) < new Date() ? 'overdue' : inv.status
      groups[s] = (groups[s] || 0) + 1
    })
    return Object.entries(groups).filter(([, v]) => v > 0).map(([key, value]) => ({ name: STATUS_LABELS[key], value, key }))
  }, [invoices])

  const recentInvoices = [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
  const getClient = id => clients.find(c => c.id === id)

  const chartTextColor = dark ? '#9ca3af' : '#6b7280'
  const gridColor = dark ? '#374151' : '#f0f0f0'
  const tooltipStyle = dark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#f9fafb' }
    : { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }

  const cardCls = "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Facturado" value={formatCurrency(stats.totalBilled)} subtitle={`${invoices.filter(i => i.status !== 'draft').length} facturas emitidas`} icon={TrendingUp} color="primary" />
        <StatCard title="Cobrado" value={formatCurrency(stats.totalPaid)} subtitle={`${invoices.filter(i => i.status === 'paid').length} facturas cobradas`} icon={FileText} color="green" />
        <StatCard title="Pendiente de Cobro" value={formatCurrency(stats.totalPending)} subtitle={`${stats.pendingInvoices.length} facturas pendientes`} icon={Clock} color="yellow" />
        <StatCard title="Total Gastos" value={formatCurrency(stats.totalExpenses)} subtitle={`Margen: ${formatCurrency(stats.totalPaid - stats.totalExpenses)}`} icon={Receipt} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardCls}`}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Facturación mensual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6172f3" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6172f3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: chartTextColor }} />
              <YAxis tick={{ fontSize: 12, fill: chartTextColor }} tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="facturado" stroke="#6172f3" fill="url(#gF)" name="Facturado" strokeWidth={2} />
              <Area type="monotone" dataKey="cobrado" stroke="#22c55e" fill="url(#gC)" name="Cobrado" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={cardCls}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Estado de facturas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={entry.key} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend formatter={v => <span style={{ fontSize: 12, color: chartTextColor }}>{v}</span>} />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Facturas recientes</h3>
            <Link to="/facturas" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.map(inv => {
              const client = getClient(inv.clientId)
              const total = calcDocumentTotals(inv.lines).total
              return (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{client?.name || 'Cliente desconocido'}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{inv.number} · {formatDate(inv.date)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <Badge status={inv.status} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={cardCls}>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Alertas y pendientes</h3>
          <div className="space-y-3">
            {stats.overdueInvoices.length > 0 && (
              <Link to="/facturas" className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">{stats.overdueInvoices.length} factura{stats.overdueInvoices.length > 1 ? 's' : ''} vencida{stats.overdueInvoices.length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Requieren atención inmediata</p>
                </div>
              </Link>
            )}
            {quotes.filter(q => q.status === 'pending').length > 0 && (
              <Link to="/presupuestos" className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">{quotes.filter(q => q.status === 'pending').length} presupuesto{quotes.filter(q => q.status === 'pending').length > 1 ? 's' : ''} pendiente{quotes.filter(q => q.status === 'pending').length > 1 ? 's' : ''}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Esperando respuesta del cliente</p>
                </div>
              </Link>
            )}
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{clients.length} clientes activos</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">En tu cartera de clientes</p>
              </div>
            </div>
            {stats.overdueInvoices.length === 0 && quotes.filter(q => q.status === 'pending').length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">Todo al día. ¡Buen trabajo!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
