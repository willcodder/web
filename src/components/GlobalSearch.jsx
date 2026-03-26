import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, Users, Receipt, ClipboardList, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate, calcDocumentTotals } from '../utils/calculations'

export default function GlobalSearch({ open, onClose }) {
  const { state } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef()

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? onClose() : null
      }
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const q = query.toLowerCase().trim()

  const results = q.length < 1 ? [] : [
    ...state.invoices
      .filter(inv => {
        const client = state.clients.find(c => c.id === inv.clientId)
        return [inv.number, client?.name].some(v => v?.toLowerCase().includes(q))
      })
      .slice(0, 4)
      .map(inv => {
        const client = state.clients.find(c => c.id === inv.clientId)
        const total = calcDocumentTotals(inv.lines).total
        return {
          type: 'invoice', id: inv.id, icon: FileText, color: 'text-primary-500',
          title: inv.number, subtitle: `${client?.name} · ${formatDate(inv.date)}`,
          right: formatCurrency(total),
          action: () => { navigate('/facturas'); onClose() },
        }
      }),
    ...state.quotes
      .filter(q2 => {
        const client = state.clients.find(c => c.id === q2.clientId)
        return [q2.number, client?.name].some(v => v?.toLowerCase().includes(q))
      })
      .slice(0, 3)
      .map(qt => {
        const client = state.clients.find(c => c.id === qt.clientId)
        return {
          type: 'quote', id: qt.id, icon: ClipboardList, color: 'text-yellow-500',
          title: qt.number, subtitle: `${client?.name} · ${formatDate(qt.date)}`,
          right: formatCurrency(calcDocumentTotals(qt.lines).total),
          action: () => { navigate('/presupuestos'); onClose() },
        }
      }),
    ...state.clients
      .filter(c => [c.name, c.email, c.cif].some(v => v?.toLowerCase().includes(q)))
      .slice(0, 3)
      .map(c => ({
        type: 'client', id: c.id, icon: Users, color: 'text-green-500',
        title: c.name, subtitle: c.email,
        right: c.cif,
        action: () => { navigate('/clientes'); onClose() },
      })),
    ...state.expenses
      .filter(e => [e.description, e.provider, e.category].some(v => v?.toLowerCase().includes(q)))
      .slice(0, 3)
      .map(e => ({
        type: 'expense', id: e.id, icon: Receipt, color: 'text-red-500',
        title: e.description, subtitle: `${e.provider} · ${formatDate(e.date)}`,
        right: formatCurrency(e.amount),
        action: () => { navigate('/gastos'); onClose() },
      })),
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar facturas, clientes, gastos..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {q.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Escribe para buscar en toda la aplicación
            </div>
          )}
          {q.length > 0 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No se encontraron resultados para "{query}"
            </div>
          )}
          {results.length > 0 && (
            <div className="py-2">
              {['invoice', 'quote', 'client', 'expense'].map(type => {
                const group = results.filter(r => r.type === type)
                if (!group.length) return null
                const labels = { invoice: 'Facturas', quote: 'Presupuestos', client: 'Clientes', expense: 'Gastos' }
                return (
                  <div key={type}>
                    <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {labels[type]}
                    </p>
                    {group.map(item => (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <item.icon size={16} className={`flex-shrink-0 ${item.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.subtitle}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{item.right}</span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-400">
          <span><kbd className="bg-gray-100 dark:bg-gray-700 rounded px-1">↑↓</kbd> navegar</span>
          <span><kbd className="bg-gray-100 dark:bg-gray-700 rounded px-1">↵</kbd> abrir</span>
          <span><kbd className="bg-gray-100 dark:bg-gray-700 rounded px-1">Esc</kbd> cerrar</span>
        </div>
      </div>
    </div>
  )
}
