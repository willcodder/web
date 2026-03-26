import { useRef } from 'react'
import { Printer, Download } from 'lucide-react'
import { calcDocumentTotals, calcLineSubtotal, formatCurrency, formatDate } from '../utils/calculations'
import { useApp } from '../context/AppContext'

export default function InvoicePDF({ doc, type = 'invoice' }) {
  const { state } = useApp()
  const ref = useRef()

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
        .brand { display: flex; flex-direction: column; }
        .brand-name { font-size: 22px; font-weight: 700; color: #4a52e8; }
        .brand-info { font-size: 11px; color: #6b7280; line-height: 1.6; margin-top: 4px; }
        .doc-info { text-align: right; }
        .doc-type { font-size: 28px; font-weight: 800; color: #4a52e8; letter-spacing: -0.5px; }
        .doc-number { font-size: 13px; color: #6b7280; margin-top: 4px; }
        .doc-date { font-size: 12px; color: #6b7280; }
        .section-title { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 6px; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; padding: 20px; background: #f9fafb; border-radius: 8px; }
        .party-name { font-size: 14px; font-weight: 600; color: #111827; }
        .party-detail { font-size: 11px; color: #6b7280; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        thead th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
        thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
        tbody td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
        tbody td:nth-child(2), tbody td:nth-child(3), tbody td:nth-child(4), tbody td:nth-child(5) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; }
        .totals-box { width: 280px; }
        .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
        .totals-row.total { font-size: 16px; font-weight: 700; color: #4a52e8; border-bottom: none; padding-top: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .notes { font-size: 11px; color: #6b7280; margin-bottom: 12px; }
        .bank { font-size: 11px; color: #6b7280; }
        .bank span { font-weight: 600; color: #374151; }
      </style>
    `
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${docTitle} ${doc.number}</title>${styles}</head>
      <body>
        <div class="page">
          <div class="header">
            <div class="brand">
              <div class="brand-name">${state.company.name}</div>
              <div class="brand-info">
                ${state.company.cif}<br>
                ${state.company.address}<br>
                ${state.company.zip} ${state.company.city}<br>
                ${state.company.phone} · ${state.company.email}
              </div>
            </div>
            <div class="doc-info">
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
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio unit.</th>
                <th>IVA</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              ${doc.lines.map(line => `
                <tr>
                  <td>${line.description || '-'}</td>
                  <td>${line.quantity}</td>
                  <td>${formatCurrency(line.price)}</td>
                  <td>${line.tax}%</td>
                  <td>${formatCurrency(calcLineSubtotal(line))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-box">
              <div class="totals-row"><span>Base imponible</span><span>${formatCurrency(totals.subtotal)}</span></div>
              ${totals.taxBreakdown.map(t => `
                <div class="totals-row"><span>IVA ${t.rate}%</span><span>${formatCurrency(t.amount)}</span></div>
              `).join('')}
              <div class="totals-row total"><span>TOTAL</span><span>${formatCurrency(totals.total)}</span></div>
            </div>
          </div>

          <div class="footer">
            ${doc.notes ? `<div class="notes"><strong>Notas:</strong> ${doc.notes}</div>` : ''}
            ${state.company.iban ? `<div class="bank">Datos bancarios: <span>${state.company.iban}</span></div>` : ''}
          </div>
        </div>
      </body></html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end gap-3 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <Printer size={16} /> Imprimir / Guardar PDF
        </button>
      </div>

      {/* Preview */}
      <div ref={ref} className="bg-white border border-gray-200 rounded-xl p-8 font-sans text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="text-xl font-bold text-primary-600">{state.company.name}</div>
            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
              <p>{state.company.cif}</p>
              <p>{state.company.address}</p>
              <p>{state.company.zip} {state.company.city}</p>
              <p>{state.company.phone} · {state.company.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-primary-600 tracking-tight">{docTitle}</div>
            <div className="text-sm text-gray-500 mt-1">{doc.number}</div>
            <div className="text-xs text-gray-400 mt-1">
              <p>Fecha: {formatDate(doc.date)}</p>
              <p>{type === 'invoice' ? `Vence: ${formatDate(doc.dueDate)}` : `Válido hasta: ${formatDate(doc.validUntil)}`}</p>
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-8 mb-8 p-5 bg-gray-50 rounded-xl">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Emisor</p>
            <p className="font-semibold text-gray-900">{state.company.name}</p>
            <p className="text-xs text-gray-500">{state.company.cif}</p>
            <p className="text-xs text-gray-500">{state.company.address}, {state.company.city}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Cliente</p>
            <p className="font-semibold text-gray-900">{client?.name || '-'}</p>
            <p className="text-xs text-gray-500">{client?.cif}</p>
            <p className="text-xs text-gray-500">{client?.address}, {client?.city}</p>
          </div>
        </div>

        {/* Lines table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 pb-3 text-gray-400 font-semibold uppercase tracking-wider">Descripción</th>
                <th className="text-right py-2 pb-3 text-gray-400 font-semibold uppercase tracking-wider">Cant.</th>
                <th className="text-right py-2 pb-3 text-gray-400 font-semibold uppercase tracking-wider">Precio</th>
                <th className="text-right py-2 pb-3 text-gray-400 font-semibold uppercase tracking-wider">IVA</th>
                <th className="text-right py-2 pb-3 text-gray-400 font-semibold uppercase tracking-wider">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doc.lines.map((line, i) => (
                <tr key={i}>
                  <td className="py-3 text-gray-800">{line.description || '-'}</td>
                  <td className="py-3 text-right text-gray-600">{line.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{formatCurrency(line.price)}</td>
                  <td className="py-3 text-right text-gray-600">{line.tax}%</td>
                  <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(calcLineSubtotal(line))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Base imponible</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.taxBreakdown.map(t => (
              <div key={t.rate} className="flex justify-between text-xs text-gray-500">
                <span>IVA {t.rate}%</span>
                <span>{formatCurrency(t.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-bold border-t-2 border-gray-200 pt-2 mt-2">
              <span>TOTAL</span>
              <span className="text-primary-600">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 space-y-1">
          {doc.notes && <p className="text-xs text-gray-500"><span className="font-medium">Notas:</span> {doc.notes}</p>}
          {state.company.iban && (
            <p className="text-xs text-gray-500">
              <span className="font-medium">Datos bancarios:</span> {state.company.iban}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
