import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Users, Euro, Award, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
} from 'recharts'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import { calcDocumentTotals, formatCurrency } from '../utils/calculations'

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const COLORS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5AC8FA', '#FF2D55', '#FFCC00']
const THIS_YEAR = new Date().getFullYear()

function SectionTitle({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{children}</h2>
      {sub && <p className="text-[12px] text-gray-400 dark:text-[#636366] mt-0.5">{sub}</p>}
    </div>
  )
}

function KpiCard({ label, value, sub, color = '#007AFF', icon: Icon, trend }) {
  const positive = trend >= 0
  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-[12px] font-medium text-gray-400 dark:text-[#8E8E93] uppercase tracking-wide">{label}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{ background: color + '22' }}>
            <Icon size={15} style={{ color }} />
          </div>
        )}
      </div>
      <p className="text-[24px] font-bold text-gray-900 dark:text-white tabular-nums leading-none mb-1">{value}</p>
      {sub && <p className="text-[11px] text-gray-400 dark:text-[#636366]">{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-[11px] font-semibold ${positive ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {positive ? '+' : ''}{trend.toFixed(1)}% vs año anterior
        </div>
      )}
    </div>
  )
}

export default function Analytics() {
  const { state } = useApp()
  const { dark } = useTheme()
  const { invoices, clients, expenses } = state

  const [compareYear, setCompareYear] = useState(THIS_YEAR - 1)

  // Chart theme helpers
  const textColor     = dark ? '#636366' : '#8E8E93'
  const gridColor     = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  const tooltipStyle  = {
    backgroundColor: dark ? '#2C2C2E' : '#fff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
    borderRadius: 12,
    color: dark ? '#F2F2F7' : '#1C1C1E',
    fontSize: 12,
    padding: '8px 12px',
  }
  const axisProps = { tick: { fontSize: 11, fill: textColor }, axisLine: false, tickLine: false }

  // ── Años disponibles ─────────────────────────────────────────────────────
  const years = useMemo(() => {
    const ys = new Set(invoices.map(i => new Date(i.date).getFullYear()))
    return [...ys].sort((a, b) => b - a)
  }, [invoices])

  // ── KPIs año actual vs anterior ──────────────────────────────────────────
  const kpis = useMemo(() => {
    const byYear = (y) => {
      const inv = invoices.filter(i => new Date(i.date).getFullYear() === y)
      const exp = expenses.filter(e => new Date(e.date).getFullYear() === y)
      const billed  = inv.filter(i => i.status !== 'draft').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
      const paid    = inv.filter(i => i.status === 'paid').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
      const expTotal = exp.reduce((s, e) => s + e.amount * (1 + e.tax / 100), 0)
      return { billed, paid, exp: expTotal, count: inv.filter(i => i.status !== 'draft').length }
    }
    const cur  = byYear(THIS_YEAR)
    const prev = byYear(THIS_YEAR - 1)
    const pct  = (a, b) => b === 0 ? null : ((a - b) / b) * 100
    return {
      cur, prev,
      trendBilled:  pct(cur.billed, prev.billed),
      trendPaid:    pct(cur.paid, prev.paid),
      trendExp:     pct(cur.exp, prev.exp),
      cobro:        cur.billed > 0 ? (cur.paid / cur.billed) * 100 : 0,
    }
  }, [invoices, expenses])

  // ── Comparativa mensual año X vs año Y ──────────────────────────────────
  const monthlyCompare = useMemo(() => {
    return MONTHS_SHORT.map((month, m) => {
      const sumYear = (y) => invoices
        .filter(i => new Date(i.date).getFullYear() === y && new Date(i.date).getMonth() === m && i.status !== 'draft')
        .reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
      return { month, [THIS_YEAR]: sumYear(THIS_YEAR), [compareYear]: sumYear(compareYear) }
    })
  }, [invoices, compareYear])

  // ── Top clientes por facturación ─────────────────────────────────────────
  const topClients = useMemo(() => {
    const map = {}
    invoices.filter(i => i.status !== 'draft').forEach(inv => {
      const total = calcDocumentTotals(inv.lines).total
      map[inv.clientId] = (map[inv.clientId] || 0) + total
    })
    return Object.entries(map)
      .map(([id, total]) => ({
        name: clients.find(c => c.id === id)?.name || 'Desconocido',
        total,
        facturas: invoices.filter(i => i.clientId === id && i.status !== 'draft').length,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }, [invoices, clients])

  // ── Facturación trimestral multi-año ─────────────────────────────────────
  const quarterly = useMemo(() => {
    const showYears = years.slice(0, 3)
    return [1, 2, 3, 4].map(q => {
      const entry = { quarter: `T${q}` }
      showYears.forEach(y => {
        entry[y] = invoices
          .filter(i => {
            const d = new Date(i.date)
            return d.getFullYear() === y && Math.ceil((d.getMonth() + 1) / 3) === q && i.status !== 'draft'
          })
          .reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
      })
      return entry
    })
  }, [invoices, years])

  // ── Ingresos vs Gastos mes a mes (año actual) ────────────────────────────
  const ingrVsGasto = useMemo(() => {
    return MONTHS_SHORT.map((month, m) => {
      const ingr = invoices
        .filter(i => new Date(i.date).getFullYear() === THIS_YEAR && new Date(i.date).getMonth() === m && i.status !== 'draft')
        .reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0)
      const gasto = expenses
        .filter(e => new Date(e.date).getFullYear() === THIS_YEAR && new Date(e.date).getMonth() === m)
        .reduce((s, e) => s + e.amount * (1 + e.tax / 100), 0)
      return { month, Ingresos: ingr, Gastos: gasto, Margen: Math.max(0, ingr - gasto) }
    }).slice(0, new Date().getMonth() + 1)
  }, [invoices, expenses])

  // ── Distribución por categoría de servicio ───────────────────────────────
  const byCategory = useMemo(() => {
    const map = {}
    invoices.filter(i => i.status !== 'draft').forEach(inv => {
      inv.lines?.forEach(line => {
        const prod = state.products?.find(p => p.id === line.productId)
        const cat  = prod?.category || 'Otros'
        const sub  = (line.quantity ?? 0) * (line.price ?? line.unitPrice ?? 0)
        map[cat] = (map[cat] || 0) + sub
      })
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
  }, [invoices, state.products])

  // ── Tasa de cobro radial ─────────────────────────────────────────────────
  const cobroData = [{ name: 'Cobrado', value: Math.round(kpis.cobro), fill: '#34C759' }]

  const availableCompareYears = years.filter(y => y !== THIS_YEAR)

  return (
    <div className="space-y-8 animate-slide-in">

      {/* ── Header ── */}
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">Analítica</h1>
        <p className="text-[14px] text-gray-400 dark:text-[#636366] mt-0.5">Rendimiento de tu negocio · {THIS_YEAR}</p>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <KpiCard label="Facturado" value={formatCurrency(kpis.cur.billed)}
          sub={`${kpis.cur.count} facturas emitidas`} color="#007AFF" icon={Euro}
          trend={kpis.trendBilled} />
        <KpiCard label="Cobrado" value={formatCurrency(kpis.cur.paid)}
          sub={`Tasa cobro ${kpis.cobro.toFixed(0)}%`} color="#34C759" icon={TrendingUp}
          trend={kpis.trendPaid} />
        <KpiCard label="Gastos" value={formatCurrency(kpis.cur.exp)}
          sub={`Margen ${formatCurrency(kpis.cur.paid - kpis.cur.exp)}`} color="#FF3B30" icon={TrendingDown}
          trend={kpis.trendExp} />
        <KpiCard label="Clientes activos" value={clients.length}
          sub={`${topClients.length} con facturación`} color="#AF52DE" icon={Users} />
      </div>

      {/* ── Comparativa mensual ── */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <SectionTitle sub="Facturación mensual comparada">
            Comparativa mensual
          </SectionTitle>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400 dark:text-[#636366]">Comparar con</span>
            <select
              value={compareYear}
              onChange={e => setCompareYear(Number(e.target.value))}
              className="text-[13px] font-medium px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2C2C2E] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            >
              {availableCompareYears.length === 0
                ? <option value={THIS_YEAR - 1}>{THIS_YEAR - 1}</option>
                : availableCompareYears.map(y => <option key={y} value={y}>{y}</option>)
              }
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyCompare} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4} barSize={14}>
            <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
            <Legend formatter={v => <span style={{ fontSize: 11, color: textColor }}>{v}</span>} iconSize={8} iconType="circle" />
            <Bar dataKey={THIS_YEAR} name={String(THIS_YEAR)} fill="#007AFF" radius={[4, 4, 0, 0]} />
            <Bar dataKey={compareYear} name={String(compareYear)} fill="#007AFF" fillOpacity={0.3} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Top clientes + Categorías ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Top clientes */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
          <SectionTitle sub="Por volumen de facturación total acumulado">
            Top clientes
          </SectionTitle>
          {topClients.length === 0 ? (
            <p className="text-[13px] text-gray-400 dark:text-[#636366] py-8 text-center">Sin datos</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => {
                const pct = topClients[0].total > 0 ? (c.total / topClients[0].total) * 100 : 0
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                          style={{ background: COLORS[i % COLORS.length] }}
                        >{i + 1}</div>
                        {i === 0 && <Award size={12} className="text-[#FF9500] flex-shrink-0" />}
                        <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">{c.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <span className="text-[13px] font-semibold text-gray-900 dark:text-white tabular-nums">{formatCurrency(c.total)}</span>
                        <span className="text-[10px] text-gray-400 dark:text-[#636366] ml-1.5">{c.facturas} fact.</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.07] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Por categoría */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
          <SectionTitle sub="Base imponible por tipo de servicio">
            Por categoría de servicio
          </SectionTitle>
          {byCategory.length === 0 ? (
            <p className="text-[13px] text-gray-400 dark:text-[#636366] py-8 text-center">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={byCategory} cx="50%" cy="45%" innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
                <Legend formatter={v => <span style={{ fontSize: 11, color: textColor }}>{v}</span>} iconSize={7} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Ingresos vs Gastos ── */}
      <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
        <SectionTitle sub={`Ingresos facturados vs gastos por mes · ${THIS_YEAR}`}>
          Ingresos vs Gastos
        </SectionTitle>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={ingrVsGasto} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="gIngr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34C759" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#34C759" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gGasto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF3B30" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#FF3B30" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
            <Legend formatter={v => <span style={{ fontSize: 11, color: textColor }}>{v}</span>} iconSize={7} iconType="circle" />
            <Area type="monotone" dataKey="Ingresos" stroke="#34C759" fill="url(#gIngr)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            <Area type="monotone" dataKey="Gastos" stroke="#FF3B30" fill="url(#gGasto)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Evolución trimestral + Tasa cobro ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Trimestral */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5">
          <SectionTitle sub="Facturación por trimestre y año">
            Evolución trimestral
          </SectionTitle>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={quarterly} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barGap={4} barSize={18}>
              <CartesianGrid strokeDasharray="0" stroke={gridColor} vertical={false} />
              <XAxis dataKey="quarter" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={v => formatCurrency(v)} contentStyle={tooltipStyle} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: textColor }}>{v}</span>} iconSize={8} iconType="circle" />
              {years.slice(0, 3).map((y, i) => (
                <Bar key={y} dataKey={y} name={String(y)} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasa de cobro */}
        <div className="bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-5 flex flex-col items-center justify-center">
          <SectionTitle sub={`Sobre lo facturado en ${THIS_YEAR}`}>
            Tasa de cobro
          </SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
              data={[{ value: 100, fill: dark ? '#2C2C2E' : '#F2F2F7' }, ...cobroData]}
              startAngle={220} endAngle={-40}>
              <RadialBar dataKey="value" cornerRadius={6} background={false} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center -mt-4">
            <p className="text-[32px] font-bold text-gray-900 dark:text-white tabular-nums leading-none">{kpis.cobro.toFixed(0)}%</p>
            <p className="text-[12px] text-gray-400 dark:text-[#636366] mt-1">
              {formatCurrency(kpis.cur.paid)} cobrado de {formatCurrency(kpis.cur.billed)}
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
