export function calcLineSubtotal(line) {
  const price = line.price ?? line.unitPrice ?? 0
  return (line.quantity ?? 0) * price
}

export function calcLineTotal(line) {
  const subtotal = calcLineSubtotal(line)
  return subtotal + (subtotal * line.tax) / 100
}

/**
 * Calculates document totals with optional IRPF and invoice type support.
 *
 * @param {Array}  lines
 * @param {Object} opts
 * @param {number} opts.irpf         - IRPF retention % (0 if not autónomo or not applicable)
 * @param {string} opts.tipoFactura  - 'nacional' | 'intracomunitaria' | 'extracomunitaria'
 */
export function calcDocumentTotals(lines, { irpf = 0, tipoFactura = 'nacional' } = {}) {
  const safeLines = Array.isArray(lines) ? lines : []
  const subtotal = safeLines.reduce((sum, l) => sum + calcLineSubtotal(l), 0)

  // IVA only applies to national invoices
  const applyIva = tipoFactura === 'nacional'

  const taxBreakdown = applyIva
    ? Object.values(safeLines.reduce((acc, l) => {
        const base   = calcLineSubtotal(l)
        const taxAmt = (base * l.tax) / 100
        const key    = `${l.tax}`
        if (!acc[key]) acc[key] = { rate: l.tax, base: 0, amount: 0 }
        acc[key].base   += base
        acc[key].amount += taxAmt
        return acc
      }, {}))
    : []

  const tax        = taxBreakdown.reduce((sum, t) => sum + t.amount, 0)
  const irpfAmount = applyIva && irpf > 0 ? (subtotal * irpf) / 100 : 0
  const total      = subtotal + tax - irpfAmount

  return { subtotal, tax, taxBreakdown, irpfAmount, irpfRate: irpf, total, tipoFactura }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

export function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function getNextNumber(items, prefix, field = 'number') {
  const year      = new Date().getFullYear()
  const yearItems = items.filter(i => i[field] && i[field].includes(`${year}`))
  const nums      = yearItems.map(i => parseInt(i[field].split('-').pop(), 10)).filter(n => !isNaN(n))
  const next      = nums.length ? Math.max(...nums) + 1 : 1
  return `${prefix}-${year}-${String(next).padStart(3, '0')}`
}

export const STATUS_LABELS = {
  draft:     'Borrador',
  pending:   'Pendiente',
  paid:      'Cobrada',
  overdue:   'Vencida',
  accepted:  'Aceptado',
  rejected:  'Rechazado',
  cancelled: 'Cancelado',
}

export const STATUS_COLORS = {
  draft:     'bg-gray-100 text-gray-600',
  pending:   'bg-yellow-100 text-yellow-700',
  paid:      'bg-green-100 text-green-700',
  overdue:   'bg-red-100 text-red-700',
  accepted:  'bg-green-100 text-green-700',
  rejected:  'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export const TIPO_FACTURA_LABELS = {
  nacional:          'Nacional',
  intracomunitaria:  'Intracomunitaria (UE)',
  extracomunitaria:  'Extracomunitaria',
}

export const TIPO_FACTURA_NOTA = {
  intracomunitaria:  'Operación exenta de IVA — art. 25 Ley 37/1992 (LIVA). Inversión del sujeto pasivo.',
  extracomunitaria:  'Operación no sujeta a IVA — art. 69 Ley 37/1992 (LIVA). Servicios prestados fuera del territorio de aplicación del impuesto.',
}
