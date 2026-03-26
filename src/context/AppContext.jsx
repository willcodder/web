import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const initialState = {
  company: {
    name: 'Mi Productora Audiovisual S.L.',
    cif: 'B12345678',
    address: 'Calle Gran Vía 28, 3º',
    city: 'Madrid',
    zip: '28013',
    phone: '+34 91 123 45 67',
    email: 'info@miproductora.es',
    iban: 'ES91 2100 0418 4502 0005 1332',
  },
  clients: [
    {
      id: 'c1',
      name: 'Agencia Creativa S.L.',
      cif: 'B98765432',
      email: 'contacto@agenciacreativa.es',
      phone: '+34 91 987 65 43',
      address: 'Calle Serrano 45, 1º',
      city: 'Madrid',
      zip: '28001',
      createdAt: '2025-01-10',
    },
    {
      id: 'c2',
      name: 'Marca Premium S.A.',
      cif: 'A11223344',
      email: 'proyectos@marcapremium.com',
      phone: '+34 93 456 78 90',
      address: 'Passeig de Gràcia 100',
      city: 'Barcelona',
      zip: '08008',
      createdAt: '2025-02-15',
    },
    {
      id: 'c3',
      name: 'Festival de Cine Indie',
      cif: 'G55667788',
      email: 'produccion@festivalinde.es',
      phone: '+34 96 321 00 11',
      address: 'Av. de la Constitución 12',
      city: 'Valencia',
      zip: '46003',
      createdAt: '2025-03-01',
    },
  ],
  products: [
    { id: 'p1', name: 'Día de rodaje (equipo completo)', price: 2500, unit: 'día', category: 'Producción', tax: 21 },
    { id: 'p2', name: 'Medio día de rodaje', price: 1400, unit: 'medio día', category: 'Producción', tax: 21 },
    { id: 'p3', name: 'Dirección de fotografía', price: 800, unit: 'día', category: 'Producción', tax: 21 },
    { id: 'p4', name: 'Edición de vídeo (hora finalizada)', price: 350, unit: 'hora', category: 'Postproducción', tax: 21 },
    { id: 'p5', name: 'Colorización profesional', price: 600, unit: 'día', category: 'Postproducción', tax: 21 },
    { id: 'p6', name: 'Diseño de motion graphics', price: 450, unit: 'día', category: 'Postproducción', tax: 21 },
    { id: 'p7', name: 'Locución en off', price: 200, unit: 'pieza', category: 'Audio', tax: 21 },
    { id: 'p8', name: 'Mezcla y masterización de audio', price: 300, unit: 'proyecto', category: 'Audio', tax: 21 },
    { id: 'p9', name: 'Música original (composición)', price: 800, unit: 'pieza', category: 'Audio', tax: 21 },
    { id: 'p10', name: 'Spot publicitario (hasta 30s)', price: 4500, unit: 'proyecto', category: 'Producción', tax: 21 },
    { id: 'p11', name: 'Vídeo corporativo (hasta 3 min)', price: 3500, unit: 'proyecto', category: 'Producción', tax: 21 },
    { id: 'p12', name: 'Fotografía de producto (pack 20 fotos)', price: 600, unit: 'pack', category: 'Fotografía', tax: 21 },
    { id: 'p13', name: 'Retoque fotográfico', price: 25, unit: 'foto', category: 'Fotografía', tax: 21 },
    { id: 'p14', name: 'Drone/Aéreo (media jornada)', price: 900, unit: 'media jornada', category: 'Producción', tax: 21 },
    { id: 'p15', name: 'Streaming en directo', price: 1200, unit: 'evento', category: 'Producción', tax: 21 },
  ],
  invoices: [
    {
      id: 'inv1',
      number: 'FAC-2025-001',
      clientId: 'c1',
      date: '2025-01-20',
      dueDate: '2025-02-20',
      status: 'paid',
      lines: [
        { productId: 'p10', description: 'Spot publicitario para campaña verano', quantity: 1, price: 4500, tax: 21 },
        { productId: 'p6', description: 'Motion graphics logo animado', quantity: 2, price: 450, tax: 21 },
      ],
      notes: 'Gracias por confiar en nosotros.',
    },
    {
      id: 'inv2',
      number: 'FAC-2025-002',
      clientId: 'c2',
      date: '2025-02-05',
      dueDate: '2025-03-07',
      status: 'paid',
      lines: [
        { productId: 'p11', description: 'Vídeo corporativo presentación empresa', quantity: 1, price: 3500, tax: 21 },
        { productId: 'p5', description: 'Colorización cinematográfica', quantity: 1, price: 600, tax: 21 },
      ],
      notes: '',
    },
    {
      id: 'inv3',
      number: 'FAC-2025-003',
      clientId: 'c3',
      date: '2025-03-10',
      dueDate: '2025-04-10',
      status: 'pending',
      lines: [
        { productId: 'p1', description: 'Rodaje 2 días - cobertura festival', quantity: 2, price: 2500, tax: 21 },
        { productId: 'p4', description: 'Edición 8h de material', quantity: 8, price: 350, tax: 21 },
        { productId: 'p8', description: 'Mezcla de audio del documental', quantity: 1, price: 300, tax: 21 },
      ],
      notes: 'Pendiente de aprobación del corte final.',
    },
    {
      id: 'inv4',
      number: 'FAC-2025-004',
      clientId: 'c1',
      date: '2025-03-18',
      dueDate: '2025-04-18',
      status: 'draft',
      lines: [
        { productId: 'p14', description: 'Tomas aéreas con drone para inmobiliaria', quantity: 2, price: 900, tax: 21 },
        { productId: 'p13', description: 'Retoque fotográfico inmuebles', quantity: 40, price: 25, tax: 21 },
      ],
      notes: '',
    },
  ],
  quotes: [
    {
      id: 'q1',
      number: 'PRE-2025-001',
      clientId: 'c2',
      date: '2025-03-01',
      validUntil: '2025-04-01',
      status: 'accepted',
      lines: [
        { productId: 'p11', description: 'Vídeo corporativo presentación empresa', quantity: 1, price: 3500, tax: 21 },
        { productId: 'p5', description: 'Colorización cinematográfica', quantity: 1, price: 600, tax: 21 },
      ],
      notes: 'Presupuesto sujeto a cambios en el guión.',
    },
    {
      id: 'q2',
      number: 'PRE-2025-002',
      clientId: 'c3',
      date: '2025-03-08',
      validUntil: '2025-04-08',
      status: 'pending',
      lines: [
        { productId: 'p15', description: 'Streaming gala de premios', quantity: 1, price: 1200, tax: 21 },
        { productId: 'p7', description: 'Locución presentación', quantity: 2, price: 200, tax: 21 },
      ],
      notes: '',
    },
  ],
  expenses: [
    { id: 'e1', description: 'Alquiler cámara RED MONSTRO 8K', amount: 1200, tax: 21, category: 'Equipamiento', date: '2025-01-15', provider: 'CineEquip Madrid', status: 'paid' },
    { id: 'e2', description: 'Licencia Adobe Creative Cloud (anual)', amount: 659.88, tax: 21, category: 'Software', date: '2025-01-02', provider: 'Adobe Inc.', status: 'paid' },
    { id: 'e3', description: 'Gasolina desplazamiento rodaje Barcelona', amount: 85, tax: 21, category: 'Transporte', date: '2025-02-06', provider: 'Repsol', status: 'paid' },
    { id: 'e4', description: 'Stock de música libre de derechos (anual)', amount: 199, tax: 21, category: 'Licencias', date: '2025-02-10', provider: 'Epidemic Sound', status: 'paid' },
    { id: 'e5', description: 'Alquiler estudio grabación (1 día)', amount: 350, tax: 21, category: 'Espacios', date: '2025-03-12', provider: 'Studio Madrid Pro', status: 'pending' },
    { id: 'e6', description: 'Dietas equipo técnico (3 personas)', amount: 120, tax: 0, category: 'Dietas', date: '2025-03-10', provider: 'Varios', status: 'paid' },
  ],
}

