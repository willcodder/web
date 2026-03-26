import { useState } from 'react'
import { Save, Building2, Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { state, dispatch } = useApp()
  const { dark, toggle } = useTheme()
  const [form, setForm] = useState({ ...state.company })
  const [saved, setSaved] = useState(false)

  function save() {
    dispatch({ type: 'UPDATE_COMPANY', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = "w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
  const cardCls = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"

  const Field = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} value={form[field] || ''} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} placeholder={placeholder} className={inputCls} />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      {/* Company */}
      <div className={cardCls}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Datos de la empresa</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Aparecerán en tus facturas y presupuestos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><Field label="Razón social" field="name" placeholder="Mi Productora Audiovisual S.L." /></div>
          <Field label="CIF / NIF" field="cif" placeholder="B12345678" />
          <Field label="Teléfono" field="phone" placeholder="+34 91 123 45 67" />
          <div className="sm:col-span-2"><Field label="Email" field="email" type="email" placeholder="info@empresa.es" /></div>
          <div className="sm:col-span-2"><Field label="Dirección" field="address" placeholder="Calle Gran Vía 28, 3º" /></div>
          <Field label="Ciudad" field="city" placeholder="Madrid" />
          <Field label="Código postal" field="zip" placeholder="28001" />
          <div className="sm:col-span-2"><Field label="IBAN" field="iban" placeholder="ES91 2100 0418 4502 0005 1332" /></div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={save} className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
            <Save size={16} />{saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className={cardCls}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Apariencia</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Modo oscuro</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cambia el tema de la aplicación</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform flex items-center justify-center ${dark ? 'translate-x-6' : 'translate-x-0'}`}>
              {dark ? <Moon size={10} className="text-primary-600" /> : <Sun size={10} className="text-yellow-500" />}
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={cardCls}>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Estadísticas</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Resumen de datos almacenados</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Facturas', value: state.invoices.length },
            { label: 'Presupuestos', value: state.quotes.length },
            { label: 'Clientes', value: state.clients.length },
            { label: 'Servicios', value: state.products.length },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{s.label}</p>
              <p className="font-bold text-gray-900 dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">Los datos se guardan localmente en tu navegador.</p>
      </div>
    </div>
  )
}
