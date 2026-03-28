import { useState } from 'react'
import { Save, Building2, Moon, Sun, Receipt, Globe } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { state, dispatch } = useApp()
  const { dark, toggle } = useTheme()
  const [form, setForm]   = useState({ ...state.company })
  const [saved, setSaved] = useState(false)

  function save() {
    dispatch({ type: 'UPDATE_COMPANY', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white placeholder-gray-400"
  const cardCls  = "bg-white dark:bg-[#1C1C1E] rounded-xl2 shadow-card p-6"

  const Field = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-[12px] font-medium text-gray-500 dark:text-[#8E8E93] mb-1.5">{label}</label>
      <input
        type={type}
        value={form[field] || ''}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  )

  const isAutonomo = form.tipo === 'autonomo'

  return (
    <div className="max-w-2xl space-y-5">

      {/* ── Datos de empresa ── */}
      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(145deg,#007AFF,#0055b3)' }}
          >
            <Building2 size={17} className="text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">Datos de empresa</h2>
            <p className="text-[12px] text-gray-400 dark:text-[#636366]">Aparecen en tus facturas y PDFs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Field label="Razón social / Nombre" field="name" placeholder="Mi Productora Audiovisual S.L." /></div>
          <Field label={isAutonomo ? 'DNI / NIE' : 'CIF / NIF'} field="cif" placeholder={isAutonomo ? '12345678A' : 'B12345678'} />
          <Field label="Teléfono" field="phone" placeholder="+34 91 123 45 67" />
          <div className="sm:col-span-2"><Field label="Email" field="email" type="email" placeholder="info@empresa.es" /></div>
          <div className="sm:col-span-2"><Field label="Dirección" field="address" placeholder="Calle Gran Vía 28, 3º" /></div>
          <Field label="Ciudad" field="city" placeholder="Madrid" />
          <Field label="Código postal" field="zip" placeholder="28001" />
          <div className="sm:col-span-2"><Field label="IBAN" field="iban" placeholder="ES91 2100 0418 4502 0005 1332" /></div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={save}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-xl transition-colors ${
              saved ? 'bg-[#34C759] text-white' : 'bg-[#007AFF] text-white hover:bg-[#0062CC]'
            }`}
          >
            <Save size={14} />
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* ── Configuración fiscal ── */}
      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(145deg,#FF9500,#c97200)' }}
          >
            <Receipt size={17} className="text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">Configuración fiscal</h2>
            <p className="text-[12px] text-gray-400 dark:text-[#636366]">Afecta a cómo se calculan tus facturas</p>
          </div>
        </div>

        {/* Empresa / Autónomo segmented control */}
        <div className="mb-5">
          <p className="text-[12px] font-medium text-gray-500 dark:text-[#8E8E93] mb-2">Tipo de contribuyente</p>
          <div className="flex rounded-xl bg-gray-100 dark:bg-[#2C2C2E] p-1 w-full sm:w-72">
            {[
              { value: 'empresa',  label: 'Empresa' },
              { value: 'autonomo', label: 'Autónomo' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setForm(f => ({ ...f, tipo: opt.value }))}
                className={`
                  flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-150
                  ${form.tipo === opt.value
                    ? 'bg-white dark:bg-[#3A3A3C] text-gray-900 dark:text-white shadow-xs'
                    : 'text-gray-500 dark:text-[#8E8E93] hover:text-gray-700 dark:hover:text-gray-300'
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* IRPF — solo visible si autónomo */}
        {isAutonomo && (
          <div className="mb-5 animate-slide-in">
            <p className="text-[12px] font-medium text-gray-500 dark:text-[#8E8E93] mb-2">Retención IRPF</p>
            <div className="flex gap-2 flex-wrap">
              {[7, 15].map(pct => (
                <button
                  key={pct}
                  onClick={() => setForm(f => ({ ...f, irpf: pct }))}
                  className={`
                    px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors
                    ${form.irpf === pct
                      ? 'bg-[#007AFF] border-[#007AFF] text-white'
                      : 'bg-white dark:bg-[#2C2C2E] border-gray-200 dark:border-[#3A3A3C] text-gray-600 dark:text-gray-300 hover:border-[#007AFF]'
                    }
                  `}
                >
                  {pct}%
                  <span className="ml-1.5 text-[10px] font-normal opacity-70">
                    {pct === 7 ? '(nuevo autónomo)' : '(general)'}
                  </span>
                </button>
              ))}
              {/* Personalizado */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setForm(f => ({ ...f, irpf: f.irpf === 7 || f.irpf === 15 ? 1 : f.irpf }))}
                  className={`
                    px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors
                    ${form.irpf !== 7 && form.irpf !== 15
                      ? 'bg-[#007AFF] border-[#007AFF] text-white'
                      : 'bg-white dark:bg-[#2C2C2E] border-gray-200 dark:border-[#3A3A3C] text-gray-600 dark:text-gray-300 hover:border-[#007AFF]'
                    }
                  `}
                >
                  Personalizado
                </button>
                {form.irpf !== 7 && form.irpf !== 15 && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={form.irpf}
                      onChange={e => setForm(f => ({ ...f, irpf: parseFloat(e.target.value) || 0 }))}
                      className="w-16 px-2 py-2 text-[13px] text-center border border-gray-200 dark:border-[#3A3A3C] rounded-xl bg-white dark:bg-[#2C2C2E] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    />
                    <span className="text-[13px] text-gray-500">%</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-gray-400 dark:text-[#636366] mt-2">
              La retención se aplica automáticamente en facturas nacionales y se descuenta del total a pagar.
            </p>
          </div>
        )}

        {/* Nota informativa */}
        <div className="bg-[#007AFF]/[0.06] dark:bg-[#007AFF]/[0.08] rounded-xl p-3.5">
          <div className="flex items-start gap-2.5">
            <Globe size={14} className="text-[#007AFF] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[12px] font-medium text-[#0062cc] dark:text-[#409cff]">Facturas internacionales</p>
              <p className="text-[11px] text-[#007AFF]/80 dark:text-[#409cff]/80 mt-0.5">
                Para facturas fuera de España puedes seleccionar el tipo "Intracomunitaria" o "Extracomunitaria" al crear cada factura. Se aplicará IVA 0% y la nota legal correspondiente automáticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={save}
            className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold rounded-xl transition-colors ${
              saved ? 'bg-[#34C759] text-white' : 'bg-[#007AFF] text-white hover:bg-[#0062CC]'
            }`}
          >
            <Save size={14} />
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* ── Apariencia ── */}
      <div className={cardCls}>
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight mb-4">Apariencia</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300">Modo oscuro</p>
            <p className="text-[11px] text-gray-400 dark:text-[#636366]">Cambia el tema de la aplicación</p>
          </div>
          <button
            onClick={toggle}
            aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'}
            className={`relative w-12 h-7 rounded-full transition-colors ${dark ? 'bg-[#007AFF]' : 'bg-gray-200 dark:bg-[#3A3A3C]'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform shadow-xs flex items-center justify-center ${dark ? 'translate-x-5' : 'translate-x-0'}`}>
              {dark ? <Moon size={9} className="text-[#007AFF]" /> : <Sun size={9} className="text-yellow-500" />}
            </span>
          </button>
        </div>
      </div>

      {/* ── Estadísticas ── */}
      <div className={cardCls}>
        <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight mb-1">Estadísticas</h2>
        <p className="text-[12px] text-gray-400 dark:text-[#636366] mb-4">Datos almacenados localmente</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Facturas',      value: state.invoices.length },
            { label: 'Presupuestos',  value: state.quotes.length },
            { label: 'Clientes',      value: state.clients.length },
            { label: 'Servicios',     value: state.products.length },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-[#2C2C2E] rounded-xl p-3.5">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 dark:text-[#636366] mb-1 font-medium">{s.label}</p>
              <p className="text-[22px] font-bold text-gray-900 dark:text-white tabular-nums leading-none">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 dark:text-[#636366] mt-4">Los datos se guardan en tu navegador (localStorage).</p>
      </div>
    </div>
  )
}
