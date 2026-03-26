import jsPDF from 'jspdf'
import { calcDocumentTotals, calcLineSubtotal, formatCurrency, formatDate } from './calculations'

/**
 * Generates an invoice/quote PDF using jsPDF.
 * Returns a Blob so it can be shared or downloaded.
 */
export async function generateInvoicePDF(doc, client, company, type = 'invoice') {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const totals = calcDocumentTotals(doc.lines)
  const docTitle = type === 'invoice' ? 'FACTURA' : 'PRESUPUESTO'
  const dateLabel2 = type === 'invoice' ? 'Vence' : 'Válido hasta'
  const dateValue2 = type === 'invoice' ? doc.dueDate : doc.validUntil

  const pageW = 210
  const pageH = 297
  const margin = 18
  const contentW = pageW - margin * 2

  // ── Helpers ──────────────────────────────────────────────────────────────
  function setFont(size, style = 'normal', color = [30, 30, 50]) {
    pdf.setFontSize(size)
    pdf.setFont('helvetica', style)
    pdf.setTextColor(...color)
  }

  function drawRect(x, y, w, h, fillColor) {
    pdf.setFillColor(...fillColor)
    pdf.rect(x, y, w, h, 'F')
  }

  function hrLine(y, color = [229, 231, 235]) {
    pdf.setDrawColor(...color)
    pdf.setLineWidth(0.3)
    pdf.line(margin, y, pageW - margin, y)
  }

  // ── Header band ──────────────────────────────────────────────────────────
  drawRect(0, 0, pageW, 36, [74, 82, 232]) // primary-600

  // Company name
  setFont(14, 'bold', [255, 255, 255])
  pdf.text(company.name, margin, 14)

  setFont(8, 'normal', [200, 206, 255])
  const companyInfo = [company.cif, `${company.address}, ${company.city}`, company.phone, company.email].filter(Boolean)
  pdf.text(companyInfo.join('  ·  '), margin, 21)

  // Doc type + number (right side)
  setFont(20, 'bold', [255, 255, 255])
  pdf.text(docTitle, pageW - margin, 13, { align: 'right' })

  setFont(9, 'normal', [200, 206, 255])
  pdf.text(doc.number, pageW - margin, 21, { align: 'right' })
  pdf.text(`Fecha: ${formatDate(doc.date)}   ${dateLabel2}: ${formatDate(dateValue2)}`, pageW - margin, 27, { align: 'right' })

  // ── Parties section ───────────────────────────────────────────────────────
  let y = 46
  drawRect(margin, y, contentW, 28, [248, 250, 252])
  pdf.setDrawColor(229, 231, 235)
  pdf.setLineWidth(0.2)
  pdf.rect(margin, y, contentW, 28)

  setFont(7, 'bold', [156, 163, 175])
  pdf.text('EMISOR', margin + 5, y + 6)
  pdf.text('CLIENTE / RECEPTOR', margin + contentW / 2 + 5, y + 6)

  setFont(9, 'bold', [17, 24, 39])
  pdf.text(company.name, margin + 5, y + 13)
  pdf.text(client?.name || '-', margin + contentW / 2 + 5, y + 13)

  setFont(8, 'normal', [107, 114, 128])
  pdf.text([company.cif || '', `${company.address || ''}, ${company.city || ''}`], margin + 5, y + 19)
  pdf.text([client?.cif || '', `${client?.address || ''}, ${client?.city || ''}`], margin + contentW / 2 + 5, y + 19)

  // Vertical divider
  pdf.setDrawColor(229, 231, 235)
  pdf.line(margin + contentW / 2, y + 2, margin + contentW / 2, y + 26)

  // ── Lines table ───────────────────────────────────────────────────────────
  y = 84
  const colWidths = [contentW - 70, 16, 22, 14, 18]
  const cols = ['Descripción', 'Cant.', 'Precio', 'IVA', 'Importe']
  const colX = [margin]
  colWidths.forEach((w, i) => colX.push(colX[i] + w))

  // Table header
  drawRect(margin, y, contentW, 7, [243, 244, 246])
  setFont(7, 'bold', [107, 114, 128])
  cols.forEach((h, i) => {
    const align = i === 0 ? 'left' : 'right'
    const x = i === 0 ? colX[i] + 2 : colX[i] + colWidths[i] - 1
    pdf.text(h.toUpperCase(), x, y + 5, { align })
  })
  y += 7

  // Table rows
  doc.lines.forEach((line, idx) => {
    const rowH = 8
    if (idx % 2 === 1) drawRect(margin, y, contentW, rowH, [250, 251, 252])

    setFont(8, 'normal', [55, 65, 81])
    const desc = pdf.splitTextToSize(line.description || '-', colWidths[0] - 4)
    pdf.text(desc[0], colX[0] + 2, y + 5.5)

    const cells = [
      String(line.quantity),
      formatCurrency(line.price),
      `${line.tax}%`,
      formatCurrency(calcLineSubtotal(line)),
    ]
    cells.forEach((val, i) => {
      pdf.text(val, colX[i + 1] + colWidths[i + 1] - 1, y + 5.5, { align: 'right' })
    })
    y += rowH
  })

  hrLine(y + 1, [209, 213, 219])
  y += 5

  // ── Totals ────────────────────────────────────────────────────────────────
  const totW = 70
  const totX = pageW - margin - totW

  function totRow(label, value, bold = false, highlight = false) {
    if (bold) {
      drawRect(totX - 3, y - 4, totW + 3, 9, [74, 82, 232])
      setFont(10, 'bold', [255, 255, 255])
    } else {
      setFont(8, 'normal', [107, 114, 128])
    }
    pdf.text(label, totX, y)
    if (bold) {
      pdf.text(value, pageW - margin - 1, y, { align: 'right' })
    } else {
      setFont(8, 'normal', [55, 65, 81])
      pdf.text(value, pageW - margin - 1, y, { align: 'right' })
    }
    y += bold ? 8 : 6
  }

  totRow('Base imponible', formatCurrency(totals.subtotal))
  totals.taxBreakdown.forEach(t => totRow(`IVA ${t.rate}%`, formatCurrency(t.amount)))
  hrLine(y - 2, [209, 213, 219])
  y += 2
  totRow('TOTAL', formatCurrency(totals.total), true)

  // ── Footer ────────────────────────────────────────────────────────────────
  y += 8
  if (doc.notes) {
    setFont(8, 'bold', [107, 114, 128])
    pdf.text('Notas:', margin, y)
    setFont(8, 'normal', [107, 114, 128])
    pdf.text(doc.notes, margin + 12, y)
    y += 6
  }
  if (company.iban) {
    setFont(8, 'bold', [107, 114, 128])
    pdf.text('Datos bancarios:', margin, y)
    setFont(8, 'normal', [107, 114, 128])
    pdf.text(company.iban, margin + 28, y)
    y += 6
  }

  // Bottom line
  drawRect(0, pageH - 10, pageW, 10, [74, 82, 232])
  setFont(7, 'normal', [200, 206, 255])
  pdf.text(`${company.name}  ·  ${company.cif}  ·  ${company.email}`, pageW / 2, pageH - 4, { align: 'center' })

  return pdf.output('blob')
}

export function getInvoiceFileName(doc, type = 'invoice') {
  const prefix = type === 'invoice' ? 'Factura' : 'Presupuesto'
  return `${prefix}_${doc.number.replace(/[/\\]/g, '-')}.pdf`
}
