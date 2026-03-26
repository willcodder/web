import { Printer, Mail } from 'lucide-react'
import { calcDocumentTotals, calcLineSubtotal, formatCurrency, formatDate } from '../utils/calculations'
import { sendInvoiceByEmail } from '../utils/sendEmail'
import { useApp } from '../context/AppContext'

export default function InvoicePDF({ doc, type = 'invoice' }) {
  const { state } = useApp()
  const client = state.clients.find(c => c.id === doc.clientId)
  const totals = calcDocumentTotals(doc.lines)
  const docTitle = type === 'invoice' ? 'FACTURA' : 'PRESUPUESTO'

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    const styles = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: white; }
        .page { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .brand-name { font-size: 22px; font-weight: 700; color: #4a52e8; }
        .brand-info { font-size: 11px; color: #6b7280; line-height: 1.6; margin-top: 4px; }
        .doc-type { font-size: 28px; font-weight: 800; color: #4a52e8; letter-spacing: -0.5px; text-align: right; }
        .doc-number { font-size: 13px; color: #6b7280; text-align: right; margin-top: 4px; }
        .doc-date { font-size: 12px; color: #6b7280; text-align: right; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .section-title { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 6px; }
        .party-name { font-size: 14px; font-weight: 600; color: #111827; }
        .party-detail { font-size: 11px; color: #6b7280; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
        thead th:not(:first-child) { text-align: right; }
        tbody td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
        tbody td:not(:first-child) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 32px; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
        .totals-row.total { font-size: 16px; font-weight: 700; color: #4a52e8; border-bottom: none; padding-top: 10px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; line-height: 1.8; }
      </style>
    `
    printWindow.document.write(`
      <!DOCTYPE html><html lang="es"><head><title>${docTitle} ${doc.number}</title>${styles}</head>
      <body><div class="page">
        <div class="header">
          <div>
            <div class="brand-name">${state.company.name}</div>
            <div class="brand-info">
              ${state.company.cif}<br>
              ${state.company.address}<br>
              ${state.company.zip} ${state.company.city}<br>
              ${state.company.phone} · ${state.company.email}
            </div>
          </div>
          <div>
            <div class="doc-type">${docTitle}</div>
            <div class="doc-number">${doc.number}</div>
            <div class="doc-date">
              Fecha: ${formatDate(doc.date)}<br>
              ${type === 'invoice' ? `Vence: ${formatDate(doc.dueDate)}` : `Válido hasta: ${formatDate(doc.validUntil)}`}
            </div>
          </div>
        </div>
        <div class="parties">
          <div>
            <div class="section-title">Emisor</div>
            <div class="party-name">${state.company.name}</div>
            <div class="party-detail">${state.company.cif}<br>${state.company.address}, ${state.company.city}</div>
          </div>
          <div>
            <div class="section-title">Cliente / Receptor</div>
            <div class="party-name">${client?.name || '-'}</div>
            <div class="party-detail">${client?.cif || ''}<br>${client?.address || ''}, ${client?.city || ''}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr><th>Descripción</th><th>Cantidad</th><th>Precio unit.</th><th>IVA</th><th>Importe</th></tr>
          </thead>
          <tbody>
            ${doc.lines.map(l => `
              <tr>
                <td>${l.description || '-'}</td>
                <td>${l.quantity}</td>
                <td>${formatCurrency(l.price)}</td>
                <td>${l.tax}%</td>
                <td>${formatCurrency(calcLineSubtotal(l))}</td>
              </tr>`).join('')}
          </tbody>
        </table>
        <div class="totals">
          <div class="totals-box">
            <div class="totals-row"><span>Base imponible</span><span>${formatCurrency(totals.subtotal)}</span></div>
            ${totals.taxBreakdown.map(t => `<div class="totals-row"><span>IVA ${t.rate}%</span><span>${formatCurrency(t.amount)}</span></div>`).join('')}
            <div class="totals-row total"><span>TOTAL</span><span>${formatCurrency(totals.total)}</span></div>
          </div>
        </div>
        <div class="footer">
          ${doc.notes ? `<div><strong>Notas:</strong> ${doc.notes}</div>` : ''}
          ${state.company.iban ? `<div><strong>Datos bancarios:</strong> ${state.company.iban}</div>` : ''}
        </div>
      </div></body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Imprimir o guardar como PDF"
        >
          <Printer size={15} aria-hidden="true" /> Imprimir / PDF
        </button>
        <button
          onClick={() => sendInvoiceByEmail(doc, client, state.company, type)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          aria-label={`Enviar ${type === 'invoice' ? 'factura' : 'presupuesto'} por email a ${client?.email || 'cliente'}`}
        >
          <Mail size={15} aria-hidden="true" />
          Enviar por email
          {client?.email && <span className="text-primary-200 text-xs hidden sm:inline">→ {client.email}</span>}
        </button>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 lg:p-8 text-sm">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <div className="text-lg lg:text-xl font-bold text-primary-600">{state.company.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
              <p>{state.company.cif}</p>
              <p>{state.company.address}</p>
              <p>{state.company.zip} {state.company.city}</p>
              <p>{state.company.phone} · {state.company.email}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-2xl lg:text-3xl font-extrabold text-primary-600 tracking-tight">{docTitle}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{doc.number}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              <p>Fecha: {formatDate(doc.date)}</p>
              <p>{type === 'invoice' ? `Vence: ${formatDate(doc.dueDate)}` : `Válido hasta: ${formatDate(doc.validUntil)}`}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Emisor</p>
            <p className="font-semibold text-gray-900 dark:text-white">{state.company.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{state.company.cif}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{state.company.address}, {state.company.city}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cliente</p>
            <p className="font-semibold text-gray-900 dark:text-white">{client?.name || '-'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{client?.cif}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{client?.address}, {client?.city}</p>
          </div>
        </div>

        {/* Lines */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs" aria-label="Conceptos de la factura">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                {['Descripción', 'Cant.', 'Precio', 'IVA', 'Importe'].map(h => (
                  <th key={h} scope="col" className={`py-2 pb-3 text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider ${h === 'Descripción' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {doc.lines.map((line, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-800 dark:text-gray-200">{line.description || '-'}</td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">{line.quantity}</td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(line.price)}</td>
                  <td className="py-3 text-right text-gray-600 dark:text-gray-400">{line.tax}%</td>
                  <td className="py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(calcLineSubtotal(line))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-56 lg:w-64 space-y-1.5" aria-label="Resumen de importes">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Base imponible</span><span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.taxBreakdown.map(t => (
              <div key={t.rate} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>IVA {t.rate}%</span><span>{formatCurrency(t.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-bold border-t-2 border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <span className="text-gray-900 dark:text-white">TOTAL</span>
              <span className="text-primary-600 dark:text-primary-400">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-1">
          {doc.notes && <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">Notas:</span> {doc.notes}</p>}
          {state.company.iban && <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">Datos bancarios:</span> {state.company.iban}</p>}
        </div>
      </div>
    </div>
  )
}
