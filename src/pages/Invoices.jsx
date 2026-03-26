import { useState } from 'react'
import { Plus, Search, Eye, Pencil, Trash2, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcDocumentTotals, formatCurrency, formatDate, generateId, STATUS_LABELS } from '../utils/calculations'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import InvoiceForm from '../components/InvoiceForm'
import InvoicePDF from '../components/InvoicePDF'

const STATUS_OPTS = ['', 'draft', 'pending', 'paid']

export default function Invoices() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)

  const getClient = id => state.clients.find(c => c.id === id)

  const filtered = state.invoices.filter(inv => {
    const client = getClient(inv.clientId)
    const matchSearch = [inv.number, client?.name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = !filterStatus || inv.status === filterStatus
    return matchSearch && matchStatus
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const totals = {
    all: state.invoices.filter(i => i.status !== 'draft').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0),
    paid: state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0),
    pending: state.invoices.filter(i => i.status === 'pending').reduce((s, i) => s + calcDocumentTotals(i.lines).total, 0),
  }

  function openNew() {
    setSelected(null)
    setModal('form')
  }

  function openEdit(inv) {
    setSelected(inv)
    setModal('form')
  }

  function openView(inv) {
    setSelected(inv)
    setModal('view')
  }

  function save(data) {
    if (selected) {
      dispatch({ type: 'UPDATE_INVOICE', payload: { ...selected, ...data } })
    } else {
      dispatch({ type: 'ADD_INVOICE', payload: { ...data, id: generateId('inv') } })
    }
    setModal(null)
  }

  function remove(id) {
    if (confirm('¿Eliminar esta factura?')) {
      dispatch({ type: 'DELETE_INVOICE', payload: id })
      if (modal) setModal(null)
    }
  }

  function changeStatus(inv, status) {
    dispatch({ type: 'UPDATE_INVOICE', payload: { ...inv, status } })
  }

  const columns = [
    {
      header: 'Número',
      render: inv => (
        <span className="font-mono text-sm font-medium text-gray-900">{inv.number}</span>
      ),
    },
    {
      header: 'Cliente',
      render: inv => <span className="text-gray-700">{getClient(inv.clientId)?.name || '-'}</span>,
    },
    {
      header: 'Fecha',
      render: inv => <span className="text-gray-500 text-sm">{formatDate(inv.date)}</span>,
    },
    {
      header: 'Vence',
      render: inv => {
        const isOverdue = inv.status === 'pending' && new Date(inv.dueDate) < new Date()
        return (
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
            {formatDate(inv.dueDate)}
          </span>
        )
      },
    },
    {
      header: 'Estado',
      render: inv => {
        const effectiveStatus = inv.status === 'pending' && new Date(inv.dueDate) < new Date() ? 'overdue' : inv.status
        return <Badge status={effectiveStatus} />
      },
    },
    {
      header: 'Total',
      cellClassName: 'text-right',
      render: inv => (
        <span className="font-semibold text-gray-900">{formatCurrency(calcDocumentTotals(inv.lines).total)}</span>
      ),
    },
    {
      header: '',
      cellClassName: 'text-right',
      render: inv => (
        <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => openView(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-600" title="Ver">
            <Eye size={14} />
          </button>
          <button onClick={() => openEdit(inv)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Editar">
            <Pencil size={14} />
          </button>
          <button onClick={() => remove(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Total facturado</p>
          <p className="text-lg font-bold text-gray-900">{formatCurrency(totals.all)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Cobrado</p>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totals.paid)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Pendiente</p>
          <p className="text-lg font-bold text-yellow-600">{formatCurrency(totals.pending)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar factura..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-52"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_OPTS.map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  filterStatus === s
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {s ? STATUS_LABELS[s] : 'Todas'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Nueva factura
        </button>
      </div>

      <Table columns={columns} data={filtered} onRowClick={openView} emptyMessage="No hay facturas" />

      {/* Form Modal */}
      <Modal
        open={modal === 'form'}
        onClose={() => setModal(null)}
        title={selected ? `Editar ${selected.number}` : 'Nueva factura'}
        size="xl"
      >
        <InvoiceForm
          initial={selected}
          type="invoice"
          onSave={save}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* View/PDF Modal */}
      <Modal
        open={modal === 'view'}
        onClose={() => setModal(null)}
        title={selected?.number || 'Factura'}
        size="lg"
      >
        {selected && (
          <div className="space-y-4">
            {/* Quick actions */}
            <div className="flex items-center gap-3 flex-wrap no-print pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Cambiar estado:</span>
              {['draft', 'pending', 'paid'].map(s => (
                <button
                  key={s}
                  onClick={() => { changeStatus(selected, s); setSelected(prev => ({ ...prev, status: s })) }}
                  className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                    selected.status === s
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
              <button
                onClick={() => { setModal('form') }}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              >
                <Pencil size={12} /> Editar
              </button>
              <button
                onClick={() => remove(selected.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-red-200 rounded-lg hover:bg-red-50 text-red-500"
              >
                <Trash2 size={12} /> Eliminar
              </button>
            </div>
            <InvoicePDF doc={selected} type="invoice" />
          </div>
        )}
      </Modal>
    </div>
  )
}
