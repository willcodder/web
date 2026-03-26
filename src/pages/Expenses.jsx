import { useState } from 'react'
import { Plus, Search, Pencil, Trash2, Download } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatCurrency, formatDate, generateId } from '../utils/calculations'
import { exportExpensesCSV } from '../utils/exportCSV'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'

const CATEGORIES = ['Equipamiento', 'Software', 'Transporte', 'Dietas', 'Espacios', 'Licencias', 'Personal', 'Marketing', 'Otros']
const empty = { description: '', amount: '', tax: 21, category: 'Equipamiento', date: new Date().toISOString().split('T')[0], provider: '', status: 'pending' }

export default function Expenses() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [selected, setSelected] = useState(null)

  const filtered = state.expenses.filter(e => {
    const matchSearch = [e.description, e.provider, e.category].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchSearch && (!filterCat || e.category === filterCat)
  }).sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalBase = state.expenses.reduce((s, e) => s + e.amount, 0)
  const totalTax = state.expenses.reduce((s, e) => s + e.amount * e.tax / 100, 0)
  const categories = [...new Set(state.expenses.map(e => e.category))]

  function openNew() { setForm(empty); setSelected(null); setModal('form') }
  function openEdit(exp) { setSelected(exp); setForm({ ...exp }); setModal('form') }

  function save() {
    if (!form.description.trim() || !form.amount) return
    const payload = { ...form, amount: parseFloat(form.amount), tax: parseInt(form.tax) }
    if (selected) {
      dispatch({ type: 'UPDATE_EXPENSE', payload: { ...selected, ...payload } })
    } else {
      dispatch({ type: 'ADD_EXPENSE', payload: { ...payload, id: generateId('e') } })
    }
    setModal(null)
  }

  function remove(id) {
    if (confirm('¿Eliminar este gasto?')) dispatch({ type: 'DELETE_EXPENSE', payload: id })
  }

  const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"

  const columns = [
    {
      header: 'Descripción',
      render: e => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{e.description}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">{e.provider}</p>
        </div>
      ),
    },
    {
      header: 'Categoría',
      render: e => <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{e.category}</span>,
    },
    { header: 'Fecha', render: e => <span className="text-gray-500 dark:text-gray-400 text-sm">{formatDate(e.date)}</span> },
    { header: 'Base', cellClassName: 'text-right', render: e => <span className="text-gray-700 dark:text-gray-300">{formatCurrency(e.amount)}</span> },
    { header: 'IVA', cellClassName: 'text-center', render: e => <span className="text-gray-500 dark:text-gray-400 text-sm">{e.tax}%</span> },
    { header: 'Total', cellClassName: 'text-right', render: e => <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(e.amount * (1 + e.tax / 100))}</span> },
    { header: 'Estado', render: e => <Badge status={e.status} /> },
    {
      header: '', cellClassName: 'text-right',
      render: e => (
        <div className="flex items-center justify-end gap-2" onClick={ev => ev.stopPropagation()}>
          <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><Pencil size={14} /></button>
          <button onClick={() => remove(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Base imponible', value: totalBase, cls: 'text-gray-900 dark:text-white' },
          { label: 'IVA soportado', value: totalTax, cls: 'text-gray-700 dark:text-gray-300' },
          { label: 'Total gastos', value: totalBase + totalTax, cls: 'text-red-600 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
            <p className={`text-lg font-bold ${s.cls}`}>{formatCurrency(s.value)}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar gasto..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 w-52 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400" />
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="py-2 px-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportExpensesCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
            <Download size={15} /> Exportar CSV
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
            <Plus size={16} /> Nuevo gasto
          </button>
        </div>
      </div>

      <Table columns={columns} data={filtered} emptyMessage="No hay gastos registrados" />

      <Modal open={modal === 'form'} onClose={() => setModal(null)} title={selected ? 'Editar gasto' : 'Nuevo gasto'}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción *</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} placeholder="Ej: Alquiler equipo de cámara" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
            <input type="text" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} className={inputCls} placeholder="Nombre del proveedor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Importe (sin IVA) *</label>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IVA (%)</label>
            <select value={form.tax} onChange={e => setForm(f => ({ ...f, tax: e.target.value }))} className={inputCls}>
              {[0, 10, 21].map(r => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>
          {form.amount && (
            <div className="sm:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total con IVA</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(parseFloat(form.amount || 0) * (1 + parseInt(form.tax || 0) / 100))}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancelar</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">{selected ? 'Guardar cambios' : 'Registrar gasto'}</button>
        </div>
      </Modal>
    </div>
  )
}