function loadState() {
  try {
    const saved = localStorage.getItem('audiovisual_app_state')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading state', e)
  }
  return initialState
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_COMPANY':
      return { ...state, company: { ...state.company, ...action.payload } }

    case 'ADD_CLIENT':
      return { ...state, clients: [...state.clients, action.payload] }
    case 'UPDATE_CLIENT':
      return { ...state, clients: state.clients.map(c => c.id === action.payload.id ? action.payload : c) }
    case 'DELETE_CLIENT':
      return { ...state, clients: state.clients.filter(c => c.id !== action.payload) }

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] }
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.payload.id ? action.payload : p) }
    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter(p => p.id !== action.payload) }

    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] }
    case 'ADD_INVOICES_BATCH':
      return { ...state, invoices: [...state.invoices, ...action.payload] }
    case 'UPDATE_INVOICE':
      return { ...state, invoices: state.invoices.map(i => i.id === action.payload.id ? action.payload : i) }
    case 'DELETE_INVOICE':
      return { ...state, invoices: state.invoices.filter(i => i.id !== action.payload) }

    case 'ADD_QUOTE':
      return { ...state, quotes: [...state.quotes, action.payload] }
    case 'UPDATE_QUOTE':
      return { ...state, quotes: state.quotes.map(q => q.id === action.payload.id ? action.payload : q) }
    case 'DELETE_QUOTE':
      return { ...state, quotes: state.quotes.filter(q => q.id !== action.payload) }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'UPDATE_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) }

    default:
      return state
  }
}

