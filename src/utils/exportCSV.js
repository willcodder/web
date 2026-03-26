import { calcDocumentTotals, formatDate } from './calculations'

function download(content, filename) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function escape(val) {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function row(fields) {
  return fields.map(escape).join(',')
}

export function exportInvoicesCSV(invoices, clients) {
  const headers = ['Número', 'Fecha', 'Vencimiento', 'Estado', 'Cliente', 'CIF Cliente', 'Base Imponible', 'IVA', 'Total']
  const rows = invoices.map(inv => {
    const client = clients.find(c => c.id === inv.clientId)
    const totals = calcDocumentTotals(inv.lines)
    const statusMap = { draft: 'Borrador', pending: 'Pendiente', paid: 'Cobrada' }
    return row([
      inv.number,
      formatDate(inv.date),
      formatDate(inv.dueDate),
      statusMap[inv.status] || inv.status,
      client?.name || '',
      client?.cif || '',
      totals.subtotal.toFixed(2),
      totals.tax.toFixed(2),
      totals.total.toFixed(2),
    ])
  })
  const csv = [row(headers), ...rows].join('\n')
  download(csv, `facturas_${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportExpensesCSV(expenses) {
  const headers = ['Fecha', 'Descripción', 'Proveedor', 'Categoría', 'Base', 'IVA %', 'IVA €', 'Total', 'Estado']
  const rows = expenses.map(e => {
    const taxAmt = e.amount * e.tax / 100
    const statusMap = { paid: 'Pagado', pending: 'Pendiente' }
    return row([
      formatDate(e.date),
      e.description,
      e.provider,
      e.category,
      e.amount.toFixed(2),
      e.tax,
      taxAmt.toFixed(2),
      (e.amount + taxAmt).toFixed(2),
      statusMap[e.status] || e.status,
    ])
  })
  const csv = [row(headers), ...rows].join('\n')
  download(csv, `gastos_${new Date().toISOString().split('T')[0]}.csv`)
}

export function exportClientsCSV(clients) {
  const headers = ['Nombre', 'CIF/NIF', 'Email', 'Teléfono', 'Dirección', 'Ciudad', 'CP', 'Alta']
  const rows = clients.map(c => row([
    c.name, c.cif, c.email, c.phone, c.address, c.city, c.zip, formatDate(c.createdAt)
  ]))
  const csv = [row(headers), ...rows].join('\n')
  download(csv, `clientes_${new Date().toISOString().split('T')[0]}.csv`)
}
