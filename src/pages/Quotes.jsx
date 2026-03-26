import { useState } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcDocumentTotals, formatCurrency, formatDate, generateId, STATUS_LABELS } from '../utils/calculations'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import InvoiceForm from '../components/InvoiceForm'
import InvoicePDF from '../components/InvoicePDF'

const STATUS_OPTS = ['', 'pending', 'accepted', 'rejected']

export default function Quotes() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)

  const getClient = id => state.clients.find(c => c.id === id)

  const filtered = state.quotes.filter(q => {
    const client = getClient(q.clientId)
    const matchSearch = [q.number, client?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchSearch && (!filterStatus || q.status === filterStatus)
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  function openNew() { setSelected(null); setModal('form') }
  function openEdit(q) { setSelected(q); setModal('form') }
  function openView(q) { setSelected(q); setModal('view') }

  function save(data) {
    if (selected) dispatch({ type: 'UPDATE_QUOTE', payload: { ...selected, ...data } })
    else dispatch({ type: 'ADD_QUOTE', payload: { ...data, id: generateId('q') } })
    setModal(null)
  }

  function remove(id) {
    if (confirm('¿Eliminar este presupuesto?')) { dispatch({ type: 'DELETE_QUOTE', payload: id }); if (modal) setModal(null) }
  }

  function changeStatus(q, status) {
    const updated = { ...q, status }
    dispatch({ type: 'UPDATE_QUOTE', payload: updated })
    setSelected(updated)
  }

  function convertToInvoice(q) {
    if (!confirm('¿Convertir este presupuesto en factura?')) return
    const year = new Date().getFullYear()
    const nums = state.invoices.filter(i => i.number?.includes(`${year}`)).map(i => parseInt(i.number.split('-').pop())).filter(n => !isNaN(n))
    const nextNum = nums.length ? Math.max(...nums) + 1 : 1
    const number = `FAC-${year}-${String(nextNum).padStart(3, '0')}`
    const today = new Date().toISOString().split('T')[0]
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    dispatch({ type: 'ADD_INVOICE', payload: { id: generateId('inv'), number, clientId: q.clientId, date: today, dueDate: due, status: 'pending', lines: q.lines, notes: q.notes } })
    dispatch({ type: 'UPDATE_QUOTE', payload: { ...q, status: 'accepted' } })
    setModal(null)
    alert(`Presupuesto convertido a factura ${number}`)
  }

  const columns = [
    { header: 'Número', render: q => <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{q.number}</span> },
    { header: 'Cliente', render: q => <span className="text-gray-700 dark:text-gray-300">{getClient(q.clientId)?.name || '-'}</span> },
    { header: 'Fecha', render: q => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(q.date)}</span> },
    {
      header: 'Válido hasta',
      render: q => {
        const expired = q.status === 'pending' && new Date(q.validUntil) < new Date()
        return <span className={`text-sm ${expired ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{formatDate(q.validUntil)}</span>
      },
    },
    { header: 'Estado', render: q => <Badge status={q.status} /> },
    { header: 'Total', cellClassName: 'text-right', render: q => <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(calcDocumentTotals(q.lines).total)}</span> },
    {
      header: '', cellClassName: 'text-right',
      render: q => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => openView(q)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600"><Eye size={14} /></button>
          <button onClick={() => openEdit(q)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><Pencil size={14} /></button>
          <button onClick={() => remove(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar presupuesto..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-52 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_OPTS.map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterStatus === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary-300'}`}>
                {s ? STATUS_LABELS[s] : 'Todos'}
              </button>
            ))}
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={16} /> Nuevo presupuesto
        </button>
      </div>

      <Table columns={columns} data={filtered} onRowClick={openView} emptyMessage="No hay presupuestos" />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? `Editar ${selected.number}` : 'Nuevo presupuesto'} size="xl">
        <InvoiceForm initial={selected} type="quote" onSave={save} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'view'} onClose={() => setModal(null)} title={selected?.number || 'Presupuesto'} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap pb-4 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-500 dark:text-gray-400">Estado:</span>
              {['pending', 'accepted', 'rejected'].map(s => (
                <button key={s} onClick={() => changeStatus(selected, s)}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${selected.status === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary-300'}`}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <button onClick={() => convertToInvoice(selected)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                <FileText size={12} /> Convertir a factura
              </button>
              <button onClick={() => setModal('form')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400">
                <Pencil size={12} /> Editar
              </button>
            </div>
            <InvoicePDF doc={selected} type="quote" />
          </div>
        )}
      </Modal>
    </div>
  )
}
