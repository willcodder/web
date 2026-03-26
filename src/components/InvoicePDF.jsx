import { useState } from 'react'
import { Printer, Mail, Loader2, CheckCircle, AlertCircle, Share2 } from 'lucide-react'
import { calcDocumentTotals, calcLineSubtotal, formatCurrency, formatDate } from '../utils/calculations'
import { sendInvoiceByEmail } from '../utils/sendEmail'
import { generateInvoicePDF, getInvoiceFileName } from '../utils/generatePDF'
import { useApp } from '../context/AppContext'

// Detects if the device is mobile/tablet (uses Share API)
const isMobile = () =>
  typeof navigator !== 'undefined' &&
  typeof navigator.share === 'function' &&
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)

export default function InvoicePDF({ doc, type = 'invoice' }) {
  const { state } = useApp()
  const client = state.clients.find(c => c.id === doc.clientId)
  const totals = calcDocumentTotals(doc.lines)
  const docTitle = type === 'invoice' ? 'FACTURA' : 'PRESUPUESTO'

  const [emailState, setEmailState] = useState('idle') // idle | loading | success | error
  const [emailMsg, setEmailMsg] = useState('')

  // ── Print / PDF download ──────────────────────────────────────────────────
  async function handleDownloadPDF() {
    try {
      const blob = await generateInvoicePDF(doc, client, state.company, type)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = getInvoiceFileName(doc, type)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al generar el PDF. Intenta de nuevo.')
    }
  }

  function handlePrint() {
    const printWindow = window.open('', '_blank')
    const styles = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: white; }
        .page { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; background: #4a52e8; color: white; padding: 20px; border-radius: 8px; }
        .brand-name { font-size: 18px; font-weight: 700; }
        .brand-info { font-size: 10px; opacity: 0.8; margin-top: 4px; line-height: 1.6; }
        .doc-type { font-size: 24px; font-weight: 800; text-align: right; }
        .doc-meta { font-size: 11px; opacity: 0.8; text-align: right; margin-top: 4px; line-height: 1.6; }
        .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 28px; padding: 16px; background: #f9fafb; border-radius: 8px; }
        .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px; }
        .party-name { font-size: 13px; font-weight: 600; color: #111827; }
        .party-detail { font-size: 11px; color: #6b7280; margin-top: 2px; line-height: 1.5; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        thead th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
        thead th:not(:first-child) { text-align: right; }
        tbody td { padding: 9px 10px; border-bottom: 1px solid #f3f4f6; font-size: 12px; color: #374151; }
        tbody td:not(:first-child) { text-align: right; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 24px; }
        .totals-box { width: 240px; }
        .tr { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #6b7280; border-bottom: 1px solid #f3f4f6; }
        .tr.total { background: #4a52e8; color: white; padding: 8px 10px; font-size: 14px; font-weight: 700; border-radius: 6px; margin-top: 4px; border: none; }
        .footer { border-top: 1px solid #e5e7eb; padding-top: 12px; font-size: 11px; color: #6b7280; line-height: 1.8; }
      </style>
    `
    const dateLabel2 = type === 'invoice' ? 'Vence' : 'Válido hasta'
    const dateValue2 = type === 'invoice' ? doc.dueDate : doc.validUntil
    printWindow.document.write(`
      <!DOCTYPE html><html lang="es"><head><title>${docTitle} ${doc.number}</title>${styles}</head>
      <body><div class="page">
        <div class="header">
          <div>
            <div class="brand-name">${state.company.name}</div>
            <div class="brand-info">${state.company.cif} · ${state.company.address}, ${state.company.city}<br>${state.company.phone} · ${state.company.email}</div>
          </div>
          <div>
            <div class="doc-type">${docTitle}</div>
            <div class="doc-meta">${doc.number}<br>Fecha: ${formatDate(doc.date)}<br>${dateLabel2}: ${formatDate(dateValue2)}</div>
          </div>
        </div>
        <div class="parties">
          <div><div class="section-title">Emisor</div><div class="party-name">${state.company.name}</div><div class="party-detail">${state.company.cif}<br>${state.company.address}, ${state.company.city}</div></div>
          <div><div class="section-title">Cliente</div><div class="party-name">${client?.name || '-'}</div><div class="party-detail">${client?.cif || ''}<br>${client?.address || ''}, ${client?.city || ''}</div></div>
        </div>
        <table><thead><tr><th>Descripción</th><th>Cant.</th><th>Precio</th><th>IVA</th><th>Importe</th></tr></thead>
        <tbody>${doc.lines.map(l => `<tr><td>${l.description || '-'}</td><td>${l.quantity}</td><td>${formatCurrency(l.price)}</td><td>${l.tax}%</td><td>${formatCurrency(calcLineSubtotal(l))}</td></tr>`).join('')}</tbody></table>
        <div class="totals"><div class="totals-box">
          <div class="tr"><span>Base imponible</span><span>${formatCurrency(totals.subtotal)}</span></div>
          ${totals.taxBreakdown.map(t => `<div class="tr"><span>IVA ${t.rate}%</span><span>${formatCurrency(t.amount)}</span></div>`).join('')}
          <div class="tr total"><span>TOTAL</span><span>${formatCurrency(totals.total)}</span></div>
        </div></div>
        <div class="footer">
          ${doc.notes ? `<div><strong>Notas:</strong> ${doc.notes}</div>` : ''}
          ${state.company.iban ? `<div><strong>Datos bancarios:</strong> ${state.company.iban}</div>` : ''}
        </div>
      </div></body></html>`)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 500)
  }

  // ── Send by email ─────────────────────────────────────────────────────────
  async function handleSendEmail() {
    setEmailState('loading')
    setEmailMsg('')
    const result = await sendInvoiceByEmail(doc, client, state.company, type)
    if (result.success) {
      setEmailState('success')
      if (result.method === 'share') {
        setEmailMsg('PDF compartido desde tu dispositivo.')
      } else {
        setEmailMsg('PDF descargado. Adjúntalo al email que se ha abierto.')
      }
    } else {
      setEmailState('error')
      setEmailMsg(result.error || 'No se pudo enviar.')
    }
    setTimeout(() => setEmailState('idle'), 5000)
  }

  const mobile = isMobile()

  return (
    <div className="space-y-4">
      {/* ── Action buttons ── */}
      <div className="flex flex-wrap gap-2 no-print">
        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Descargar PDF"
        >
          <Printer size={15} aria-hidden="true" />
          <span className="hidden sm:inline">Descargar PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Imprimir"
        >
          <Printer size={15} aria-hidden="true" /> Imprimir
        </button>

        {/* Send email */}
        <button
          onClick={handleSendEmail}
          disabled={emailState === 'loading'}
          className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-70 ${
            emailState === 'success' ? 'bg-green-600 text-white' :
            emailState === 'error' ? 'bg-red-600 text-white' :
            'bg-primary-600 hover:bg-primary-700 text-white'
          }`}
          aria-label={mobile ? 'Compartir con PDF adjunto' : 'Enviar por email con PDF adjunto'}
        >
          {emailState === 'loading' ? (
            <><Loader2 size={15} className="animate-spin" aria-hidden="true" /> Generando PDF…</>
          ) : emailState === 'success' ? (
            <><CheckCircle size={15} aria-hidden="true" /> Listo</>
          ) : emailState === 'error' ? (
            <><AlertCircle size={15} aria-hidden="true" /> Error</>
          ) : mobile ? (
            <><Share2 size={15} aria-hidden="true" /> Compartir con PDF</>
          ) : (
            <><Mail size={15} aria-hidden="true" /> Enviar por email + PDF</>
          )}
        </button>
      </div>

      {/* Feedback message */}
      {emailMsg && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2 text-xs px-4 py-3 rounded-lg ${
            emailState === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
          }`}
        >
          {emailState === 'success'
            ? <CheckCircle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
            : <AlertCircle size={14} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          }
          <div>
            <p className="font-medium">{emailMsg}</p>
            {emailState === 'success' && !mobile && (
              <p className="mt-0.5 opacity-80">El PDF se ha descargado en tu dispositivo. Adjúntalo al email que se ha abierto en tu cliente de correo.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Invoice preview ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 lg:p-8 text-sm">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          {[{ label: 'Emisor', party: state.company }, { label: 'Cliente', party: client }].map(({ label, party }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
              <p className="font-semibold text-gray-900 dark:text-white">{party?.name || '-'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{party?.cif}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{party?.address}{party?.city ? `, ${party.city}` : ''}</p>
            </div>
          ))}
        </div>

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

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-1">
          {doc.notes && <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">Notas:</span> {doc.notes}</p>}
          {state.company.iban && <p className="text-xs text-gray-500 dark:text-gray-400"><span className="font-medium">Datos bancarios:</span> {state.company.iban}</p>}
        </div>
      </div>
    </div>
  )
}
