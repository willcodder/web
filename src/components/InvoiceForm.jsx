import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcDocumentTotals, calcLineSubtotal, formatCurrency, generateId, getNextNumber } from '../utils/calculations'

const emptyLine = () => ({ id: generateId(), productId: '', description: '', quantity: 1, price: 0, tax: 21 })

export default function InvoiceForm({ initial, onSave, onCancel, type = 'invoice' }) {
  const { state } = useApp()
  const prefix = type === 'invoice' ? 'FAC' : 'PRE'
  const collection = type === 'invoice' ? state.invoices : state.quotes
  const dateField2 = type === 'invoice' ? 'dueDate' : 'validUntil'
  const dateLabel2 = type === 'invoice' ? 'Vence' : 'Válido hasta'

  const [form, setForm] = useState(() => {
    if (initial) return { ...initial, lines: initial.lines.map(l => ({ ...l, id: generateId() })) }
    const today = new Date().toISOString().split('T')[0]
    const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
    return {
      number: getNextNumber(collection, prefix),
      clientId: state.clients[0]?.id || '',
      date: today,
      [dateField2]: due,
      status: 'draft',
      lines: [emptyLine()],
      notes: '',
    }
  })

  const addLine = () => setForm(f => ({ ...f, lines: [...f.lines, emptyLine()] }))

  const removeLine = (id) => setForm(f => ({ ...f, lines: f.lines.filter(l => l.id !== id) }))

  const updateLine = (id, field, value) => {
    setForm(f => ({
      ...f,
      lines: f.lines.map(l => {
        if (l.id !== id) return l
        const updated = { ...l, [field]: value }
        if (field === 'productId') {
          const product = state.products.find(p => p.id === value)
          if (product) {
            updated.description = product.name
            updated.price = product.price
            updated.tax = product.tax
          }
        }
        return updated
      }),
    }))
  }

  const totals = calcDocumentTotals(form.lines)

  function handleSave() {
    if (!form.clientId || form.lines.length === 0) return
    const { lines, ...rest } = form
    const cleanLines = lines.map(({ id, ...l }) => ({
      ...l,
      quantity: parseFloat(l.quantity) || 0,
      price: parseFloat(l.price) || 0,
      tax: parseInt(l.tax) || 0,
    }))
    onSave({ ...rest, lines: cleanLines })
  }

  const statusOptions = type === 'invoice'
    ? [{ value: 'draft', label: 'Borrador' }, { value: 'pending', label: 'Pendiente' }, { value: 'paid', label: 'Cobrada' }]
    : [{ value: 'pending', label: 'Pendiente' }, { value: 'accepted', label: 'Aceptado' }, { value: 'rejected', label: 'Rechazado' }]

  return (
    <div className="space-y-6">
      {/* Header fields */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
          <input
            type="text"
            value={form.number}
            onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">{dateLabel2}</label>
          <input
            type="date"
            value={form[dateField2]}
            onChange={e => setForm(f => ({ ...f, [dateField2]: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Client */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Cliente *</label>
        <select
          value={form.clientId}
          onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Seleccionar cliente...</option>
          {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Lines */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Conceptos</label>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
            <div className="col-span-5">Descripción</div>
            <div className="col-span-2 text-center">Cantidad</div>
            <div className="col-span-2 text-right">Precio</div>
            <div className="col-span-1 text-center">IVA</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {form.lines.map((line, idx) => (
            <div key={line.id} className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-b border-gray-100 last:border-0">
              <div className="col-span-5">
                <select
                  value={line.productId || ''}
                  onChange={e => updateLine(line.id, 'productId', e.target.value)}
                  className="w-full text-xs border-0 bg-transparent focus:outline-none text-gray-500 mb-0.5"
                >
                  <option value="">Servicio del catálogo...</option>
                  {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Descripción del concepto"
                  value={line.description}
                  onChange={e => updateLine(line.id, 'description', e.target.value)}
                  className="w-full px-0 py-0 text-sm border-0 border-b border-dashed border-gray-200 focus:outline-none focus:border-primary-400 bg-transparent"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={line.quantity}
                  onChange={e => updateLine(line.id, 'quantity', e.target.value)}
                  className="w-full px-2 py-1 text-sm text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.price}
                  onChange={e => updateLine(line.id, 'price', e.target.value)}
                  className="w-full px-2 py-1 text-sm text-right border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="col-span-1">
                <select
                  value={line.tax}
                  onChange={e => updateLine(line.id, 'tax', e.target.value)}
                  className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-center"
                >
                  {[0, 4, 10, 21].map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
              <div className="col-span-1 text-right text-sm font-medium text-gray-900">
                {formatCurrency(calcLineSubtotal(line))}
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  onClick={() => removeLine(line.id)}
                  disabled={form.lines.length === 1}
                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="px-3 py-2 bg-gray-50">
            <button onClick={addLine} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium">
              <Plus size={14} /> Añadir concepto
            </button>
          </div>
        </div>
      </div>

      {/* Totals + Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notas</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Condiciones de pago, notas adicionales..."
          />
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Base imponible</span>
            <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
          </div>
          {totals.taxBreakdown.map(t => (
            <div key={t.rate} className="flex justify-between text-sm">
              <span className="text-gray-500">IVA {t.rate}%</span>
              <span className="font-medium">{formatCurrency(t.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2 mt-2">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
          Cancelar
        </button>
        <button onClick={handleSave} className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
          Guardar
        </button>
      </div>
    </div>
  )
}
