import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ChevronDown, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Try to auto-detect common Spanish/English column names
const FIELD_HINTS = {
  number:   ['numero', 'número', 'nº', 'factura', 'invoice', 'ref', 'referencia', 'num'],
  date:     ['fecha', 'date', 'fecha emisión', 'fecha emision', 'emision', 'emisión'],
  client:   ['cliente', 'client', 'empresa', 'company', 'nombre cliente', 'razon social', 'razón social'],
  subtotal: ['base', 'base imponible', 'subtotal', 'neto', 'importe neto', 'base imp'],
  tax:      ['iva', 'tax', 'impuesto', 'vat', 'iva %', '% iva'],
  total:    ['total', 'importe', 'total factura', 'amount', 'total eur', 'importe total'],
  status:   ['estado', 'status', 'pagado', 'paid', 'cobrado'],
  notes:    ['notas', 'notes', 'concepto', 'descripcion', 'descripción', 'observaciones'],
}

const APP_FIELDS = [
  { key: 'number',   label: 'Nº Factura',      required: false },
  { key: 'date',     label: 'Fecha',            required: true  },
  { key: 'client',   label: 'Cliente',          required: true  },
  { key: 'subtotal', label: 'Base imponible',   required: false },
  { key: 'tax',      label: 'IVA (%)',          required: false },
  { key: 'total',    label: 'Total',            required: false },
  { key: 'status',   label: 'Estado',           required: false },
  { key: 'notes',    label: 'Notas / Concepto', required: false },
]

function guessMapping(headers) {
  const mapping = {}
  headers.forEach(h => {
    const normalized = String(h).toLowerCase().trim()
    for (const [field, hints] of Object.entries(FIELD_HINTS)) {
      if (!mapping[field] && hints.some(hint => normalized.includes(hint))) {
        mapping[field] = h
      }
    }
  })
  return mapping
}

