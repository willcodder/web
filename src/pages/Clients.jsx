import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Building2, Mail, Phone, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { generateId } from '../utils/calculations'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'

const empty = { name: '', cif: '', email: '', phone: '', address: '', city: '', zip: '' }

export default function Clients() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'new' | 'edit' | 'view'
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)

  const filtered = state.clients.filter(c =>
    [c.name, c.email, c.cif, c.city].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  function openNew() {
    setForm(empty)
    setModal('new')
  }

  function openEdit(client) {
    setSelected(client)
    setForm({ ...client })
    setModal('edit')
  }

  function openView(client) {
    setSelected(client)
    setModal('view')
  }

  function save() {
    if (!form.name.trim()) return
    if (modal === 'new') {
      dispatch({
        type: 'ADD_CLIENT',
        payload: { ...form, id: generateId('c'), createdAt: new Date().toISOString().split('T')[0] },
      })
    } else {
      dispatch({ type: 'UPDATE_CLIENT', payload: { ...selected, ...form } })
    }
    setModal(null)
  }

  function remove(id) {
    if (confirm('¿Eliminar este cliente?')) {
      dispatch({ type: 'DELETE_CLIENT', payload: id })
    }
  }

  const columns = [
    {
      header: 'Cliente',
      render: c => (
        <div>
          <p className="font-medium text-gray-900">{c.name}</p>
          <p className="text-xs text-gray-400">{c.cif}</p>
        </div>
      ),
    },
    { header: 'Email', render: c => <span className="text-gray-600">{c.email}</span> },
    { header: 'Teléfono', render: c => <span className="text-gray-600">{c.phone}</span> },
    { header: 'Ciudad', render: c => <span className="text-gray-600">{c.city}</span> },
    {
      header: '',
      cellClassName: 'text-right',
      render: c => (
        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <Pencil size={14} />
          </button>
          <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const clientInvoices = selected
    ? state.invoices.filter(i => i.clientId === selected.id)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500">{state.clients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> Nuevo cliente
          </button>
        </div>
      </div>

      <Table columns={columns} data={filtered} onRowClick={openView} emptyMessage="No hay clientes" />

      {/* New/Edit Modal */}
      <Modal
        open={modal === 'new' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Nuevo cliente' : 'Editar cliente'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Razón social *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Empresa S.L."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CIF / NIF</label>
            <input
              type="text"
              value={form.cif}
              onChange={e => setForm(f => ({ ...f, cif: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="B12345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="+34 91 123 45 67"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="cliente@empresa.es"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Calle Mayor 1, 2º"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Madrid"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código postal</label>
            <input
              type="text"
              value={form.zip}
              onChange={e => setForm(f => ({ ...f, zip: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="28001"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={save} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
            {modal === 'new' ? 'Crear cliente' : 'Guardar cambios'}
          </button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Ficha de cliente" size="md">
        {selected && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 size={22} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selected.name}</h3>
                <p className="text-sm text-gray-500">{selected.cif}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400" />{selected.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400" />{selected.phone}
              </div>
              <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                <MapPin size={14} className="text-gray-400" />{selected.address}, {selected.zip} {selected.city}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Historial de facturas ({clientInvoices.length})</h4>
              {clientInvoices.length === 0 ? (
                <p className="text-sm text-gray-400">Sin facturas</p>
              ) : (
                <div className="space-y-2">
                  {clientInvoices.map(inv => (
                    <div key={inv.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                      <span className="text-gray-600">{inv.number}</span>
                      <span className="text-gray-500">{inv.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { openEdit(selected); }}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Pencil size={14} /> Editar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
