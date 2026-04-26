import { useState, useMemo } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts'

// ---------- Helpers ----------
const formatCLP = (n) => {
  if (isNaN(n) || n === null || n === undefined) return '$0'
  return '$' + Math.round(n).toLocaleString('es-CL')
}

const formatPct = (n) => {
  if (isNaN(n) || n === null || n === undefined) return '0%'
  return n.toFixed(1) + '%'
}

const COLORS = ['#6F4E37', '#A98B6C', '#C9B08C', '#E0CFB1', '#8B6F4E', '#5A3E2B', '#D4A574', '#B8956A']

// ---------- Reusable UI ----------
function Card({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-coffee-100 p-5 md:p-6 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-coffee-800 font-semibold text-lg">{title}</h3>
          {subtitle && <p className="text-coffee-500 text-sm mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}

function KPI({ label, value, sub, tone = 'default' }) {
  const tones = {
    default: 'bg-coffee-50 text-coffee-800 border-coffee-200',
    positive: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    negative: 'bg-rose-50 text-rose-800 border-rose-200',
    accent: 'bg-amber-50 text-amber-900 border-amber-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="text-xs uppercase tracking-wide opacity-70 font-medium">{label}</div>
      <div className="text-xl md:text-2xl font-bold mt-1">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-80">{sub}</div>}
    </div>
  )
}

function EditableRow({ item, onChange, onRemove, fields }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-coffee-100 last:border-b-0">
      {fields.map((f, idx) => (
        <div key={f.key} className={f.span || 'col-span-6'}>
          {idx === 0 && <label className="text-xs text-coffee-500 md:hidden">{f.label}</label>}
          <input
            type={f.type || 'text'}
            value={item[f.key] ?? ''}
            onChange={(e) => onChange(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={f.label}
            className="w-full px-3 py-2 border border-coffee-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent"
          />
        </div>
      ))}
      <div className="col-span-12 md:col-span-1 flex justify-end">
        <button
          onClick={onRemove}
          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors"
          title="Eliminar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function AddButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="mt-3 w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors font-medium text-sm shadow-sm"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
      </svg>
      {label}
    </button>
  )
}

// ---------- Main App ----------
export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [nombreNegocio, setNombreNegocio] = useState('Cafetería de Especialidad')
  const [presentador, setPresentador] = useState('Cristóbal Morales')

  // --- Ingresos ---
  const [ingresos, setIngresos] = useState([
    { id: 1, nombre: 'Ventas Café', monto: 3500000 },
    { id: 2, nombre: 'Ventas Pastelería', monto: 2000000 },
    { id: 3, nombre: 'Ventas Almuerzos', monto: 1200000 },
  ])

  // --- Costos Fijos ---
  const [costosFijos, setCostosFijos] = useState([
    { id: 1, nombre: 'Arriendo Local', monto: 800000 },
    { id: 2, nombre: 'Sueldos y Leyes Sociales', monto: 1800000 },
    { id: 3, nombre: 'Servicios Básicos', monto: 180000 },
    { id: 4, nombre: 'Internet y Telefonía', monto: 45000 },
    { id: 5, nombre: 'Contador', monto: 120000 },
  ])

  // --- Costos Variables ---
  const [costosVariables, setCostosVariables] = useState([
    { id: 1, nombre: 'Granos de Café', monto: 650000 },
    { id: 2, nombre: 'Leche y Lácteos', monto: 320000 },
    { id: 3, nombre: 'Insumos Pastelería', monto: 450000 },
    { id: 4, nombre: 'Empaques y Vasos', monto: 150000 },
    { id: 5, nombre: 'Transporte Insumos', monto: 80000 },
  ])

  // --- Impuesto ---
  const [tasaImpuesto, setTasaImpuesto] = useState(27)

  // --- Escenarios ---
  const [escenarios, setEscenarios] = useState({
    negativo: -20,
    medio: 0,
    positivo: 20,
  })

  // --- Activos / Pasivos ---
  const [activos, setActivos] = useState([
    { id: 1, nombre: 'Máquina Espresso Profesional', monto: 4500000 },
    { id: 2, nombre: 'Molino de Café', monto: 800000 },
    { id: 3, nombre: 'Mobiliario y Decoración', monto: 2500000 },
    { id: 4, nombre: 'Caja y Bancos', monto: 1200000 },
    { id: 5, nombre: 'Inventario de Insumos', monto: 900000 },
  ])

  const [pasivos, setPasivos] = useState([
    { id: 1, nombre: 'Crédito Bancario', monto: 3500000 },
    { id: 2, nombre: 'Cuentas por Pagar Proveedores', monto: 450000 },
    { id: 3, nombre: 'Impuestos por Pagar', monto: 280000 },
  ])

  // --- Cartera de Productos ---
  const [productos, setProductos] = useState([
    { id: 1, nombre: 'Espresso', precio: 2500, costo: 400, unidadesMes: 800, crecimiento: 5 },
    { id: 2, nombre: 'Cappuccino', precio: 3500, costo: 700, unidadesMes: 1200, crecimiento: 12 },
    { id: 3, nombre: 'Latte', precio: 3800, costo: 800, unidadesMes: 1000, crecimiento: 15 },
    { id: 4, nombre: 'Croissant', precio: 2800, costo: 900, unidadesMes: 600, crecimiento: 3 },
    { id: 5, nombre: 'Sándwich', precio: 5500, costo: 2200, unidadesMes: 400, crecimiento: 8 },
  ])

  // --- Marketing Mix (7P) ---
  const [marketingMix, setMarketingMix] = useState({
    Producto: 75,
    Precio: 70,
    Plaza: 85,
    Promoción: 55,
    Personas: 80,
    Procesos: 65,
    Presencia: 70,
  })

  // --- Abastecimiento (Compras) ---
  const [compras, setCompras] = useState([
    { id: 1, fecha: '2026-01-15', proveedor: 'Café La Reserva', insumo: 'Café en Grano', cantidad: 10, unidad: 'kg', precioUnitario: 18000, tipoDoc: 'Factura', nDoc: '12453' },
    { id: 2, fecha: '2026-02-12', proveedor: 'Café La Reserva', insumo: 'Café en Grano', cantidad: 10, unidad: 'kg', precioUnitario: 19500, tipoDoc: 'Factura', nDoc: '12891' },
    { id: 3, fecha: '2026-03-14', proveedor: 'Café La Reserva', insumo: 'Café en Grano', cantidad: 12, unidad: 'kg', precioUnitario: 20200, tipoDoc: 'Factura', nDoc: '13247' },
    { id: 4, fecha: '2026-01-20', proveedor: 'Lácteos del Sur', insumo: 'Leche Entera', cantidad: 80, unidad: 'L', precioUnitario: 1200, tipoDoc: 'Factura', nDoc: '8821' },
    { id: 5, fecha: '2026-02-22', proveedor: 'Lácteos del Sur', insumo: 'Leche Entera', cantidad: 80, unidad: 'L', precioUnitario: 1280, tipoDoc: 'Factura', nDoc: '8967' },
    { id: 6, fecha: '2026-03-18', proveedor: 'Lácteos del Sur', insumo: 'Leche Entera', cantidad: 80, unidad: 'L', precioUnitario: 1350, tipoDoc: 'Factura', nDoc: '9102' },
    { id: 7, fecha: '2026-03-05', proveedor: 'Panadería Artesanal', insumo: 'Harina', cantidad: 50, unidad: 'kg', precioUnitario: 950, tipoDoc: 'Boleta', nDoc: '4521' },
    { id: 8, fecha: '2026-03-25', proveedor: 'Empaques Pro', insumo: 'Vasos 12oz', cantidad: 2000, unidad: 'un', precioUnitario: 85, tipoDoc: 'Boleta', nDoc: '7733' },
  ])
  const [ratioBenchmark, setRatioBenchmark] = useState(30) // % objetivo compras/ventas

  // --- Control Legal ---
  const [legalItems, setLegalItems] = useState([
    { id: 1, item: 'Patente Comercial Municipal', vigente: true, vence: '2026-12-31' },
    { id: 2, item: 'Resolución Sanitaria SEREMI', vigente: true, vence: '2027-06-15' },
    { id: 3, item: 'Inicio de Actividades SII', vigente: true, vence: 'Permanente' },
    { id: 4, item: 'Contratos de Trabajo formalizados', vigente: true, vence: 'Vigente' },
    { id: 5, item: 'Seguro de Incendio', vigente: false, vence: '2026-03-01' },
    { id: 6, item: 'Certificación Manipulación Alimentos', vigente: true, vence: '2026-09-20' },
    { id: 7, item: 'Plan de Seguridad y Salud Laboral', vigente: false, vence: 'Pendiente' },
    { id: 8, item: 'Registro Marca INAPI', vigente: true, vence: '2028-05-10' },
  ])

  // ---------- Calculations ----------
  const totalIngresos = useMemo(() => ingresos.reduce((s, x) => s + Number(x.monto || 0), 0), [ingresos])
  const totalCostosFijos = useMemo(() => costosFijos.reduce((s, x) => s + Number(x.monto || 0), 0), [costosFijos])
  const totalCostosVariables = useMemo(() => costosVariables.reduce((s, x) => s + Number(x.monto || 0), 0), [costosVariables])
  const totalEgresos = totalCostosFijos + totalCostosVariables
  const utilidadBruta = totalIngresos - totalEgresos
  const impuesto = utilidadBruta > 0 ? utilidadBruta * (tasaImpuesto / 100) : 0
  const utilidadNeta = utilidadBruta - impuesto
  const margenNetoPct = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0

  const margenContribucionPct = totalIngresos > 0 ? (totalIngresos - totalCostosVariables) / totalIngresos : 0
  const puntoEquilibrio = margenContribucionPct > 0 ? totalCostosFijos / margenContribucionPct : 0

  const totalActivos = useMemo(() => activos.reduce((s, x) => s + Number(x.monto || 0), 0), [activos])
  const totalPasivos = useMemo(() => pasivos.reduce((s, x) => s + Number(x.monto || 0), 0), [pasivos])
  const patrimonio = totalActivos - totalPasivos
  const ratioEndeudamiento = totalActivos > 0 ? (totalPasivos / totalActivos) * 100 : 0

  // Escenarios
  const calcEscenario = (factorIngresos, factorCostos = 0) => {
    const ingresosAdj = totalIngresos * (1 + factorIngresos / 100)
    const cvAdj = totalCostosVariables * (1 + factorCostos / 100)
    const utilBruta = ingresosAdj - totalCostosFijos - cvAdj
    const imp = utilBruta > 0 ? utilBruta * (tasaImpuesto / 100) : 0
    const utilNeta = utilBruta - imp
    const mcPct = ingresosAdj > 0 ? (ingresosAdj - cvAdj) / ingresosAdj : 0
    const pe = mcPct > 0 ? totalCostosFijos / mcPct : 0
    return { ingresos: ingresosAdj, cv: cvAdj, cf: totalCostosFijos, utilBruta, imp, utilNeta, pe }
  }
  const escNeg = calcEscenario(escenarios.negativo, -escenarios.negativo / 2)
  const escMed = calcEscenario(escenarios.medio, 0)
  const escPos = calcEscenario(escenarios.positivo, escenarios.positivo / 3)

  // Productos / BCG
  const productosCalc = productos.map(p => {
    const margenUnitario = p.precio - p.costo
    const margenPct = p.precio > 0 ? (margenUnitario / p.precio) * 100 : 0
    const ingresoMes = p.precio * p.unidadesMes
    const margenTotalMes = margenUnitario * p.unidadesMes
    return { ...p, margenUnitario, margenPct, ingresoMes, margenTotalMes }
  })
  const totalIngresoProductos = productosCalc.reduce((s, p) => s + p.ingresoMes, 0)
  const productosBCG = productosCalc.map(p => {
    const cuotaMercado = totalIngresoProductos > 0 ? (p.ingresoMes / totalIngresoProductos) * 100 : 0
    let clasificacion = ''
    let tone = ''
    if (p.crecimiento >= 10 && cuotaMercado >= 15) { clasificacion = 'Estrella'; tone = 'bg-amber-100 text-amber-800' }
    else if (p.crecimiento < 10 && cuotaMercado >= 15) { clasificacion = 'Vaca Lechera'; tone = 'bg-emerald-100 text-emerald-800' }
    else if (p.crecimiento >= 10 && cuotaMercado < 15) { clasificacion = 'Interrogante'; tone = 'bg-sky-100 text-sky-800' }
    else { clasificacion = 'Perro'; tone = 'bg-rose-100 text-rose-800' }
    return { ...p, cuotaMercado, clasificacion, tone }
  })

  const cumplimientoLegal = legalItems.length > 0
    ? (legalItems.filter(l => l.vigente).length / legalItems.length) * 100
    : 0

  // --- Cálculos Abastecimiento ---
  const totalCompras = useMemo(() =>
    compras.reduce((s, c) => s + Number(c.cantidad || 0) * Number(c.precioUnitario || 0), 0),
  [compras])

  const ratioCompraVenta = totalIngresos > 0 ? (totalCompras / totalIngresos) * 100 : 0

  const insumosUnicos = useMemo(() => [...new Set(compras.map(c => c.insumo))], [compras])
  const proveedoresUnicos = useMemo(() => [...new Set(compras.map(c => c.proveedor))], [compras])

  // Evolución de precio unitario por insumo (por fecha)
  const fechasOrdenadas = useMemo(() => [...new Set(compras.map(c => c.fecha))].sort(), [compras])
  const dataEvolucionPrecios = fechasOrdenadas.map(fecha => {
    const punto = { fecha }
    insumosUnicos.forEach(insumo => {
      const compra = compras.find(c => c.fecha === fecha && c.insumo === insumo)
      if (compra) punto[insumo] = compra.precioUnitario
    })
    return punto
  })

  // Variación de precios por insumo
  const variacionInsumos = insumosUnicos.map(insumo => {
    const comprasInsumo = compras
      .filter(c => c.insumo === insumo)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
    if (comprasInsumo.length < 2) {
      return { insumo, inicial: comprasInsumo[0]?.precioUnitario || 0, final: comprasInsumo[0]?.precioUnitario || 0, variacionPct: 0, compras: comprasInsumo.length }
    }
    const inicial = comprasInsumo[0].precioUnitario
    const final = comprasInsumo[comprasInsumo.length - 1].precioUnitario
    const variacionPct = inicial > 0 ? ((final - inicial) / inicial) * 100 : 0
    return { insumo, inicial, final, variacionPct, compras: comprasInsumo.length }
  })

  const variacionPromedio = variacionInsumos.length > 0
    ? variacionInsumos.reduce((s, v) => s + v.variacionPct, 0) / variacionInsumos.length
    : 0

  // Total por proveedor
  const gastoPorProveedor = proveedoresUnicos.map(proveedor => ({
    proveedor,
    monto: compras.filter(c => c.proveedor === proveedor).reduce((s, c) => s + c.cantidad * c.precioUnitario, 0),
  })).sort((a, b) => b.monto - a.monto)

  // CRUD helpers
  const addItem = (setter, list, template) => {
    const newId = list.length > 0 ? Math.max(...list.map(i => i.id)) + 1 : 1
    setter([...list, { id: newId, ...template }])
  }
  const removeItem = (setter, list, id) => setter(list.filter(i => i.id !== id))
  const updateItem = (setter, list, id, field, value) => {
    setter(list.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  // ---------- Tabs ----------
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'ingresos', label: 'Ingresos', icon: '💰' },
    { id: 'cfijos', label: 'Costos Fijos', icon: '🏢' },
    { id: 'cvar', label: 'Costos Variables', icon: '📦' },
    { id: 'utilidad', label: 'Utilidad & P.E.', icon: '⚖️' },
    { id: 'escenarios', label: 'Escenarios', icon: '🎯' },
    { id: 'balance', label: 'Balance', icon: '📑' },
    { id: 'cartera', label: 'Cartera Productos', icon: '☕' },
    { id: 'abastecimiento', label: 'Abastecimiento', icon: '📦' },
    { id: 'marketing', label: 'Marketing Mix', icon: '📣' },
    { id: 'legal', label: 'Control Legal', icon: '⚖️' },
  ]

  return (
    <div className="min-h-screen bg-cream text-coffee-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-coffee-700 to-coffee-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-coffee-100 text-coffee-700 rounded-xl flex items-center justify-center text-2xl font-bold shadow-inner">
                ☕
              </div>
              <div>
                <input
                  value={nombreNegocio}
                  onChange={(e) => setNombreNegocio(e.target.value)}
                  className="bg-transparent text-lg md:text-xl font-bold focus:outline-none focus:bg-coffee-800 px-1 rounded w-full max-w-xs"
                />
                <div className="text-xs text-coffee-200 opacity-90">Modelo de Gestión Integral</div>
              </div>
            </div>
            <div className="text-right">
              <input
                value={presentador}
                onChange={(e) => setPresentador(e.target.value)}
                className="bg-transparent text-sm font-medium text-right focus:outline-none focus:bg-coffee-800 px-1 rounded"
              />
              <div className="text-xs text-coffee-200 opacity-80">Ing. en Negocios · Analista de Datos</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="bg-coffee-800/40 backdrop-blur-sm overflow-x-auto">
          <div className="max-w-7xl mx-auto px-2 md:px-6 flex gap-1 py-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? 'bg-cream text-coffee-800 shadow'
                    : 'text-cream/80 hover:bg-coffee-700/50'
                }`}
              >
                <span className="mr-1">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Dashboard Ejecutivo</h2>
              <p className="text-coffee-500 text-sm mt-1">Visión integral del estado financiero y operativo · Mensual</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <KPI label="Ingresos Totales" value={formatCLP(totalIngresos)} tone="default" />
              <KPI label="Egresos Totales" value={formatCLP(totalEgresos)} tone="default" />
              <KPI label="Utilidad Neta" value={formatCLP(utilidadNeta)} sub={formatPct(margenNetoPct) + ' margen neto'} tone={utilidadNeta >= 0 ? 'positive' : 'negative'} />
              <KPI label="Punto Equilibrio" value={formatCLP(puntoEquilibrio)} sub="Ingreso mínimo mensual" tone="accent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="Estructura Financiera" subtitle="Ingresos vs. egresos vs. utilidad">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={[
                      { name: 'Ingresos', valor: totalIngresos },
                      { name: 'C. Fijos', valor: totalCostosFijos },
                      { name: 'C. Variables', valor: totalCostosVariables },
                      { name: 'Utilidad Neta', valor: utilidadNeta },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0CFB1" />
                      <XAxis dataKey="name" stroke="#6F4E37" fontSize={12} />
                      <YAxis stroke="#6F4E37" fontSize={11} tickFormatter={(v) => '$' + (v/1000000).toFixed(1) + 'M'} />
                      <Tooltip formatter={(v) => formatCLP(v)} />
                      <Bar dataKey="valor" fill="#6F4E37" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Distribución de Egresos" subtitle="Dónde se va el dinero">
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Costos Fijos', value: totalCostosFijos },
                          { name: 'Costos Variables', value: totalCostosVariables },
                        ]}
                        cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                        paddingAngle={3} dataKey="value"
                      >
                        <Cell fill="#6F4E37" />
                        <Cell fill="#C9B08C" />
                      </Pie>
                      <Tooltip formatter={(v) => formatCLP(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPI label="Patrimonio" value={formatCLP(patrimonio)} sub={`A ${formatCLP(totalActivos)} / P ${formatCLP(totalPasivos)}`} tone={patrimonio >= 0 ? 'positive' : 'negative'} />
              <KPI label="Cumplimiento Legal" value={formatPct(cumplimientoLegal)} sub={`${legalItems.filter(l => l.vigente).length} de ${legalItems.length} vigentes`} tone={cumplimientoLegal >= 80 ? 'positive' : cumplimientoLegal >= 60 ? 'accent' : 'negative'} />
              <KPI label="Margen Contribución" value={formatPct(margenContribucionPct * 100)} sub="Sobre ingresos" tone="accent" />
              <KPI label="Ratio Compra/Venta" value={formatPct(ratioCompraVenta)} sub={`Benchmark: ${ratioBenchmark}%`} tone={ratioCompraVenta <= ratioBenchmark ? 'positive' : 'negative'} />
            </div>

            <Card title="Pilares del Modelo de Gestión" subtitle="Capa financiera · operativa · estratégica · legal">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                {[
                  { t: 'Financiero', d: 'Ingresos, egresos, utilidad, impuestos' },
                  { t: 'Operacional', d: 'Punto de equilibrio y escenarios' },
                  { t: 'Patrimonio', d: 'Activos, pasivos y endeudamiento' },
                  { t: 'Estratégico', d: 'Cartera de productos y Marketing Mix' },
                  { t: 'Legal', d: 'Cumplimiento normativo y compliance' },
                ].map((p, i) => (
                  <div key={i} className="p-3 bg-coffee-50 rounded-lg border border-coffee-100">
                    <div className="font-semibold text-coffee-800">{p.t}</div>
                    <div className="text-xs text-coffee-600 mt-1">{p.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* INGRESOS */}
        {tab === 'ingresos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Total Ingresos</h2>
              <p className="text-coffee-500 text-sm mt-1">Fuentes de ingreso del negocio · Editable</p>
            </div>

            <Card>
              <div className="flex justify-between items-center mb-2 pb-3 border-b border-coffee-200">
                <div className="font-semibold text-coffee-800">Detalle de Ingresos</div>
                <div className="text-lg font-bold text-coffee-800">{formatCLP(totalIngresos)}</div>
              </div>
              {ingresos.map(item => (
                <EditableRow
                  key={item.id}
                  item={item}
                  onChange={(field, value) => updateItem(setIngresos, ingresos, item.id, field, value)}
                  onRemove={() => removeItem(setIngresos, ingresos, item.id)}
                  fields={[
                    { key: 'nombre', label: 'Nombre del ingreso', span: 'col-span-12 md:col-span-7' },
                    { key: 'monto', label: 'Monto ($)', type: 'number', span: 'col-span-12 md:col-span-4' },
                  ]}
                />
              ))}
              <AddButton onClick={() => addItem(setIngresos, ingresos, { nombre: '', monto: 0 })} label="Agregar ingreso" />
            </Card>

            <Card title="Composición de Ingresos">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={ingresos} dataKey="monto" nameKey="nombre" cx="50%" cy="50%" outerRadius={95} label>
                      {ingresos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatCLP(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* COSTOS FIJOS */}
        {tab === 'cfijos' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Costos Fijos</h2>
              <p className="text-coffee-500 text-sm mt-1">Gastos que no varían con las ventas · Editable</p>
            </div>

            <Card>
              <div className="flex justify-between items-center mb-2 pb-3 border-b border-coffee-200">
                <div className="font-semibold text-coffee-800">Detalle Costos Fijos</div>
                <div className="text-lg font-bold text-coffee-800">{formatCLP(totalCostosFijos)}</div>
              </div>
              {costosFijos.map(item => (
                <EditableRow
                  key={item.id}
                  item={item}
                  onChange={(field, value) => updateItem(setCostosFijos, costosFijos, item.id, field, value)}
                  onRemove={() => removeItem(setCostosFijos, costosFijos, item.id)}
                  fields={[
                    { key: 'nombre', label: 'Nombre', span: 'col-span-12 md:col-span-7' },
                    { key: 'monto', label: 'Monto ($)', type: 'number', span: 'col-span-12 md:col-span-4' },
                  ]}
                />
              ))}
              <AddButton onClick={() => addItem(setCostosFijos, costosFijos, { nombre: '', monto: 0 })} label="Agregar costo fijo" />
            </Card>

            <Card title="Distribución Costos Fijos">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={costosFijos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0CFB1" />
                    <XAxis type="number" stroke="#6F4E37" fontSize={11} tickFormatter={(v) => '$' + (v/1000).toFixed(0) + 'k'} />
                    <YAxis type="category" dataKey="nombre" stroke="#6F4E37" fontSize={11} width={150} />
                    <Tooltip formatter={(v) => formatCLP(v)} />
                    <Bar dataKey="monto" fill="#6F4E37" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* COSTOS VARIABLES */}
        {tab === 'cvar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Costos Variables</h2>
              <p className="text-coffee-500 text-sm mt-1">Gastos proporcionales a las ventas · Editable</p>
            </div>

            <Card>
              <div className="flex justify-between items-center mb-2 pb-3 border-b border-coffee-200">
                <div className="font-semibold text-coffee-800">Detalle Costos Variables</div>
                <div className="text-lg font-bold text-coffee-800">{formatCLP(totalCostosVariables)}</div>
              </div>
              {costosVariables.map(item => (
                <EditableRow
                  key={item.id}
                  item={item}
                  onChange={(field, value) => updateItem(setCostosVariables, costosVariables, item.id, field, value)}
                  onRemove={() => removeItem(setCostosVariables, costosVariables, item.id)}
                  fields={[
                    { key: 'nombre', label: 'Nombre', span: 'col-span-12 md:col-span-7' },
                    { key: 'monto', label: 'Monto ($)', type: 'number', span: 'col-span-12 md:col-span-4' },
                  ]}
                />
              ))}
              <AddButton onClick={() => addItem(setCostosVariables, costosVariables, { nombre: '', monto: 0 })} label="Agregar costo variable" />
            </Card>

            <Card title="Distribución Costos Variables">
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={costosVariables} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0CFB1" />
                    <XAxis type="number" stroke="#6F4E37" fontSize={11} tickFormatter={(v) => '$' + (v/1000).toFixed(0) + 'k'} />
                    <YAxis type="category" dataKey="nombre" stroke="#6F4E37" fontSize={11} width={150} />
                    <Tooltip formatter={(v) => formatCLP(v)} />
                    <Bar dataKey="monto" fill="#A98B6C" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* UTILIDAD & PUNTO DE EQUILIBRIO */}
        {tab === 'utilidad' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Utilidad & Punto de Equilibrio</h2>
              <p className="text-coffee-500 text-sm mt-1">Análisis de rentabilidad con impuesto configurable</p>
            </div>

            <Card title="Estado de Resultados Simplificado">
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                  <span className="text-coffee-700">Ingresos Totales</span>
                  <span className="font-bold text-coffee-800">{formatCLP(totalIngresos)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                  <span className="text-coffee-700">(-) Costos Variables</span>
                  <span className="text-rose-600 font-medium">-{formatCLP(totalCostosVariables)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-coffee-100 bg-coffee-50 px-2 rounded">
                  <span className="text-coffee-800 font-medium">Margen de Contribución</span>
                  <span className="font-bold text-coffee-800">{formatCLP(totalIngresos - totalCostosVariables)} ({formatPct(margenContribucionPct * 100)})</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-coffee-100">
                  <span className="text-coffee-700">(-) Costos Fijos</span>
                  <span className="text-rose-600 font-medium">-{formatCLP(totalCostosFijos)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-coffee-100 bg-coffee-50 px-2 rounded">
                  <span className="text-coffee-800 font-medium">Utilidad Bruta</span>
                  <span className="font-bold text-coffee-800">{formatCLP(utilidadBruta)}</span>
                </div>
                <div className="flex items-center gap-3 py-2 border-b border-coffee-100">
                  <span className="text-coffee-700 flex-1">(-) Impuesto</span>
                  <input
                    type="number"
                    value={tasaImpuesto}
                    onChange={(e) => setTasaImpuesto(Number(e.target.value))}
                    className="w-20 px-2 py-1 border border-coffee-300 rounded text-sm text-right"
                  />
                  <span className="text-coffee-600">%</span>
                  <span className="text-rose-600 font-medium min-w-[120px] text-right">-{formatCLP(impuesto)}</span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gradient-to-r from-coffee-600 to-coffee-700 text-white px-3 rounded-lg mt-2">
                  <span className="font-semibold">Utilidad Neta (después de impuesto)</span>
                  <div className="text-right">
                    <div className="font-bold text-lg">{formatCLP(utilidadNeta)}</div>
                    <div className="text-xs opacity-80">Margen Neto: {formatPct(margenNetoPct)}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <strong>Nota tributaria:</strong> Chile aplica 27% régimen general (14A) o 25% Pro-Pyme (14D). Ajusta según tu régimen o jurisdicción.
              </div>
            </Card>

            <Card title="Punto de Equilibrio" subtitle="Ingreso mínimo para cubrir todos los costos">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <KPI label="Punto Equilibrio (CLP)" value={formatCLP(puntoEquilibrio)} tone="accent" />
                <KPI label="Margen Contribución %" value={formatPct(margenContribucionPct * 100)} sub="(Ingresos - CV) / Ingresos" />
                <KPI label="Estado Actual" value={totalIngresos >= puntoEquilibrio ? 'Sobre P.E.' : 'Bajo P.E.'} sub={`Diferencia: ${formatCLP(totalIngresos - puntoEquilibrio)}`} tone={totalIngresos >= puntoEquilibrio ? 'positive' : 'negative'} />
              </div>
              <div className="text-xs text-coffee-600 bg-coffee-50 p-3 rounded-lg">
                <strong>Fórmula:</strong> P.E. = Costos Fijos / Margen de Contribución % · Si tu ingreso mensual supera este valor, comienzas a generar utilidad.
              </div>
            </Card>
          </div>
        )}

        {/* ESCENARIOS */}
        {tab === 'escenarios' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Sensibilización de Escenarios</h2>
              <p className="text-coffee-500 text-sm mt-1">Simula impactos negativo, medio y positivo sobre tus ingresos</p>
            </div>

            <Card title="Parámetros (%)">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'negativo', label: 'Escenario Negativo (%)', color: 'border-rose-300' },
                  { key: 'medio', label: 'Escenario Medio (%)', color: 'border-amber-300' },
                  { key: 'positivo', label: 'Escenario Positivo (%)', color: 'border-emerald-300' },
                ].map(s => (
                  <div key={s.key}>
                    <label className="text-sm text-coffee-600 block mb-1">{s.label}</label>
                    <input
                      type="number"
                      value={escenarios[s.key]}
                      onChange={(e) => setEscenarios({ ...escenarios, [s.key]: Number(e.target.value) })}
                      className={`w-full px-3 py-2 border-2 ${s.color} rounded-lg focus:outline-none`}
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs text-coffee-600 mt-3 bg-coffee-50 p-3 rounded-lg">
                El modelo ajusta los ingresos según el % y simula un impacto proporcional en costos variables (efecto de menor/mayor volumen de venta).
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Negativo', data: escNeg, tone: 'border-rose-200 bg-rose-50' },
                { title: 'Medio (Actual)', data: escMed, tone: 'border-amber-200 bg-amber-50' },
                { title: 'Positivo', data: escPos, tone: 'border-emerald-200 bg-emerald-50' },
              ].map((e, i) => (
                <div key={i} className={`rounded-2xl border-2 ${e.tone} p-5`}>
                  <div className="font-bold text-lg text-coffee-800 mb-3">{e.title}</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-coffee-600">Ingresos</span><span className="font-semibold">{formatCLP(e.data.ingresos)}</span></div>
                    <div className="flex justify-between"><span className="text-coffee-600">C. Variables</span><span className="font-semibold text-rose-600">-{formatCLP(e.data.cv)}</span></div>
                    <div className="flex justify-between"><span className="text-coffee-600">C. Fijos</span><span className="font-semibold text-rose-600">-{formatCLP(e.data.cf)}</span></div>
                    <div className="flex justify-between border-t border-coffee-200 pt-1.5"><span className="text-coffee-700 font-medium">Utilidad Bruta</span><span className="font-bold">{formatCLP(e.data.utilBruta)}</span></div>
                    <div className="flex justify-between"><span className="text-coffee-600">Impuesto ({tasaImpuesto}%)</span><span className="font-semibold text-rose-600">-{formatCLP(e.data.imp)}</span></div>
                    <div className="flex justify-between bg-coffee-700 text-white px-2 py-1.5 rounded mt-2"><span>Utilidad Neta</span><span className="font-bold">{formatCLP(e.data.utilNeta)}</span></div>
                    <div className="flex justify-between pt-2 text-xs"><span className="text-coffee-600">P. Equilibrio</span><span className="font-semibold">{formatCLP(e.data.pe)}</span></div>
                  </div>
                </div>
              ))}
            </div>

            <Card title="Comparativa Gráfica">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={[
                    { name: 'Negativo', Ingresos: escNeg.ingresos, 'Utilidad Neta': escNeg.utilNeta, 'P. Equilibrio': escNeg.pe },
                    { name: 'Medio', Ingresos: escMed.ingresos, 'Utilidad Neta': escMed.utilNeta, 'P. Equilibrio': escMed.pe },
                    { name: 'Positivo', Ingresos: escPos.ingresos, 'Utilidad Neta': escPos.utilNeta, 'P. Equilibrio': escPos.pe },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0CFB1" />
                    <XAxis dataKey="name" stroke="#6F4E37" fontSize={12} />
                    <YAxis stroke="#6F4E37" fontSize={11} tickFormatter={(v) => '$' + (v/1000000).toFixed(1) + 'M'} />
                    <Tooltip formatter={(v) => formatCLP(v)} />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#6F4E37" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Utilidad Neta" fill="#A98B6C" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="P. Equilibrio" fill="#D4A574" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* BALANCE: Activos / Pasivos */}
        {tab === 'balance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Balance: Activos & Pasivos</h2>
              <p className="text-coffee-500 text-sm mt-1">Estructura patrimonial del negocio</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI label="Total Activos" value={formatCLP(totalActivos)} tone="positive" />
              <KPI label="Total Pasivos" value={formatCLP(totalPasivos)} tone="negative" />
              <KPI label="Patrimonio Neto" value={formatCLP(patrimonio)} sub={`Endeudamiento: ${formatPct(ratioEndeudamiento)}`} tone={patrimonio >= 0 ? 'positive' : 'negative'} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="Activos" subtitle="Bienes y recursos del negocio">
                {activos.map(item => (
                  <EditableRow
                    key={item.id}
                    item={item}
                    onChange={(field, value) => updateItem(setActivos, activos, item.id, field, value)}
                    onRemove={() => removeItem(setActivos, activos, item.id)}
                    fields={[
                      { key: 'nombre', label: 'Activo', span: 'col-span-12 md:col-span-7' },
                      { key: 'monto', label: 'Valor ($)', type: 'number', span: 'col-span-12 md:col-span-4' },
                    ]}
                  />
                ))}
                <AddButton onClick={() => addItem(setActivos, activos, { nombre: '', monto: 0 })} label="Agregar activo" />
              </Card>

              <Card title="Pasivos" subtitle="Deudas y obligaciones">
                {pasivos.map(item => (
                  <EditableRow
                    key={item.id}
                    item={item}
                    onChange={(field, value) => updateItem(setPasivos, pasivos, item.id, field, value)}
                    onRemove={() => removeItem(setPasivos, pasivos, item.id)}
                    fields={[
                      { key: 'nombre', label: 'Pasivo', span: 'col-span-12 md:col-span-7' },
                      { key: 'monto', label: 'Monto ($)', type: 'number', span: 'col-span-12 md:col-span-4' },
                    ]}
                  />
                ))}
                <AddButton onClick={() => addItem(setPasivos, pasivos, { nombre: '', monto: 0 })} label="Agregar pasivo" />
              </Card>
            </div>

            <Card title="Estructura Patrimonial">
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={[
                    { name: 'Activos', valor: totalActivos },
                    { name: 'Pasivos', valor: totalPasivos },
                    { name: 'Patrimonio', valor: patrimonio },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0CFB1" />
                    <XAxis dataKey="name" stroke="#6F4E37" fontSize={12} />
                    <YAxis stroke="#6F4E37" fontSize={11} tickFormatter={(v) => '$' + (v/1000000).toFixed(1) + 'M'} />
                    <Tooltip formatter={(v) => formatCLP(v)} />
                    <Bar dataKey="valor" fill="#6F4E37" radius={[8, 8, 0, 0]}>
                      {[0, 1, 2].map((_, i) => <Cell key={i} fill={['#10b981', '#ef4444', '#6F4E37'][i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* CARTERA DE PRODUCTOS */}
        {tab === 'cartera' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Cartera de Productos</h2>
              <p className="text-coffee-500 text-sm mt-1">Análisis por producto con clasificación BCG (Matriz Boston Consulting Group)</p>
            </div>

            <Card title="Productos" subtitle="Define precio, costo unitario, unidades vendidas al mes y % crecimiento mensual estimado">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-coffee-100 text-coffee-800">
                      <th className="text-left p-2 font-semibold">Producto</th>
                      <th className="text-right p-2 font-semibold">Precio</th>
                      <th className="text-right p-2 font-semibold">Costo</th>
                      <th className="text-right p-2 font-semibold">Uds/mes</th>
                      <th className="text-right p-2 font-semibold">Crec. %</th>
                      <th className="text-right p-2 font-semibold hidden md:table-cell">Margen</th>
                      <th className="text-right p-2 font-semibold hidden md:table-cell">Cuota %</th>
                      <th className="text-left p-2 font-semibold">Tipo</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosBCG.map(p => (
                      <tr key={p.id} className="border-b border-coffee-100">
                        <td className="p-1"><input value={p.nombre} onChange={(e) => updateItem(setProductos, productos, p.id, 'nombre', e.target.value)} className="w-full px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><input type="number" value={p.precio} onChange={(e) => updateItem(setProductos, productos, p.id, 'precio', Number(e.target.value))} className="w-20 px-2 py-1.5 border border-coffee-200 rounded text-right text-sm" /></td>
                        <td className="p-1"><input type="number" value={p.costo} onChange={(e) => updateItem(setProductos, productos, p.id, 'costo', Number(e.target.value))} className="w-20 px-2 py-1.5 border border-coffee-200 rounded text-right text-sm" /></td>
                        <td className="p-1"><input type="number" value={p.unidadesMes} onChange={(e) => updateItem(setProductos, productos, p.id, 'unidadesMes', Number(e.target.value))} className="w-20 px-2 py-1.5 border border-coffee-200 rounded text-right text-sm" /></td>
                        <td className="p-1"><input type="number" value={p.crecimiento} onChange={(e) => updateItem(setProductos, productos, p.id, 'crecimiento', Number(e.target.value))} className="w-16 px-2 py-1.5 border border-coffee-200 rounded text-right text-sm" /></td>
                        <td className="p-2 text-right hidden md:table-cell font-medium">{formatPct(p.margenPct)}</td>
                        <td className="p-2 text-right hidden md:table-cell font-medium">{formatPct(p.cuotaMercado)}</td>
                        <td className="p-2"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.tone}`}>{p.clasificacion}</span></td>
                        <td className="p-1 text-right">
                          <button onClick={() => removeItem(setProductos, productos, p.id)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <AddButton onClick={() => addItem(setProductos, productos, { nombre: 'Nuevo producto', precio: 0, costo: 0, unidadesMes: 0, crecimiento: 0 })} label="Agregar producto" />
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card title="Matriz BCG" subtitle="Crecimiento vs. Cuota de Mercado">
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 20 }}>
                      <CartesianGrid stroke="#E0CFB1" />
                      <XAxis type="number" dataKey="cuotaMercado" name="Cuota %" unit="%" stroke="#6F4E37" fontSize={11}>
                        <text x="50%" y="97%" textAnchor="middle" fill="#6F4E37" fontSize="11">Cuota de Mercado (%)</text>
                      </XAxis>
                      <YAxis type="number" dataKey="crecimiento" name="Crecimiento %" unit="%" stroke="#6F4E37" fontSize={11} />
                      <ZAxis type="number" dataKey="ingresoMes" range={[50, 400]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v, name) => {
                        if (name === 'Ingreso Mes') return formatCLP(v)
                        return typeof v === 'number' ? v.toFixed(1) + '%' : v
                      }} />
                      <Scatter name="Productos" data={productosBCG} fill="#6F4E37" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-coffee-600 mt-2 p-3 bg-coffee-50 rounded">
                  <strong>Umbrales:</strong> Cuota {'>'}15% y Crecimiento {'>'}10% = Estrella · Cuota {'>'}15% y Crecimiento {'<'}10% = Vaca · Crecimiento {'>'}10% y Cuota {'<'}15% = Interrogante · Resto = Perro
                </div>
              </Card>

              <Card title="Margen Total Mensual por Producto">
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={productosCalc}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E0CFB1" />
                      <XAxis dataKey="nombre" stroke="#6F4E37" fontSize={11} angle={-20} textAnchor="end" height={60} />
                      <YAxis stroke="#6F4E37" fontSize={11} tickFormatter={(v) => '$' + (v/1000).toFixed(0) + 'k'} />
                      <Tooltip formatter={(v) => formatCLP(v)} />
                      <Bar dataKey="margenTotalMes" fill="#6F4E37" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ABASTECIMIENTO */}
        {tab === 'abastecimiento' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Gestión de Abastecimiento</h2>
              <p className="text-coffee-500 text-sm mt-1">Control de compras, proveedores y variación de precios · Medir eficiencia del gasto</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <KPI label="Total Compras" value={formatCLP(totalCompras)} sub={`${compras.length} registros`} tone="default" />
              <KPI label="Ratio Compra/Venta" value={formatPct(ratioCompraVenta)} sub={`Benchmark: ${ratioBenchmark}%`} tone={ratioCompraVenta <= ratioBenchmark ? 'positive' : 'negative'} />
              <KPI label="Variación Promedio Precios" value={formatPct(variacionPromedio)} sub="Entre 1ª y última compra" tone={variacionPromedio > 5 ? 'negative' : variacionPromedio < 0 ? 'positive' : 'accent'} />
              <KPI label="Proveedores Activos" value={proveedoresUnicos.length} sub={`${insumosUnicos.length} insumos distintos`} tone="default" />
            </div>

            <Card title="Benchmark Ratio Compra/Venta">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-sm text-coffee-700">Meta máxima (% de ingresos):</label>
                <input
                  type="number"
                  value={ratioBenchmark}
                  onChange={(e) => setRatioBenchmark(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-coffee-300 rounded-lg text-right"
                />
                <span className="text-coffee-600">%</span>
                <div className="flex-1 min-w-[200px]">
                  <div className="w-full bg-coffee-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${ratioCompraVenta <= ratioBenchmark ? 'bg-emerald-500' : 'bg-rose-500'} transition-all`}
                      style={{ width: `${Math.min(ratioCompraVenta, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-coffee-600 mt-1">Actual: {formatPct(ratioCompraVenta)} · Objetivo: {'<='}{ratioBenchmark}%</div>
                </div>
              </div>
              <div className="text-xs text-coffee-600 mt-3 bg-coffee-50 p-3 rounded-lg">
                Si este ratio sube sin que suban las ventas, hay problema de merma, sobrestock o alza de insumos. En una cafetería de especialidad típica, los insumos representan 25-35% del ingreso.
              </div>
            </Card>

            <Card title="Registro de Compras" subtitle="Fecha · N° Documento · Proveedor · Insumo · Cantidad · Precio Unitario">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-coffee-100 text-coffee-800">
                      <th className="text-left p-2 font-semibold">Fecha</th>
                      <th className="text-left p-2 font-semibold">Tipo</th>
                      <th className="text-left p-2 font-semibold">N° Doc</th>
                      <th className="text-left p-2 font-semibold">Proveedor</th>
                      <th className="text-left p-2 font-semibold">Insumo</th>
                      <th className="text-right p-2 font-semibold">Cant.</th>
                      <th className="text-left p-2 font-semibold">Ud</th>
                      <th className="text-right p-2 font-semibold">P. Unit.</th>
                      <th className="text-right p-2 font-semibold hidden md:table-cell">Total</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {compras.map(c => (
                      <tr key={c.id} className="border-b border-coffee-100">
                        <td className="p-1"><input type="date" value={c.fecha} onChange={(e) => updateItem(setCompras, compras, c.id, 'fecha', e.target.value)} className="w-36 px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><select value={c.tipoDoc || 'Factura'} onChange={(e) => updateItem(setCompras, compras, c.id, 'tipoDoc', e.target.value)} className="w-24 px-2 py-1.5 border border-coffee-200 rounded text-sm bg-white"><option value="Factura">Factura</option><option value="Boleta">Boleta</option><option value="Guía">Guía</option></select></td>
                        <td className="p-1"><input value={c.nDoc || ''} onChange={(e) => updateItem(setCompras, compras, c.id, 'nDoc', e.target.value)} placeholder="N°" className="w-24 px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><input value={c.proveedor} onChange={(e) => updateItem(setCompras, compras, c.id, 'proveedor', e.target.value)} className="w-full min-w-[140px] px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><input value={c.insumo} onChange={(e) => updateItem(setCompras, compras, c.id, 'insumo', e.target.value)} className="w-full min-w-[130px] px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><input type="number" value={c.cantidad} onChange={(e) => updateItem(setCompras, compras, c.id, 'cantidad', Number(e.target.value))} className="w-20 px-2 py-1.5 border border-coffee-200 rounded text-right text-sm" /></td>
                        <td className="p-1"><input value={c.unidad} onChange={(e) => updateItem(setCompras, compras, c.id, 'unidad', e.target.value)} className="w-16 px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><input type="number" value={c.precioUnitario} onChange={(e) => updateItem(setCompras, compras, c.id, 'precioUnitario', Number(e.target.value))} className="w-24 px-2 py-1.5 border border-coffee-200 rounded text-right text-sm" /></td>
                        <td className="p-1 text-right hidden md:table-cell text-coffee-700 font-medium">{formatCLP(Number(c.cantidad || 0) * Number(c.precioUnitario || 0))}</td>
                        <td className="p-1"><button onClick={() => removeItem(setCompras, compras, c.id)} className="text-coffee-400 hover:text-rose-500 px-2">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <AddButton onClick={() => addItem(setCompras, compras, { fecha: new Date().toISOString().slice(0,10), tipoDoc: 'Factura', nDoc: '', proveedor: '', insumo: '', cantidad: 0, unidad: 'kg', precioUnitario: 0 })} label="Agregar compra" />
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Variación de Precios por Insumo" subtitle="Comparación entre primera y última compra">
                {variacionInsumos.length > 0 ? (
                  <div className="space-y-2">
                    {variacionInsumos.map(v => (
                      <div key={v.insumo} className="flex items-center justify-between bg-coffee-50 p-3 rounded-lg">
                        <div>
                          <div className="font-medium text-coffee-800 text-sm">{v.insumo}</div>
                          <div className="text-xs text-coffee-500">{formatCLP(v.precioInicial)} → {formatCLP(v.precioActual)}</div>
                        </div>
                        <div className={`font-bold text-sm ${v.variacionPct > 5 ? 'text-rose-600' : v.variacionPct < 0 ? 'text-emerald-600' : 'text-coffee-700'}`}>
                          {v.variacionPct >= 0 ? '+' : ''}{formatPct(v.variacionPct)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-coffee-500 text-sm text-center py-8">Registra al menos 2 compras del mismo insumo para ver la variación.</div>
                )}
              </Card>

              <Card title="Gasto por Proveedor">
                <div className="h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={gastoPorProveedor} dataKey="total" nameKey="proveedor" outerRadius={90} label={(e) => e.proveedor}>
                        {gastoPorProveedor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCLP(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card title="Rotación de Inventario (Estimado)" subtitle="Veces que se renueva el stock al mes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-coffee-50 p-4 rounded-xl">
                  <div className="text-xs text-coffee-500 uppercase tracking-wide">Costo de Ventas Mes</div>
                  <div className="text-2xl font-bold text-coffee-800 mt-1">{formatCLP(totalCostosVariables)}</div>
                </div>
                <div className="bg-coffee-50 p-4 rounded-xl">
                  <div className="text-xs text-coffee-500 uppercase tracking-wide">Inventario Promedio (compras)</div>
                  <div className="text-2xl font-bold text-coffee-800 mt-1">{formatCLP(totalCompras)}</div>
                </div>
                <div className="bg-amber-50 p-4 rounded-xl">
                  <div className="text-xs text-amber-700 uppercase tracking-wide">Rotación Estimada</div>
                  <div className="text-2xl font-bold text-amber-800 mt-1">{totalCompras > 0 ? (totalCostosVariables / totalCompras).toFixed(2) : '0.00'}x</div>
                </div>
              </div>
              <div className="text-xs text-coffee-600 mt-3 bg-coffee-50 p-3 rounded-lg">
                Una rotación &gt; 1 indica que se vende todo lo comprado en el mes. Bajo 0.7 sugiere sobre-stock o merma. Una cafetería sana suele rotar entre 1.0x y 1.5x mensual.
              </div>
            </Card>

            <Card title="Costo Teórico vs Real" subtitle="Comparación entre lo que la receta dice que debería costar y lo que realmente se gastó">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-coffee-100 text-coffee-800">
                      <th className="text-left p-2 font-semibold">Concepto</th>
                      <th className="text-right p-2 font-semibold">Costo Variable Teórico</th>
                      <th className="text-right p-2 font-semibold">Compras Reales</th>
                      <th className="text-right p-2 font-semibold">Diferencia</th>
                      <th className="text-right p-2 font-semibold">Desv. %</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-coffee-100">
                      <td className="p-2 font-medium text-coffee-800">Total Mensual</td>
                      <td className="p-2 text-right">{formatCLP(totalCostosVariables)}</td>
                      <td className="p-2 text-right">{formatCLP(totalCompras)}</td>
                      <td className={`p-2 text-right font-bold ${totalCompras - totalCostosVariables > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {totalCompras - totalCostosVariables >= 0 ? '+' : ''}{formatCLP(totalCompras - totalCostosVariables)}
                      </td>
                      <td className={`p-2 text-right font-bold ${totalCompras - totalCostosVariables > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {totalCostosVariables > 0 ? formatPct(((totalCompras - totalCostosVariables) / totalCostosVariables) * 100) : '0%'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-coffee-600 mt-3 bg-coffee-50 p-3 rounded-lg">
                Si lo real supera al teórico en &gt; 5%, hay merma, robo, sobreporcionado o alza no controlada de proveedores. Esta es la métrica clave de control diario.
              </div>
            </Card>

            <Card title="Integración Automática con SII (Propuesta Técnica)" subtitle="Importar facturas electrónicas (DTE) directamente desde el SII">
              <div className="space-y-4 text-sm text-coffee-700">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                  <div className="font-semibold text-amber-800 mb-2">¿Por qué automatizar?</div>
                  <p className="text-amber-900">En Chile toda factura de proveedor pasa por el SII como DTE (Documento Tributario Electrónico). Conectar este registro al SII elimina la digitación manual y entrega datos en tiempo real para tomar decisiones.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-coffee-50 p-4 rounded-xl">
                    <div className="font-semibold text-coffee-800 mb-2">Stack propuesto</div>
                    <ul className="list-disc list-inside space-y-1 text-coffee-700">
                      <li>Python + <code className="bg-white px-1 rounded">requests</code> para SII WS</li>
                      <li>Parsing de XML DTE con <code className="bg-white px-1 rounded">lxml</code></li>
                      <li>Webhook diario → Supabase / Firestore</li>
                      <li>API REST consumida por este dashboard</li>
                    </ul>
                  </div>
                  <div className="bg-coffee-50 p-4 rounded-xl">
                    <div className="font-semibold text-coffee-800 mb-2">Flujo</div>
                    <ol className="list-decimal list-inside space-y-1 text-coffee-700">
                      <li>Login con Certificado Digital al SII</li>
                      <li>Descarga RCV (Registro Compra-Venta)</li>
                      <li>Parser extrae proveedor, insumo, monto, IVA</li>
                      <li>Match contra catálogo de insumos</li>
                      <li>Inserta automáticamente en Compras</li>
                    </ol>
                  </div>
                </div>

                <div className="bg-coffee-900 text-coffee-50 p-4 rounded-xl font-mono text-xs overflow-x-auto">
                  <div className="text-coffee-300 mb-2"># Pseudocódigo del conector</div>
                  <pre>{`from sii_chile import SiiClient
from datetime import date

sii = SiiClient(rut, clave_sii, cert_path)
rcv = sii.get_rcv(periodo=date.today().strftime("%Y%m"))

for factura in rcv.compras:
    insumo = match_insumo(factura.detalle)
    api.post("/compras", {
        "fecha": factura.fecha,
        "proveedor": factura.razon_social,
        "insumo": insumo.nombre,
        "cantidad": factura.cantidad,
        "unidad": insumo.unidad,
        "precioUnitario": factura.neto / factura.cantidad
    })`}</pre>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <div className="font-semibold text-emerald-800 mb-1">Beneficios para la cafetería</div>
                  <ul className="list-disc list-inside text-emerald-900 space-y-1">
                    <li>0 minutos de digitación: el barista no carga datos</li>
                    <li>Conciliación automática IVA crédito fiscal</li>
                    <li>Alertas de alza de precios en tiempo real</li>
                    <li>Datos limpios y trazables para auditoría tributaria</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}


        {/* MARKETING MIX */}
        {tab === 'marketing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Marketing Mix · 7P</h2>
              <p className="text-coffee-500 text-sm mt-1">Diagnóstico de las 7 dimensiones del marketing operativo · Editable en tiempo real</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Radar de Desempeño" subtitle="Valores 0-100 por dimensión">
                <div className="h-80">
                  <ResponsiveContainer>
                    <RadarChart data={Object.entries(marketingMix).map(([k, v]) => ({ dimension: k, valor: v }))}>
                      <PolarGrid stroke="#C9B08C" />
                      <PolarAngleAxis dataKey="dimension" stroke="#6F4E37" fontSize={12} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#A98B6C" fontSize={10} />
                      <Radar name="Desempeño" dataKey="valor" stroke="#6F4E37" fill="#6F4E37" fillOpacity={0.4} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card title="Ajustar Dimensiones" subtitle="Slide para modificar score de cada P">
                <div className="space-y-4">
                  {Object.entries(marketingMix).map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-coffee-700">{k}</span>
                        <span className={`text-sm font-bold ${v >= 75 ? 'text-emerald-600' : v >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{v}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={v}
                        onChange={(e) => setMarketingMix({ ...marketingMix, [k]: Number(e.target.value) })}
                        className="w-full accent-coffee-600"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card title="Interpretación de las 7P" subtitle="Qué significa cada dimensión en una cafetería">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  { p: 'Producto', d: 'Calidad del café, variedad de menú, consistencia de la receta' },
                  { p: 'Precio', d: 'Posicionamiento de precios vs competencia, margen percibido por el cliente' },
                  { p: 'Plaza', d: 'Ubicación, flujo peatonal, accesibilidad, delivery propio o vía apps' },
                  { p: 'Promoción', d: 'Redes sociales, campañas, programa de fidelización, alianzas locales' },
                  { p: 'Personas', d: 'Capacitación de baristas, atención al cliente, cultura del equipo' },
                  { p: 'Procesos', d: 'Tiempos de espera, eficiencia en barra, orden y limpieza operativa' },
                  { p: 'Presencia', d: 'Diseño del local, ambiente, branding visual, experiencia sensorial' },
                ].map(x => (
                  <div key={x.p} className="bg-coffee-50 p-3 rounded-lg">
                    <div className="font-semibold text-coffee-800">{x.p}</div>
                    <div className="text-coffee-600 text-xs mt-1">{x.d}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Acciones Sugeridas según Score">
              <div className="space-y-2 text-sm">
                {Object.entries(marketingMix)
                  .filter(([_, v]) => v < 70)
                  .map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                      <span className="text-amber-700 font-bold mt-0.5">⚠</span>
                      <div>
                        <div className="font-semibold text-amber-900">{k} · {v}/100</div>
                        <div className="text-amber-800 text-xs">Dimensión bajo el umbral de 70. Priorizar mejora en este pilar para fortalecer la propuesta de valor.</div>
                      </div>
                    </div>
                  ))}
                {Object.entries(marketingMix).filter(([_, v]) => v < 70).length === 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-emerald-800 text-sm">
                    ✓ Todas las dimensiones están sobre 70. Modelo de marketing equilibrado.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* CONTROL LEGAL */}
        {tab === 'legal' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-800">Control Legal y Cumplimiento Normativo</h2>
              <p className="text-coffee-500 text-sm mt-1">Registro editable de obligaciones · Seguimiento de vigencia · Indicador de compliance global</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <KPI label="Cumplimiento Global" value={formatPct(cumplimientoLegal)} sub={`${legalItems.filter(l => l.vigente).length} de ${legalItems.length} vigentes`} tone={cumplimientoLegal >= 80 ? 'positive' : cumplimientoLegal >= 60 ? 'accent' : 'negative'} />
              <KPI label="Items Vigentes" value={legalItems.filter(l => l.vigente).length} sub="Sin observaciones" tone="positive" />
              <KPI label="Items Pendientes" value={legalItems.filter(l => !l.vigente).length} sub="Requieren acción" tone="negative" />
              <KPI label="Total Registrado" value={legalItems.length} sub="Obligaciones en seguimiento" tone="default" />
            </div>

            <Card title="Estado de Cumplimiento" subtitle="Visualización rápida del compliance global">
              <div className="w-full bg-coffee-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all ${cumplimientoLegal >= 80 ? 'bg-emerald-500' : cumplimientoLegal >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${cumplimientoLegal}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-coffee-600 mt-2">
                <span>0%</span>
                <span className="font-semibold">{formatPct(cumplimientoLegal)} cumplimiento</span>
                <span>100%</span>
              </div>
            </Card>

            <Card title="Registro de Obligaciones Legales" subtitle="Marcar como vigente · Editar fechas de vencimiento">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-coffee-100 text-coffee-800">
                      <th className="text-left p-2 font-semibold">Obligación / Item</th>
                      <th className="text-center p-2 font-semibold">Vigente</th>
                      <th className="text-left p-2 font-semibold">Vencimiento</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {legalItems.map(l => (
                      <tr key={l.id} className="border-b border-coffee-100">
                        <td className="p-1"><input value={l.item} onChange={(e) => updateItem(setLegalItems, legalItems, l.id, 'item', e.target.value)} className="w-full min-w-[200px] px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1 text-center">
                          <input
                            type="checkbox"
                            checked={l.vigente}
                            onChange={(e) => updateItem(setLegalItems, legalItems, l.id, 'vigente', e.target.checked)}
                            className="w-5 h-5 accent-emerald-600 cursor-pointer"
                          />
                        </td>
                        <td className="p-1"><input value={l.vence} onChange={(e) => updateItem(setLegalItems, legalItems, l.id, 'vence', e.target.value)} className="w-full min-w-[120px] px-2 py-1.5 border border-coffee-200 rounded text-sm" /></td>
                        <td className="p-1"><button onClick={() => removeItem(setLegalItems, legalItems, l.id)} className="text-coffee-400 hover:text-rose-500 px-2">✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <AddButton onClick={() => addItem(setLegalItems, legalItems, { item: '', vigente: false, vence: '' })} label="Agregar obligación legal" />
              </div>
            </Card>

            <Card title="Marco Normativo Aplicable a Cafeterías en Chile" subtitle="Referencia rápida de organismos y regulaciones">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {[
                  { org: 'SII', d: 'Inicio de actividades, facturación electrónica, declaración de IVA mensual y renta anual' },
                  { org: 'SEREMI de Salud', d: 'Resolución sanitaria, certificación de manipulación de alimentos, fiscalizaciones' },
                  { org: 'Municipalidad', d: 'Patente comercial, permiso de funcionamiento, ordenanzas locales' },
                  { org: 'Dirección del Trabajo', d: 'Contratos, jornada legal, cotizaciones previsionales, libro de remuneraciones' },
                  { org: 'INAPI', d: 'Registro de marca comercial, protección de nombre y logo' },
                  { org: 'Mutual / SUSESO', d: 'Seguro de accidentes laborales, plan preventivo de riesgos' },
                ].map(x => (
                  <div key={x.org} className="bg-coffee-50 p-3 rounded-lg">
                    <div className="font-semibold text-coffee-800">{x.org}</div>
                    <div className="text-coffee-600 text-xs mt-1">{x.d}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </main>

      <footer className="max-w-7xl mx-auto px-4 md:px-6 py-8 mt-8 border-t border-coffee-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-coffee-500">
          <div>Modelo de Gestión · Cafetería · {new Date().getFullYear()}</div>
          <div>Desarrollado por Cristóbal Morales · Ing. en Negocios Internacionales · Analista de Datos</div>
        </div>
      </footer>
    </div>
  )
}
