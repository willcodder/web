import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { generateId, formatCurrency } from '../utils/calculations'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'

const CATEGORIES = ['Producción', 'Postproducción', 'Audio', 'Fotografía', 'Animación', 'Streaming', 'Consultoría', 'Otros']
const UNITS = ['hora', 'día', 'medio día', 'proyecto', 'pieza', 'pack', 'foto', 'evento', 'minuto', 'mes']
const TAX_RATES = [0, 10, 21]

const empty = { name: '', price: '', unit: 'hora', category: 'Producción', tax: 21, description: '' }

export default function Services() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)

  const filtered = state.products.filter(p => {
    const matchSearch = [p.name, p.category].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const matchCat = !filterCat || p.category === filterCat
    return matchSearch && matchCat
  })

  const categories = [...new Set(state.products.map(p => p.category))]

  function openNew() {
    setForm(empty)
    setModal('new')
  }

  function openEdit(product) {
    setSelected(product)
    setForm({ ...product })
    setModal('edit')
  }

  function save() {
    if (!form.name.trim() || !form.price) return
    const payload = { ...form, price: parseFloat(form.price), tax: parseInt(form.tax) }
    if (modal === 'new') {
      dispatch({ type: 'ADD_PRODUCT', payload: { ...payload, id: generateId('p') } })
    } else {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { ...selected, ...payload } })
    }
    setModal(null)
  }

  function remove(id) {
    if (confirm('¿Eliminar este servicio?')) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id })
    }
  }

  const columns = [
    {
      header: 'Servicio',
      render: p => (
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          {p.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{p.description}</p>}
        </div>
      ),
    },
    {
      header: 'Categoría',
      render: p => (
        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
          {p.category}
        </span>
      ),
    },
    { header: 'Unidad', render: p => <span className="text-gray-600 capitalize">{p.unit}</span> },
    {
      header: 'Precio',
      cellClassName: 'text-right',
      render: p => <span className="font-semibold text-gray-900">{formatCurrency(p.price)}</span>,
    },
    {
      header: 'IVA',
      cellClassName: 'text-center',
      render: p => <span className="text-gray-600">{p.tax}%</span>,
    },
    {
      header: '',
      cellClassName: 'text-right',
      render: p => (
        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <Pencil size={14} />
          </button>
          <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-sm text-gray-500">{state.products.length} servicios en catálogo</p>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-52"
            />
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} /> Nuevo servicio
          </button>
        </div>
      </div>

      {/* Category pills summary */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const count = state.products.filter(p => p.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCat === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              <Package size={12} />
              {cat} <span className="opacity-70">({count})</span>
            </button>
          )
        })}
      </div>

      <Table columns={columns} data={filtered} emptyMessage="No hay servicios en este catálogo" />

      {/* Modal */}
      <Modal
        open={modal === 'new' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'new' ? 'Nuevo servicio' : 'Editar servicio'}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del servicio *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ej: Día de rodaje completo"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descripción breve del servicio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
            <select
              value={form.unit}
              onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio (€) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IVA (%)</label>
            <select
              value={form.tax}
              onChange={e => setForm(f => ({ ...f, tax: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {TAX_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={save} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
            {modal === 'new' ? 'Crear servicio' : 'Guardar cambios'}
          </button>
        </div>
      </Modal>
    </div>
  )
}
