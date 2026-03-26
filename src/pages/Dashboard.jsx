import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FileText, TrendingUp, Clock, AlertCircle, ArrowRight, Users, Receipt } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useApp } from '../context/AppContext'
import { calcDocumentTotals, formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '../utils/calculations'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const COLORS = ['#6172f3', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const { state } = useApp()
  const { invoices, clients, expenses, quotes } = state

  const stats = useMemo(() => {
    const paidInvoices = invoices.filter(i => i.status === 'paid')
    const pendingInvoices = invoices.filter(i => i.status === 'pending')
    const overdueInvoices = invoices.filter(i => {
      return i.status === 'pending' && new Date(i.dueDate) < new Date()
    })

    const totalBilled = invoices
      .filter(i => i.status !== 'draft')
      .reduce((sum, inv) => sum + calcDocumentTotals(inv.lines).total, 0)

    const totalPaid = paidInvoices.reduce((sum, inv) => sum + calcDocumentTotals(inv.lines).total, 0)
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + calcDocumentTotals(inv.lines).total, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount * (1 + e.tax / 100), 0)

    return { totalBilled, totalPaid, totalPending, totalExpenses, overdueInvoices, pendingInvoices }
  }, [invoices, expenses])

  // Monthly revenue data
  const monthlyData = useMemo(() => {
    const data = MONTHS.map((month, idx) => ({
      month,
      facturado: 0,
      cobrado: 0,
      gastos: 0,
    }))

    invoices.forEach(inv => {
      const month = new Date(inv.date).getMonth()
      const totals = calcDocumentTotals(inv.lines)
      if (inv.status !== 'draft') data[month].facturado += totals.total
      if (inv.status === 'paid') data[month].cobrado += totals.total
    })

    expenses.forEach(exp => {
      const month = new Date(exp.date).getMonth()
      data[month].gastos += exp.amount * (1 + exp.tax / 100)
    })

    return data.slice(0, new Date().getMonth() + 1)
  }, [invoices, expenses])

  // Invoice status pie
  const pieData = useMemo(() => {
    const groups = { draft: 0, pending: 0, paid: 0, overdue: 0 }
    invoices.forEach(inv => {
      const status = inv.status === 'pending' && new Date(inv.dueDate) < new Date() ? 'overdue' : inv.status
      groups[status] = (groups[status] || 0) + 1
    })
    return Object.entries(groups)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ name: STATUS_LABELS[key], value, key }))
  }, [invoices])

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  const getClient = (clientId) => clients.find(c => c.id === clientId)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Facturado"
          value={formatCurrency(stats.totalBilled)}
          subtitle={`${invoices.filter(i => i.status !== 'draft').length} facturas emitidas`}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          title="Cobrado"
          value={formatCurrency(stats.totalPaid)}
          subtitle={`${invoices.filter(i => i.status === 'paid').length} facturas cobradas`}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="Pendiente de Cobro"
          value={formatCurrency(stats.totalPending)}
          subtitle={`${stats.pendingInvoices.length} facturas pendientes`}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Total Gastos"
          value={formatCurrency(stats.totalExpenses)}
          subtitle={`Margen: ${formatCurrency(stats.totalPaid - stats.totalExpenses)}`}
          icon={Receipt}
          color="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Facturación mensual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorFacturado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6172f3" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6172f3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCobrado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="facturado" stroke="#6172f3" fill="url(#colorFacturado)" name="Facturado" strokeWidth={2} />
              <Area type="monotone" dataKey="cobrado" stroke="#22c55e" fill="url(#colorCobrado)" name="Cobrado" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Estado de facturas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent invoices */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Facturas recientes</h3>
            <Link to="/facturas" className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentInvoices.map(inv => {
              const client = getClient(inv.clientId)
              const totals = calcDocumentTotals(inv.lines)
              return (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client?.name || 'Cliente desconocido'}</p>
                    <p className="text-xs text-gray-400">{inv.number} · {formatDate(inv.date)}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <Badge status={inv.status} />
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Alertas y pendientes</h3>
          <div className="space-y-3">
            {stats.overdueInvoices.length > 0 && (
              <Link to="/facturas" className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {stats.overdueInvoices.length} factura{stats.overdueInvoices.length > 1 ? 's' : ''} vencida{stats.overdueInvoices.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">Requieren atención inmediata</p>
                </div>
              </Link>
            )}
            {quotes.filter(q => q.status === 'pending').length > 0 && (
              <Link to="/presupuestos" className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {quotes.filter(q => q.status === 'pending').length} presupuesto{quotes.filter(q => q.status === 'pending').length > 1 ? 's' : ''} pendiente{quotes.filter(q => q.status === 'pending').length > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-yellow-600">Esperando respuesta del cliente</p>
                </div>
              </Link>
            )}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">{clients.length} clientes activos</p>
                <p className="text-xs text-blue-600">En tu cartera de clientes</p>
              </div>
            </div>
            {stats.overdueInvoices.length === 0 && quotes.filter(q => q.status === 'pending').length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Todo al día. ¡Buen trabajo!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
