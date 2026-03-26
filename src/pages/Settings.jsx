import { useState } from 'react'
import { Save, Building2 } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Settings() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState({ ...state.company })
  const [saved, setSaved] = useState(false)

  function save() {
    dispatch({ type: 'UPDATE_COMPANY', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Field = ({ label, field, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[field] || ''}
        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Datos de la empresa</h2>
            <p className="text-sm text-gray-500">Aparecerán en tus facturas y presupuestos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Razón social" field="name" placeholder="Mi Productora Audiovisual S.L." />
          </div>
          <Field label="CIF / NIF" field="cif" placeholder="B12345678" />
          <Field label="Teléfono" field="phone" placeholder="+34 91 123 45 67" />
          <div className="sm:col-span-2">
            <Field label="Email" field="email" type="email" placeholder="info@empresa.es" />
          </div>
          <div className="sm:col-span-2">
            <Field label="Dirección" field="address" placeholder="Calle Gran Vía 28, 3º" />
          </div>
          <Field label="Ciudad" field="city" placeholder="Madrid" />
          <Field label="Código postal" field="zip" placeholder="28001" />
          <div className="sm:col-span-2">
            <Field label="IBAN (para datos bancarios en facturas)" field="iban" placeholder="ES91 2100 0418 4502 0005 1332" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={save}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            <Save size={16} />
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* App info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Sobre la aplicación</h2>
        <p className="text-sm text-gray-500 mb-4">Sistema de facturación para productoras audiovisuales</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Facturas totales</p>
            <p className="font-bold text-gray-900">{state.invoices.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Clientes</p>
            <p className="font-bold text-gray-900">{state.clients.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Servicios en catálogo</p>
            <p className="font-bold text-gray-900">{state.products.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Presupuestos</p>
            <p className="font-bold text-gray-900">{state.quotes.length}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Los datos se guardan localmente en tu navegador.</p>
      </div>
    </div>
  )
}
