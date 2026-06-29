import { useMemo, useState, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  Package, Archive, DollarSign, AlertTriangle,
  Clock, Box, CheckCircle2, ArrowUpRight, Activity
} from 'lucide-react'
import { Badge } from './ui/badge'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { cn } from '#/lib/utils'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ParticleField from './ParticleField'
import { getDashboard } from '../services/dashboardService'
import { useApp } from '../context/AppContext'

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
      <div className="flex items-center justify-between text-sm">
        <span className="max-w-[180px] truncate font-semibold text-foreground">{name}</span>
        <span className={cn('text-xs font-bold', color.text)}>{Math.round(pct)}%</span>
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

/* ════════════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { productos = [] } = useApp()
  const dashRef = useRef(null)
  const [dashData, setDashData] = useState(null)

  // Carga los datos del endpoint /dashboard/negocio/{id}
  useEffect(() => {
    getDashboard()
      .then(data => setDashData(data))
      .catch(() => {/* fallback a props */})
  }, [])

  // Usa datos del backend si están disponibles, fallback a props
  const totalProductos = dashData?.totalProductos ?? productos.length
  const totalStock = dashData ? null : productos.reduce((s, p) => s + (p.stock || 0), 0)
  const totalValue = dashData?.valorTotalInventario ?? productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || 0)), 0)
  const lowStockCount = dashData?.productosStockCritico ?? productos.filter(p => p.stock <= 5).length
  const pedidosPendientes = dashData?.pedidosPendientes ?? 0
  const recentMovimientos = dashData?.ultimosMovimientos ?? []
  const productosBajoStock = dashData?.productosBajoStock ?? productos.filter(p => p.stock <= 5)

  const stats = useMemo(() => {
    const ts = totalStock ?? productos.reduce((s, p) => s + (p.stock || 0), 0)
    return {
      totalStock: ts,
      totalValue,
      lowStock: productosBajoStock,
    }
  }, [totalStock, totalValue, productosBajoStock, productos])

  const lowItems = useMemo(
    () => [...productos].filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock),
    [productos]
  )
  const recent = useMemo(() => [...productos].slice(-5).reverse(), [productos])
  const topStocked = useMemo(
    () => [...productos].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 5),
    [productos]
  )

  const healthPct = productos.length === 0 ? 100
    : Math.round(((productos.length - stats.lowStock.length) / productos.length) * 100)

  /* ── GSAP ── */
  useEffect(() => {
    if (!dashRef.current) return
    const ctx = gsap.context(() => {

      gsap.from('.gsap-hero-badge', {
        y: -20, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.1
      })
      gsap.from('.gsap-hero-title', {
        y: 30, opacity: 0, duration: 0.8, ease: 'power4.out', delay: 0.2
      })
      gsap.from('.gsap-hero-sub', {
        y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.4
      })
      gsap.from('.gsap-hero-stat', {
        x: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.3
      })
      gsap.from('.gsap-kpi', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)', delay: 0.5
      })

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
            <div className="relative px-8 pb-8 pt-8 lg:px-10 lg:pt-10"
              style={{ background: 'linear-gradient(135deg, #0d0d1f 0%, #0a0f1e 40%, #0f0a1a 70%, #0d0d1f 100%)' }}
            >
              {/* Partículas Three.js */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <ParticleField className="h-full w-full opacity-50" />
              </div>
              {/* Aurora orbs internos */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-violet-600/30 blur-[80px]" />
                <div className="absolute -left-8 bottom-0 h-44 w-44 rounded-full bg-cyan-500/20 blur-[70px]" />
                <div className="absolute right-1/3 top-1/2 h-36 w-36 rounded-full bg-rose-500/15 blur-[60px]" />
              </div>

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="gsap-hero-badge flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      Sistema activo
                    </span>
                    <span className="gsap-hero-badge ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-semibold text-white/50">
                      <Activity size={11} />
                      <LiveClock />
                    </span>
                  </div>
                  <h1 className="gsap-hero-title font-heading text-3xl font-bold leading-tight tracking-tight text-white lg:text-4xl">
                    {greet()}, Admin
                    <span className="mt-1 block bg-gradient-to-r from-white/90 via-white/60 to-white/35 bg-clip-text text-transparent">
                      Sistema de Inventario
                    </span>
                  </h1>
                  <p className="gsap-hero-sub mt-3 max-w-lg text-[14px] capitalize leading-relaxed text-white/45">
                    {today}
                  </p>
                </div>

                {/* Mini stats del negocio */}
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <div className="gsap-hero-stat flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Salud del stock</p>
                      <p className="font-heading text-lg font-bold text-white">{healthPct}%</p>
                    </div>
                  </div>
                  <div className="gsap-hero-stat flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20">
                      <AlertTriangle size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Alertas activas</p>
                      <p className="font-heading text-lg font-bold text-white">{stats.lowStock.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="gsap-kpi">
            <AuroraStatCard icon={Package} label="Total Productos" value={totalProductos} sub="en catálogo activo" glow="cyan" delay={0} />
          </div>
          <div className="gsap-kpi">
            <AuroraStatCard icon={Archive} label="Stock Total" value={stats.totalStock} sub="unidades en inventario" glow="emerald" delay={0} />
          </div>
          <div className="gsap-kpi">
            <AuroraStatCard icon={DollarSign} label="Valor del Inventario" value={stats.totalValue} prefix="$" decimals={2} sub="precio × stock en tiempo real" glow="violet" delay={0} />
          </div>
          <div className="gsap-kpi">
            <AuroraStatCard
              icon={lowStockCount > 0 ? AlertTriangle : CheckCircle2}
              label="Stock Crítico"
              value={lowStockCount}
              sub={lowStockCount > 0 ? 'productos ≤ mínimo' : 'Todo en orden'}
              glow={lowStockCount > 0 ? 'rose' : 'emerald'}
              delay={0}
              trend={lowStockCount > 0 ? `${lowStockCount} alertas` : '✓ Saludable'}
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
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

        {/* ── Actividad Reciente ── */}
        <div className="gsap-section">
          <AuroraCard glow="blue" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Actividad Reciente</h2>
                  <p className="text-sm text-muted-foreground">Últimos productos registrados en el catálogo</p>
                </div>
                <Badge variant="outline" className="gap-1.5 border-white/10 text-foreground/50">
                  <Clock size={11} /> {productos.length} total
                </Badge>
              </div>
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Package size={30} className="mb-3 text-muted-foreground/30" />
                  <p className="font-medium text-muted-foreground">No hay actividad reciente</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-white/[0.06]">
                  {recent.map((p, i) => (
                    <motion.div
                      key={p.id}
                      className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.07 }}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="aurora-icon-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                          <Box size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">{p.nombre}</p>
                          <p className="text-xs text-muted-foreground">Registrado recientemente</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-bold text-foreground/80 tabular-nums">${p.precio?.toFixed(2)}</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-semibold',
                            p.stock <= 5
                              ? 'border-red-500/30 bg-red-500/10 text-red-500'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          )}
                        >
                          {p.stock} uds
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </AuroraCard>
        </div>

      </motion.div>
    </div>
  )
}

export default Dashboard