function getNextDate(dateStr, recurring) {
  const d = new Date(dateStr)
  if (recurring === 'monthly') d.setMonth(d.getMonth() + 1)
  else if (recurring === 'quarterly') d.setMonth(d.getMonth() + 3)
  else if (recurring === 'yearly') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

function generateRecurringInvoices(invoices) {
  const today = new Date().toISOString().split('T')[0]
  const newInvoices = []
  const processed = new Set(localStorage.getItem('recurring_processed') ? JSON.parse(localStorage.getItem('recurring_processed')) : [])

  invoices.forEach(inv => {
    if (!inv.recurring || inv.status === 'draft') return
    const nextDate = getNextDate(inv.date, inv.recurring)
    const key = `${inv.id}_${nextDate}`
    if (nextDate <= today && !processed.has(key) && !invoices.find(i => i.number !== inv.number && i.clientId === inv.clientId && i.date === nextDate)) {
      const yearNum = new Date(nextDate).getFullYear()
      const existingNums = invoices.map(i => i.number).concat(newInvoices.map(i => i.number))
      const maxNum = existingNums.filter(n => n?.includes(`${yearNum}`)).map(n => parseInt(n.split('-').pop())).filter(n => !isNaN(n))
      const nextNum = maxNum.length ? Math.max(...maxNum) + 1 + newInvoices.length : invoices.length + 1
      const number = `FAC-${yearNum}-${String(nextNum).padStart(3, '0')}`
      const dueDate = getNextDate(nextDate, 'monthly')
      newInvoices.push({ ...inv, id: `inv${Date.now()}${Math.random().toString(36).slice(2,5)}`, number, date: nextDate, dueDate, status: 'pending' })
      processed.add(key)
    }
  })

  if (newInvoices.length) {
    localStorage.setItem('recurring_processed', JSON.stringify([...processed]))
  }
  return newInvoices
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  // Generate recurring invoices on mount
  useEffect(() => {
    const newInvoices = generateRecurringInvoices(state.invoices)
    if (newInvoices.length > 0) {
      dispatch({ type: 'ADD_INVOICES_BATCH', payload: newInvoices })
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('audiovisual_app_state', JSON.stringify(state))
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
