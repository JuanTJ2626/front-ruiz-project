import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  BarChart3, FileDown, FileSpreadsheet, Package, DollarSign,
  TrendingUp, Archive, AlertTriangle, Download
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts'
import { PageLayout } from '../components/PageLayout'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { toast } from 'sonner'
import { useApp } from '../context/AppContext'
import { useStockStats } from '../hooks/useStockStats'
import { useErrorHandler } from '../hooks/useErrorHandler'

const CHART_COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-md">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.name?.includes('Valor') ? `$${p.value.toLocaleString('es-MX')}` : p.value}
        </p>
      ))}
    </div>
  )
}

const ExportButton = ({ icon: Icon, label, format, onClick }) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all hover:border-cyan-500/25 hover:bg-cyan-500/5"
  >
    <div className="aurora-icon-ring flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110">
      <Icon size={22} strokeWidth={1.75} />
    </div>
    <div className="text-center">
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">Formato {format}</p>
    </div>
    <Badge variant="outline" className="gap-1 border-cyan-500/20 text-cyan-400">
      <Download size={11} /> Descargar
    </Badge>
  </button>
)

const ReportesDashboard = () => {
  const { productos = [] } = useApp()
  const stats = useStockStats(productos) // Hook compartido
  const { handleError } = useErrorHandler()

  const stockChart = useMemo(() =>
    [...productos]
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 6)
      .map(p => ({ name: p.nombre?.slice(0, 12) || 'Producto', stock: p.stock || 0, valor: (p.precio || 0) * (p.stock || 0) })),
    [productos]
  )

  const valueChart = useMemo(() =>
    [...productos]
      .sort((a, b) => ((b.precio || 0) * (b.stock || 0)) - ((a.precio || 0) * (a.stock || 0)))
      .slice(0, 5)
      .map(p => ({ name: p.nombre?.slice(0, 14) || 'Producto', value: (p.precio || 0) * (p.stock || 0) })),
    [productos]
  )

  const trendData = useMemo(() => {
    const base = stats.valorTotalInventario || 1000
    return [
      { mes: 'Ene', valor: base * 0.7 },
      { mes: 'Feb', valor: base * 0.75 },
      { mes: 'Mar', valor: base * 0.82 },
      { mes: 'Abr', valor: base * 0.88 },
      { mes: 'May', valor: base * 0.93 },
      { mes: 'Jun', valor: base },
    ]
  }, [stats.valorTotalInventario])

  const handleExport = async (format) => {
    const { exportarCSV, exportarPDF, exportarExcel } = await import('../services/dashboardService')
    try {
      if (format === 'pdf')        { exportarPDF();   toast.success('Descargando reporte PDF...') }
      else if (format === 'excel') { exportarExcel(); toast.success('Descargando reporte Excel...') }
      else                         { exportarCSV();   toast.success('Descargando reporte CSV...') }
    } catch (err) {
      handleError(err, {
        operation: 'generar el reporte',
        forbiddenMsg: 'No tienes permiso para descargar reportes',
        notFoundMsg: 'El reporte no está disponible en este momento',
      })
    }
  }

  return (
    <PageLayout
      title="Reportes e Informes"
      subtitle="Métricas clave del inventario con exportación a PDF y CSV desde el backend."

      actions={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2 rounded-xl border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
            <FileSpreadsheet size={16} /> <span className="hidden sm:inline">Exportar</span> CSV
          </Button>
          <Button onClick={() => handleExport('pdf')} className="gap-2 rounded-xl shadow-md">
            <FileDown size={16} /> <span className="hidden sm:inline">Exportar</span> PDF
          </Button>
        </div>
      }
    >
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <AuroraStatCard icon={Package} label="Productos" value={stats.totalProductos ?? 0} sub="en inventario" glow="cyan" delay={80} />
        <AuroraStatCard icon={Archive} label="Stock Total" value={(stats.totalStock ?? 0).toLocaleString()} sub="unidades" glow="emerald" delay={160} />
        <AuroraStatCard icon={DollarSign} label="Valor Inventario" value={`$${(stats.valorTotalInventario ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} sub="valor actual" glow="violet" delay={240} />
        <AuroraStatCard icon={AlertTriangle} label="Alertas Stock" value={stats.productosStockCritico ?? 0} sub="productos críticos" glow="amber" delay={320} trend={(stats.productosStockCritico ?? 0) > 0 ? 'Atención' : undefined} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AuroraCard glow="cyan" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Stock por Producto</h2>
                  <p className="text-sm text-muted-foreground">Top 6 productos con más unidades</p>
                </div>
                <BarChart3 size={18} className="text-muted-foreground" />
              </div>
              {stockChart.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Sin datos de productos</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stockChart} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="stock" name="Stock" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </AuroraCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <AuroraCard glow="violet" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Valor por Producto</h2>
                  <p className="text-sm text-muted-foreground">Distribución del valor del inventario</p>
                </div>
                <TrendingUp size={18} className="text-muted-foreground" />
              </div>
              {valueChart.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Sin datos de productos</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={valueChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {valueChart.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </AuroraCard>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <motion.div className="xl:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <AuroraCard glow="emerald">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="font-heading text-lg font-bold text-foreground">Tendencia del Inventario</h2>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Evolución estimada del valor total (últimos 6 meses)</p>
                  <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-[10px]">
                    Proyección simulada
                  </Badge>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="auroraGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="valor" name="Valor" stroke="#06b6d4" strokeWidth={2} fill="url(#auroraGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </AuroraCard>
        </motion.div>

        <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <AuroraCard glow="blue" className="h-full">
            <div className="p-6">
              <h2 className="mb-1 font-heading text-lg font-bold text-foreground">Exportar Reportes</h2>
              <p className="mb-5 text-sm text-muted-foreground">Generados por el backend Spring Boot</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <ExportButton icon={FileDown} label="Inventario Completo" format="PDF" onClick={() => handleExport('pdf')} />
                <ExportButton icon={FileSpreadsheet} label="Inventario Completo" format="CSV" onClick={() => handleExport('csv')} />
              </div>
              <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Los reportes se generan vía API REST. Endpoints esperados:
                  <code className="mt-1 block text-cyan-400">GET /api/reportes/inventario/pdf</code>
                  <code className="block text-cyan-400">GET /api/reportes/inventario/csv</code>
                </p>
              </div>
            </div>
          </AuroraCard>
        </motion.div>
      </div>
    </PageLayout>
  )
}

export default ReportesDashboard
