import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  Package, Archive, DollarSign, AlertTriangle,
  Clock, Box, CheckCircle2, ArrowUpRight, Activity,
  Truck, TrendingUp, TrendingDown, BarChart3,
  ArrowDownCircle, ArrowUpCircle, RefreshCw, Users,
  ShoppingCart, Zap
} from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { cn } from '#/lib/utils'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ParticleField from '../components/ParticleField'
import { useApp } from '../context/AppContext'
import { useStockStats } from '../hooks/useStockStats'
import { getProveedores } from '../services/proveedorService'
import { getPedidos } from '../services/pedidoService'
import { getMovimientosNegocio } from '../services/movimientoService'

gsap.registerPlugin(ScrollTrigger)

/* ─── Reloj en tiempo real ───────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="font-mono tabular-nums">
      {time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

/* ─── Barra de stock con semáforo ───────────────────────────── */
const StockBar = ({ name, current, max, index }) => {
  const pct = Math.min((current / max) * 100, 100)
  const color = pct <= 20
    ? { bar: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' }
    : pct <= 50
    ? { bar: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500' }
    : { bar: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500' }

  return (
    <motion.div
      className="group flex flex-col gap-1.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.4 + index * 0.08 }}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{name}</span>
        <span className={cn('shrink-0 text-xs font-bold', color.text)}>{Math.round(pct)}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted/30">
        <div
          className="gsap-stock-bar-fill h-full rounded-full"
          data-pct={pct}
          style={{ width: 0, background: `linear-gradient(90deg, ${color.bar}, ${color.bar}aa)` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{current} / {max} uds</span>
        <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', color.bg, color.text)}>
          {pct <= 20 ? 'CRÍTICO' : pct <= 50 ? 'BAJO' : 'OK'}
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Item de alerta de stock ───────────────────────────────── */
const LowStockItem = ({ name, stock, index }) => (
  <motion.div
    className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3 transition-all hover:border-red-500/40 hover:bg-red-500/10"
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: index * 0.07 }}
  >
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
      <AlertTriangle size={17} className="text-red-500" />
      <span className="absolute -right-1 -top-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <span className="block truncate text-sm font-bold text-foreground">{name}</span>
      <span className="text-xs font-medium text-red-400/80">Stock mínimo alcanzado</span>
    </div>
    <Badge className="shrink-0 border-0 bg-red-500/15 font-bold text-red-500">
      {stock} uds
    </Badge>
  </motion.div>
)

/* ─── Pill de estado de pedido ───────────────────────────────── */
const EstadoPill = ({ estado }) => {
  const map = {
    PENDIENTE: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    ENVIADO:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
    RECIBIDO:  'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    CANCELADO: 'bg-red-500/15 text-red-400 border-red-500/30',
  }
  return (
    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', map[estado] ?? 'bg-muted text-muted-foreground')}>
      {estado}
    </span>
  )
}

/* ─── Movimiento Row ─────────────────────────────────────────── */
const MovRow = ({ mov, index }) => {
  const isEntrada = mov.tipo === 'ENTRADA'
  const isAjuste  = mov.tipo === 'AJUSTE'
  const Icon = isEntrada ? ArrowDownCircle : isAjuste ? RefreshCw : ArrowUpCircle
  const color = isEntrada ? 'text-emerald-500' : isAjuste ? 'text-blue-400' : 'text-rose-500'
  const bg    = isEntrada ? 'bg-emerald-500/10' : isAjuste ? 'bg-blue-500/10' : 'bg-rose-500/10'
  return (
    <motion.div
      className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', bg)}>
        <Icon size={14} className={color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{mov.producto?.nombre ?? 'Producto'}</p>
        <p className="text-[10px] text-muted-foreground capitalize">{mov.motivo ?? mov.tipo}</p>
      </div>
      <span className={cn('text-xs font-bold tabular-nums', color)}>
        {isEntrada ? '+' : isAjuste ? '±' : '-'}{mov.cantidad}
      </span>
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { productos = [], dashData } = useApp()
  const dashRef = useRef(null)

  // Datos de otros módulos
  const [proveedores, setProveedores] = useState([])
  const [pedidos, setPedidos]         = useState([])
  const [movimientos, setMovimientos] = useState([])

  useEffect(() => {
    getProveedores().then(d => setProveedores(Array.isArray(d) ? d : [])).catch(() => {})
    getPedidos().then(d => setPedidos(Array.isArray(d) ? d : [])).catch(() => {})
    getMovimientosNegocio(8).then(d => setMovimientos(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  // Usa hook compartido para calcular estadísticas
  const stats = useStockStats(productos)

  const totalProductos = dashData?.totalProductos ?? stats.totalProductos
  const totalStock = dashData?.totalStock ?? stats.totalStock
  const totalValue = dashData?.valorTotalInventario ?? stats.valorTotalInventario
  const lowStockCount = dashData?.productosStockCritico ?? stats.productosStockCritico
  const healthPct = stats.healthPercent

  // Métricas extra
  const pedidosPendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length
  const pedidosRecibidos  = pedidos.filter(p => p.estado === 'RECIBIDO').length
  const entradasHoy = movimientos.filter(m => m.tipo === 'ENTRADA').reduce((a, m) => a + (m.cantidad || 0), 0)
  const salidasHoy  = movimientos.filter(m => m.tipo === 'SALIDA').reduce((a, m) => a + (m.cantidad || 0), 0)

  const lowItems = useMemo(
    () => [...productos].filter(p => p.stock <= (p.stockMinimo || 5)).sort((a, b) => a.stock - b.stock),
    [productos]
  )
  const topStocked = useMemo(
    () => [...productos].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 5),
    [productos]
  )
  const pedidosRecientes = useMemo(() => pedidos.slice(0, 5), [pedidos])
  const movsRecientes    = useMemo(() => movimientos.slice(0, 6), [movimientos])

  /* ── GSAP ── */
  useEffect(() => {
    if (!dashRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-badge', { y: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1 })
      gsap.from('.gsap-hero-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power4.out', delay: 0.2 })
      gsap.from('.gsap-hero-sub',   { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.4 })
      gsap.from('.gsap-hero-stat',  { x: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.3 })
      gsap.from('.gsap-kpi',        { y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.5 })
      gsap.utils.toArray('.gsap-section').forEach((el) => {
        gsap.from(el, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        })
      })
      gsap.utils.toArray('.gsap-stock-bar-fill').forEach((bar) => {
        const target = bar.dataset.pct || '0'
        gsap.fromTo(bar, { width: '0%' }, {
          width: `${target}%`, duration: 1.4, ease: 'power3.out',
          scrollTrigger: { trigger: bar, start: 'top 92%', toggleActions: 'play none none none' }
        })
      })
    }, dashRef)
    return () => ctx.revert()
  }, [productos])

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div ref={dashRef} className="dashboard-aurora-bg relative min-h-screen overflow-hidden">
      {/* Aurora orbs de fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-[1440px] p-6 font-sans lg:p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >

        {/* ── Hero Banner ── */}
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-[1.5rem]">
            <div className="relative px-8 pb-8 pt-8 lg:px-10 lg:pt-10 bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#0d0d1f] dark:via-[#0a0f1e] dark:to-[#0f0a1a]">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <ParticleField className="h-full w-full opacity-60 dark:opacity-40" />
              </div>
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-400/15 blur-[80px]" />
                <div className="absolute -left-8 bottom-0 h-44 w-44 rounded-full bg-cyan-400/10 blur-[70px]" />
                <div className="absolute right-1/3 top-1/2 h-36 w-36 rounded-full bg-violet-400/10 blur-[60px]" />
              </div>

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="gsap-hero-badge flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs font-mono font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
                      <Activity size={11} />
                      <LiveClock />
                    </span>
                  </div>
                  <h1 className="gsap-hero-title font-heading text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white lg:text-4xl">
                    {greet()},
                    <span className="mt-1 block bg-gradient-to-r from-slate-800 via-slate-600 to-slate-400 dark:from-white/90 dark:via-white/60 dark:to-white/35 bg-clip-text text-transparent">
                      Panel de Control
                    </span>
                  </h1>
                  <p className="gsap-hero-sub mt-3 max-w-lg text-[14px] capitalize leading-relaxed text-slate-500 dark:text-white/45">
                    {today}
                  </p>
                </div>

                {/* Mini stats */}
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <div className="gsap-hero-stat flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 px-5 py-3 shadow-sm backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 dark:bg-emerald-500/20">
                      <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40">Salud del stock</p>
                      <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">{healthPct}%</p>
                    </div>
                  </div>
                  <div className="gsap-hero-stat flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5 px-5 py-3 shadow-sm backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 dark:bg-amber-500/20">
                      <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/40">Alertas activas</p>
                      <p className="font-heading text-lg font-bold text-slate-900 dark:text-white">{lowStockCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPIs Inventario ── */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <div className="gsap-kpi">
            <AuroraStatCard icon={Package} label="Total Productos" value={totalProductos} sub="en catálogo activo" glow="cyan" delay={0} />
          </div>
          <div className="gsap-kpi">
            <AuroraStatCard icon={Archive} label="Stock Total" value={totalStock} sub="unidades en inventario" glow="emerald" delay={0} />
          </div>
          <div className="gsap-kpi">
            <AuroraStatCard icon={DollarSign} label="Valor del Inventario" value={totalValue} prefix="$" decimals={2} sub="precio × stock" glow="violet" delay={0} />
          </div>
          <div className="gsap-kpi">
            <AuroraStatCard
              icon={lowStockCount > 0 ? AlertTriangle : CheckCircle2}
              label="Stock Crítico"
              value={lowStockCount}
              sub={lowStockCount > 0 ? 'productos ≤ mínimo' : 'Todo en orden'}
              glow={lowStockCount > 0 ? 'rose' : 'emerald'}
              delay={0}
            />
          </div>
        </div>



        {/* ── Distribución de Stock + Alertas ── */}
        <div className="gsap-section mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Stock */}
          <AuroraCard glow="emerald" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Distribución de Stock</h2>
                  <p className="text-sm text-muted-foreground">Top 5 productos con mayor inventario</p>
                </div>
                <ArrowUpRight size={18} className="text-muted-foreground" />
              </div>
              {topStocked.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-center">
                  <Box size={32} className="mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">Sin productos registrados</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {topStocked.map((p, i) => (
                    <StockBar key={p.id} name={p.nombre} current={p.stock || 0}
                      max={topStocked[0]?.stock || 100} index={i} />
                  ))}
                </div>
              )}
            </div>
          </AuroraCard>

          {/* Alertas */}
          <AuroraCard glow={lowItems.length > 0 ? 'rose' : 'emerald'} className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Alertas de Stock</h2>
                  <p className="text-sm text-muted-foreground">Productos que requieren atención</p>
                </div>
                {lowItems.length > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-500">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />
                    {lowItems.length} alertas
                  </span>
                )}
              </div>
              {lowItems.length === 0 ? (
                <motion.div
                  className="flex h-48 flex-col items-center justify-center text-center"
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle2 size={30} className="text-emerald-500" />
                  </div>
                  <p className="font-heading font-bold text-foreground">Inventario Saludable</p>
                  <p className="mt-1 text-sm text-muted-foreground">Todos los productos tienen stock suficiente.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-2">
                  {lowItems.map((p, i) => (
                    <LowStockItem key={p.id} name={p.nombre} stock={p.stock} index={i} />
                  ))}
                </div>
              )}
            </div>
          </AuroraCard>
        </div>

        {/* ── Pedidos recientes + Movimientos recientes ── */}
        <div className="gsap-section mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Pedidos recientes */}
          <AuroraCard glow="amber" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Pedidos a Proveedores</h2>
                  <p className="text-sm text-muted-foreground">Últimos pedidos registrados</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15">
                    <Truck size={11} className="text-amber-500" />
                  </span>
                  <span className="text-xs font-bold text-amber-500">{pedidosPendientes} pendientes</span>
                </div>
              </div>
              {pedidosRecientes.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <ShoppingCart size={28} className="mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Sin pedidos registrados</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/[0.06]">
                  {pedidosRecientes.map((p, i) => (
                    <motion.div
                      key={p.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.07 }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {p.proveedor?.nombre ?? `Proveedor #${p.proveedorId}`}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {p.producto?.nombre ?? 'Producto'} · {p.cantidad} uds
                        </p>
                      </div>
                      <EstadoPill estado={p.estado} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </AuroraCard>

          {/* Movimientos recientes */}
          <AuroraCard glow="blue" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Movimientos de Stock</h2>
                  <p className="text-sm text-muted-foreground">Últimas entradas, salidas y ajustes</p>
                </div>
                <Badge variant="outline" className="gap-1.5 border-white/10 text-foreground/50">
                  <Zap size={10} /> Live
                </Badge>
              </div>
              {movsRecientes.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center">
                  <BarChart3 size={28} className="mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Sin movimientos recientes</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {movsRecientes.map((m, i) => (
                    <MovRow key={m.id} mov={m} index={i} />
                  ))}
                </div>
              )}
            </div>
          </AuroraCard>

        </div>

        {/* ── Resumen ejecutivo ── */}
        <div className="gsap-section mb-8">
          <AuroraCard glow="violet">
            <div className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15">
                <BarChart3 size={22} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-base font-bold text-foreground">Resumen ejecutivo del negocio</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Tienes <strong className="text-foreground">{totalProductos}</strong> productos con un valor total de inventario de{' '}
                  <strong className="text-violet-400">${(totalValue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>.{' '}
                  {lowStockCount > 0
                    ? <span className="text-amber-500">{lowStockCount} producto(s) requieren reabastecimiento.</span>
                    : <span className="text-emerald-500">El inventario se encuentra en buen estado.</span>
                  }{' '}
                  Hay <strong className="text-foreground">{pedidosPendientes}</strong> pedido(s) pendiente(s) de{' '}
                  <strong className="text-foreground">{proveedores.length}</strong> proveedor(es) registrado(s).
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {healthPct >= 70
                  ? <TrendingUp size={20} className="text-emerald-500" />
                  : <TrendingDown size={20} className="text-rose-500" />
                }
                <span className={cn('font-heading text-2xl font-bold', healthPct >= 70 ? 'text-emerald-500' : 'text-rose-500')}>
                  {healthPct}%
                </span>
              </div>
            </div>
          </AuroraCard>
        </div>

      </motion.div>
    </div>
  )
}

export default Dashboard
