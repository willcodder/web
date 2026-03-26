import { generateInvoicePDF, getInvoiceFileName } from './generatePDF'
import { calcDocumentTotals, formatCurrency, formatDate } from './calculations'

function buildEmailBody(doc, client, company, type) {
  const docName = type === 'invoice' ? 'factura' : 'presupuesto'
  const totals = calcDocumentTotals(doc.lines)
  const linesText = doc.lines
    .map(l => `  • ${l.description}  ×${l.quantity}  ${formatCurrency(l.quantity * l.price)}`)
    .join('\n')

  return `Estimado/a ${client?.name || 'cliente'},

Le enviamos adjunto ${docName === 'factura' ? 'la' : 'el'} ${docName} ${doc.number} con fecha ${formatDate(doc.date)}.

DETALLE:
${linesText}

Base imponible:  ${formatCurrency(totals.subtotal)}
IVA:             ${formatCurrency(totals.tax)}
TOTAL:           ${formatCurrency(totals.total)}
${doc.notes ? `\nNotas: ${doc.notes}` : ''}${company.iban ? `\nDatos bancarios: ${company.iban}` : ''}

Para cualquier consulta estamos a su disposición.

Un saludo,
${company.name}
${company.phone}  |  ${company.email}`
}

/**
 * Main function: generates the PDF and sends it.
 *
 * Strategy:
 *  - Mobile/tablet: Web Share API → opens native share sheet with PDF attached
 *    (user picks their email app: Mail, Gmail, Outlook, etc.)
 *  - Desktop or no Share API: downloads the PDF + opens mailto pre-filled
 *
 * Returns { success, method, error? }
 */
export async function sendInvoiceByEmail(doc, client, company, type = 'invoice') {
  const fileName = getInvoiceFileName(doc, type)
  const docName = type === 'invoice' ? 'Factura' : 'Presupuesto'
  const subject = `${docName} ${doc.number} – ${company.name}`
  const body = buildEmailBody(doc, client, company, type)

  let pdfBlob
  try {
    pdfBlob = await generateInvoicePDF(doc, client, company, type)
  } catch (err) {
    console.error('PDF generation error', err)
    return { success: false, error: 'No se pudo generar el PDF.' }
  }

  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' })

  // ── Móvil: Web Share API con el PDF adjunto ───────────────────────────────
  const canShare = typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [pdfFile] })

  if (canShare) {
    try {
      await navigator.share({
        title: subject,
        text: body,
        files: [pdfFile],
      })
      return { success: true, method: 'share' }
    } catch (err) {
      if (err.name === 'AbortError') return { success: false, error: 'Compartir cancelado.' }
      // fallthrough to download+mailto
    }
  }

  // ── Escritorio: descarga PDF + abre cliente de correo ─────────────────────
  const blobUrl = URL.createObjectURL(pdfBlob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(blobUrl)

  // Small delay so the download starts before the email client opens
  await new Promise(r => setTimeout(r, 600))

  const to = client?.email ? encodeURIComponent(client.email) : ''
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailtoUrl

  return { success: true, method: 'download+mailto' }
}
