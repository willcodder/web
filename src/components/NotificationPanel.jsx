import { useState, useRef, useEffect } from 'react'
import { Bell, AlertCircle, Clock, CheckCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate, calcDocumentTotals } from '../utils/calculations'
import { useNavigate } from 'react-router-dom'

export default function NotificationPanel() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dismissed_notifs') || '[]') } catch { return [] }
  })
  const ref = useRef()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const today = new Date()

  const notifications = state.invoices
    .filter(inv => inv.status === 'pending')
    .map(inv => {
      const due = new Date(inv.dueDate)
      const diff = Math.round((due - today) / (1000 * 60 * 60 * 24))
      const client = state.clients.find(c => c.id === inv.clientId)
      const total = calcDocumentTotals(inv.lines).total
      if (diff < 0) {
        return { id: inv.id, type: 'overdue', diff, client, inv, total }
      } else if (diff <= 7) {
        return { id: inv.id, type: 'due_soon', diff, client, inv, total }
      }
      return null
    })
    .filter(Boolean)
    .filter(n => !dismissed.includes(n.id))
    .sort((a, b) => a.diff - b.diff)

  function dismiss(id) {
    const next = [...dismissed, id]
    setDismissed(next)
    localStorage.setItem('dismissed_notifs', JSON.stringify(next))
  }

  const count = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones</span>
            {count > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium px-2 py-0.5 rounded-full">{count} pendientes</span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                <CheckCircle size={28} className="text-green-400" />
                <p className="text-sm">Todo al día</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                    n.type === 'overdue' ? 'bg-red-50 dark:bg-red-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {n.type === 'overdue'
                      ? <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                      : <Clock size={16} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {n.inv.number} · {n.client?.name}
                      </p>
                      <p className={`text-xs mt-0.5 ${n.type === 'overdue' ? 'text-red-600 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                        {n.type === 'overdue'
                          ? `Vencida hace ${Math.abs(n.diff)} día${Math.abs(n.diff) !== 1 ? 's' : ''}`
                          : n.diff === 0 ? 'Vence hoy'
                          : `Vence en ${n.diff} día${n.diff !== 1 ? 's' : ''}`
                        }
                        {' · '}{formatCurrency(n.total)}
                      </p>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex-shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => { navigate('/facturas'); setOpen(false) }}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Ver todas las facturas pendientes →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