function parseDate(val) {
  if (!val) return ''
  // Excel serial number
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val)
    if (d) return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`
  }
  // String: try dd/mm/yyyy or yyyy-mm-dd
  const s = String(val).trim()
  const dm = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dm) {
    const y = dm[3].length === 2 ? '20' + dm[3] : dm[3]
    return `${y}-${dm[2].padStart(2,'0')}-${dm[1].padStart(2,'0')}`
  }
  return s
}

function parseStatus(val) {
  if (!val) return 'pending'
  const v = String(val).toLowerCase().trim()
  if (['pagado','cobrado','paid','sí','si','yes','1'].includes(v)) return 'paid'
  if (['borrador','draft'].includes(v)) return 'draft'
  return 'pending'
}

export default function ImportExcel() {
  const { state, dispatch } = useApp()
  const fileRef = useRef(null)

  const [rows, setRows]         = useState(null)   // raw Excel rows
  const [headers, setHeaders]   = useState([])
  const [mapping, setMapping]   = useState({})
  const [preview, setPreview]   = useState([])
  const [step, setStep]         = useState('upload') // upload | map | confirm | done
  const [imported, setImported] = useState(0)
  const [fileName, setFileName] = useState('')

  function handleFile(file) {
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: 'array', cellDates: false })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const data = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true })
      if (!data.length) return
      const hdrs = Object.keys(data[0])
      setHeaders(hdrs)
      setRows(data)
      setMapping(guessMapping(hdrs))
      setPreview(data.slice(0, 5))
      setStep('map')
    }
    reader.readAsArrayBuffer(file)
  }

  function doImport() {
    const existingClients = state.clients
    const newClients = []
    const newInvoices = []

    rows.forEach((row, i) => {
      const clientName = mapping.client ? String(row[mapping.client] || '').trim() : 'Cliente sin nombre'
      if (!clientName) return

      // Find or create client
      let client = existingClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
                || newClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        client = { id: `imp-c-${Date.now()}-${i}`, name: clientName, email: '', phone: '', address: '', nif: '' }
        newClients.push(client)
      }

      const rawTotal    = mapping.total    ? parseFloat(row[mapping.total])    || 0 : 0
      const rawSubtotal = mapping.subtotal ? parseFloat(row[mapping.subtotal]) || 0 : rawTotal
      const rawTax      = mapping.tax      ? parseFloat(row[mapping.tax])      || 21 : (rawSubtotal ? 21 : 0)
      const date        = mapping.date     ? parseDate(row[mapping.date]) : new Date().toISOString().slice(0,10)
      const number      = mapping.number   ? String(row[mapping.number] || '').trim() || `IMP-${i+1}` : `IMP-${i+1}`
      const notes       = mapping.notes    ? String(row[mapping.notes] || '').trim() : ''
      const status      = mapping.status   ? parseStatus(row[mapping.status]) : 'paid'

      // Build a single line from imported totals
      const unitPrice = rawSubtotal || rawTotal / (1 + rawTax / 100)
      newInvoices.push({
        id:          `imp-${Date.now()}-${i}`,
        number,
        date,
        clientId:    client.id,
        status,
        tipoFactura: 'nacional',
        notes,
        lines: [{
          id:          `imp-l-${i}`,
          description: notes || clientName,
          quantity:    1,
          unitPrice:   Math.round(unitPrice * 100) / 100,
          tax:         rawTax,
        }],
      })
    })

    newClients.forEach(c  => dispatch({ type: 'ADD_CLIENT',  payload: c }))
    newInvoices.forEach(inv => dispatch({ type: 'ADD_INVOICE', payload: inv }))
    setImported(newInvoices.length)
    setStep('done')
  }

  function reset() {
    setRows(null); setHeaders([]); setMapping({}); setPreview([])
    setStep('upload'); setImported(0); setFileName('')
  }

  const selectCls = "w-full px-3 py-2 rounded-xl text-[12px] border border-gray-200 dark:border-[#3A3A3C] bg-white dark:bg-[#2C2C2E] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#007AFF]"

  return (
    <div>
      {/* STEP: upload */}
      {step === 'upload' && (
        <div
          onClick={() => fileRef.current.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          className="border-2 border-dashed border-gray-200 dark:border-[#3A3A3C] rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/[0.02] transition-colors"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#34C759]/10 flex items-center justify-center">
            <FileSpreadsheet size={22} className="text-[#34C759]" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-gray-800 dark:text-white">Arrastra tu Excel aquí</p>
            <p className="text-[12px] text-gray-400 dark:text-[#636366] mt-0.5">o haz clic para seleccionar · .xlsx, .xls, .csv</p>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}

      {/* STEP: map */}
      {step === 'map' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={15} className="text-[#34C759]" />
              <span className="text-[13px] font-medium text-gray-700 dark:text-gray-300">{fileName}</span>
              <span className="text-[11px] text-gray-400">· {rows.length} filas</span>
            </div>
            <button onClick={reset} className="text-gray-400 hover:text-[#FF3B30] transition-colors">
              <X size={15} />
            </button>
          </div>

          <p className="text-[12px] text-gray-500 dark:text-[#8E8E93]">
            Relaciona las columnas de tu Excel con los campos de la app. He intentado detectarlas automáticamente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {APP_FIELDS.map(({ key, label, required }) => (
              <div key={key}>
                <label className="block text-[11px] font-medium text-gray-500 dark:text-[#8E8E93] mb-1">
                  {label}{required && <span className="text-[#FF3B30] ml-0.5">*</span>}
                </label>
                <select value={mapping[key] || ''} onChange={e => setMapping(m => ({ ...m, [key]: e.target.value || undefined }))} className={selectCls}>
                  <option value="">(no importar)</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Preview table */}
          {preview.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-gray-500 dark:text-[#8E8E93] mb-2">Vista previa (5 primeras filas)</p>
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-[#3A3A3C]">
                <table className="text-[11px] w-full">
                  <thead className="bg-gray-50 dark:bg-[#2C2C2E]">
                    <tr>
                      {Object.values(mapping).filter(Boolean).slice(0, 6).map(col => (
                        <th key={col} className="px-3 py-2 text-left font-medium text-gray-500 dark:text-[#8E8E93] whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100 dark:border-[#3A3A3C]">
                        {Object.values(mapping).filter(Boolean).slice(0, 6).map(col => (
                          <td key={col} className="px-3 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap max-w-[120px] truncate">
                            {String(row[col] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={reset} className="px-4 py-2 text-[13px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Cancelar
            </button>
            <button
              onClick={doImport}
              disabled={!mapping.client && !mapping.date}
              className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-[#007AFF] text-white hover:bg-[#0062CC] disabled:opacity-40 transition-colors flex items-center gap-2"
            >
              <Upload size={13} />
              Importar {rows?.length} facturas
            </button>
          </div>
        </div>
      )}

      {/* STEP: done */}
      {step === 'done' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center">
            <CheckCircle size={24} className="text-[#34C759]" />
          </div>
          <p className="text-[15px] font-semibold text-gray-900 dark:text-white">{imported} facturas importadas</p>
          <p className="text-[12px] text-gray-400 dark:text-[#636366]">Clientes nuevos creados automáticamente</p>
          <button onClick={reset} className="mt-2 px-4 py-2 text-[13px] text-[#007AFF] hover:underline">
            Importar otro archivo
          </button>
        </div>
      )}
    </div>
  )
}
