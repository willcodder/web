import { calcDocumentTotals, calcLineSubtotal, formatCurrency, formatDate } from './calculations'

/**
 * Opens the default email client with the invoice/quote pre-filled.
 */
export function sendInvoiceByEmail(doc, client, company, type = 'invoice') {
  const totals = calcDocumentTotals(doc.lines)
  const docName = type === 'invoice' ? 'Factura' : 'Presupuesto'

  const subject = encodeURIComponent(`${docName} ${doc.number} – ${company.name}`)

  const linesText = doc.lines
    .map(l => `  • ${l.description}  ×${l.quantity}  ${formatCurrency(calcLineSubtotal(l))}`)
    .join('\n')

  const body = encodeURIComponent(`Estimado/a ${client?.name || 'cliente'},

Le enviamos adjunto el ${docName.toLowerCase()} ${doc.number} con fecha ${formatDate(doc.date)}.

DETALLE:
${linesText}

Base imponible: ${formatCurrency(totals.subtotal)}
IVA: ${formatCurrency(totals.tax)}
TOTAL: ${formatCurrency(totals.total)}

${doc.notes ? `Notas: ${doc.notes}\n` : ''}${type === 'invoice' && company.iban ? `Datos bancarios: ${company.iban}\n` : ''}
Para cualquier consulta, no dude en contactarnos.

Un saludo,
${company.name}
${company.phone}  |  ${company.email}
`)

  const to = client?.email ? encodeURIComponent(client.email) : ''
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
}
