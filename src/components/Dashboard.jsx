import { useMemo, useState, useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring } from 'motion/react'
import {
  Package, Archive, DollarSign, AlertTriangle, TrendingUp, Clock, Box,
  Smartphone, Bell, Building2, FileDown, Globe, Shield, Layers,
  BarChart3, Truck, Users, Zap, CheckCircle2, Circle, Sparkles,
  ArrowUpRight, Database, Server, GitBranch, Activity, TrendingDown
} from 'lucide-react'
import { Badge } from './ui/badge'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { cn } from '#/lib/utils'

/* ─── Contador animado ─────────────────────────────────────── */
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18, mass: 0.8 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const raw = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
    motionVal.set(raw)
  }, [inView, value, motionVal])

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      const raw = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value
      const pct = raw === 0 ? 1 : v / raw
      const formatted = decimals > 0
        ? v.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(v).toLocaleString('es-MX')
      setDisplay(formatted)
      if (pct >= 0.999) setDisplay(
        decimals > 0
          ? raw.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
          : Math.round(raw).toLocaleString('es-MX')
      )
    })
    return unsub
  }, [spring, value, decimals])

  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

/* ─── Barra de stock con semáforo ──────────────────────────── */
const StockBar = ({ name, current, max, index }) => {
  const pct = Math.min((current / max) * 100, 100)
  const color = pct <= 20 ? { bar: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' }
    : pct <= 50 ? { bar: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500' }
    : { bar: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500' }

  return (
    <motion.div
      className="group flex flex-col gap-1.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.5 + index * 0.08 }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="max-w-[180px] truncate font-semibold text-foreground">{name}</span>
        <span className={cn('text-xs font-bold', color.text)}>{Math.round(pct)}%</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted/30">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.4, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `linear-gradient(90deg, ${color.bar}, ${color.bar}aa)` }}
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

/* ─── Item de alerta de stock ──────────────────────────────── */
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

/* ─── Feature card ──────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, description, glow, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="h-full"
  >
    <AuroraCard glow={glow} className="h-full transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-full flex-col gap-3 p-5">
        <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
          <Icon size={18} strokeWidth={1.75} />
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold text-foreground">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
    </AuroraCard>
  </motion.div>
)

/* ─── Fila de módulo ────────────────────────────────────────── */
const statusConfig = {
  'Activo':    { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  'En curso':  { dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  'Pendiente': { dot: 'bg-muted-foreground/40', bg: 'bg-muted/50 text-muted-foreground', border: 'border-muted/50' },
}

const ModuleRow = ({ icon: Icon, name, description, priority, status, delay }) => {
  const s = statusConfig[status] ?? statusConfig['Pendiente']
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay }}
      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div className="aurora-icon-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-bold text-foreground">{name}</span>
          <Badge variant="outline" className={cn('text-[10px] font-bold uppercase tracking-wider',
            priority === 'mvp' ? 'border-violet-500/30 bg-violet-500/10 text-violet-500' : 'border-muted/50 text-muted-foreground'
          )}>
            {priority === 'mvp' ? 'MVP' : 'Media'}
          </Badge>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', s.bg, s.border)}>
        <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
        {status}
      </div>
    </motion.div>
  )
}

/* ─── Timeline de fases ─────────────────────────────────────── */
const PhaseItem = ({ phase, period, deliverables, status, index, isLast }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
    className="relative flex gap-4"
  >
    <div className="flex flex-col items-center">
      <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2',
        status === 'active'
          ? 'border-violet-400 bg-violet-500/20 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
          : 'border-muted/40 bg-muted/10 text-muted-foreground/50'
      )}>
        {status === 'active' ? <Zap size={14} /> : <Circle size={8} fill="currentColor" />}
      </div>
      {!isLast && <div className="mt-1 w-px flex-1 bg-gradient-to-b from-violet-500/30 to-transparent" />}
    </div>
    <div className="pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-heading text-sm font-bold text-foreground">{phase}</span>
        <span className={cn('text-xs font-medium', status === 'active' ? 'text-violet-400' : 'text-muted-foreground')}>{period}</span>
        {status === 'active' && (
          <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-500">EN CURSO</span>
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{deliverables}</p>
    </div>
  </motion.div>
)

/* ─── Tech badge ─────────────────────────────────────────────── */
const TechBadge = ({ icon: Icon, label, sub, color = 'cyan' }) => {
  const colors = {
    cyan:    'text-cyan-500 bg-cyan-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    violet:  'text-violet-500 bg-violet-500/10',
    amber:   'text-amber-500 bg-amber-500/10',
    blue:    'text-blue-500 bg-blue-500/10',
    rose:    'text-rose-500 bg-rose-500/10',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-all hover:border-white/12 hover:bg-white/[0.06] hover:-translate-y-0.5">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', colors[color])}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}

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

/* ════════════════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
════════════════════════════════════════════════════════════ */
const Dashboard = ({ productos }) => {
  const stats = useMemo(() => {
    const totalStock = productos.reduce((s, p) => s + (p.stock || 0), 0)
    const totalValue = productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || 0)), 0)
    const lowStock = productos.filter(p => p.stock <= 5)
    return { totalStock, totalValue, lowStock }
  }, [productos])

  const lowItems = useMemo(
    () => [...productos].filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock),
    [productos]
  )
  const recent = useMemo(() => [...productos].slice(-5).reverse(), [productos])
  const topStocked = useMemo(
    () => [...productos].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 5),
    [productos]
  )

  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const features = [
    { icon: Smartphone, title: 'Multi-dispositivo', description: 'Accede desde computadora, celular o tablet.', glow: 'cyan' },
    { icon: Bell, title: 'Alertas automáticas', description: 'Notificaciones cuando el stock baja del mínimo.', glow: 'amber' },
    { icon: Building2, title: 'Multi-negocio', description: 'Administra varios negocios con una sola cuenta.', glow: 'violet' },
    { icon: FileDown, title: 'Exportación', description: 'Reportes en PDF y CSV generados por el backend.', glow: 'emerald' },
    { icon: Globe, title: '100% en línea', description: 'Sin instalaciones, funciona en el navegador.', glow: 'blue' },
    { icon: Shield, title: 'Auth seguro', description: 'JWT + roles de administrador y empleado.', glow: 'rose' },
  ]

  const modules = [
    { icon: Users,    name: 'Usuarios y acceso',    description: 'Registro, login, roles y permisos',            priority: 'mvp',   status: 'En curso' },
    { icon: Package,  name: 'Gestión de productos', description: 'CRUD con categorías, fotos y atributos',        priority: 'mvp',   status: 'Activo' },
    { icon: Archive,  name: 'Control de stock',     description: 'Entradas, salidas, ajustes y alertas',          priority: 'mvp',   status: 'En curso' },
    { icon: Truck,    name: 'Proveedores',           description: 'Directorio de contactos y pedidos',             priority: 'media', status: 'Pendiente' },
    { icon: BarChart3,name: 'Reportes y dashboard', description: 'Métricas clave y exportación',                  priority: 'media', status: 'Activo' },
    { icon: Layers,   name: 'Multi-negocio',         description: 'Una cuenta, múltiples negocios',                priority: 'media', status: 'Pendiente' },
  ]

  const phases = [
    { phase: 'Fase 1', period: 'Día 1–3',   deliverables: 'Setup, modelo de datos, auth JWT, CRUD productos',    status: 'active' },
    { phase: 'Fase 2', period: 'Día 4–6',   deliverables: 'Control de stock, movimientos, alertas de mínimo',    status: 'pending' },
    { phase: 'Fase 3', period: 'Día 7–9',   deliverables: 'Dashboard, reportes, módulo de proveedores',          status: 'pending' },
    { phase: 'Fase 4', period: 'Día 10–12', deliverables: 'Multi-negocio, roles y permisos granulares',          status: 'pending' },
    { phase: 'Fase 5', period: 'Día 13–15', deliverables: 'UX responsive, pruebas, CI/CD, documentación',        status: 'pending' },
  ]

  const healthPct = productos.length === 0 ? 100
    : Math.round(((productos.length - stats.lowStock.length) / productos.length) * 100)

  return (
    <div className="dashboard-aurora-bg relative min-h-screen overflow-hidden">
      {/* Ambient aurora orbs */}
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
        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <AuroraCard glow="cyan" featured className="overflow-hidden">
            <div className="relative p-8 lg:p-10">
              {/* Grid pattern overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
              />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-foreground/80 backdrop-blur-sm">
                      <Sparkles size={12} className="text-amber-400" />
                      v1.0 · Junio 2026
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      Sistema activo
                    </span>
                    <span className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-semibold text-muted-foreground">
                      <Activity size={11} />
                      <LiveClock />
                    </span>
                  </div>
                  <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground lg:text-4xl">
                    {greet()}, <span className="text-foreground">Admin</span>
                    <span className="mt-1 block bg-gradient-to-r from-foreground/90 via-foreground/60 to-foreground/40 bg-clip-text text-transparent">
                      Sistema de Inventario
                    </span>
                  </h1>
                  <p className="mt-3 max-w-lg text-[14px] capitalize leading-relaxed text-muted-foreground">
                    {today}
                  </p>
                </div>

                {/* Mini stats rápidos */}
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-5 py-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Salud del stock</p>
                      <p className="font-heading text-lg font-bold text-foreground">{healthPct}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-5 py-3 backdrop-blur-sm">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15">
                      <Server size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Backend</p>
                      <p className="font-heading text-lg font-bold text-foreground">Spring Boot 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AuroraCard>
        </motion.div>

        {/* ── KPIs con contador animado ── */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuroraStatCard
            icon={Package}
            label="Total Productos"
            value={productos.length}
            sub="en catálogo activo"
            glow="cyan"
            delay={80}
          />
          <AuroraStatCard
            icon={Archive}
            label="Stock Total"
            value={stats.totalStock}
            sub="unidades en inventario"
            glow="emerald"
            delay={160}
          />
          <AuroraStatCard
            icon={DollarSign}
            label="Valor del Inventario"
            value={stats.totalValue}
            prefix="$"
            decimals={2}
            sub="precio × stock en tiempo real"
            glow="violet"
            delay={240}
          />
          <AuroraStatCard
            icon={stats.lowStock.length > 0 ? AlertTriangle : CheckCircle2}
            label="Stock Crítico"
            value={stats.lowStock.length}
            sub={stats.lowStock.length > 0 ? 'productos ≤ 5 unidades' : 'Todo en orden'}
            glow={stats.lowStock.length > 0 ? 'rose' : 'emerald'}
            delay={320}
            trend={stats.lowStock.length > 0 ? `${stats.lowStock.length} alertas` : '✓ Saludable'}
          />
        </div>

        {/* ── Propuesta de Valor ── */}
        <div className="mb-8">
          <div className="mb-5">
            <h2 className="font-heading text-xl font-bold text-foreground">Capacidades del Sistema</h2>
            <p className="text-sm text-muted-foreground">Lo que hace diferente a esta plataforma</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={0.3 + i * 0.06} />
            ))}
          </div>
        </div>

        {/* ── Módulos + Fases ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <motion.div className="xl:col-span-3"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Módulos del Sistema</h2>
                    <p className="text-sm text-muted-foreground">MVP y fases posteriores</p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-blue-500/20 bg-blue-500/10 text-blue-500">
                    <Layers size={11} /> 6 módulos
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {modules.map((m, i) => (
                    <ModuleRow key={m.name} {...m} delay={0.45 + i * 0.06} />
                  ))}
                </div>
              </div>
            </AuroraCard>
          </motion.div>

          <motion.div className="xl:col-span-2"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AuroraCard glow="violet" className="h-full">
              <div className="p-6">
                <div className="mb-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">Plan de Desarrollo</h2>
                  <p className="text-sm text-muted-foreground">15 días · 5 fases de entrega</p>
                </div>
                <div className="flex flex-col">
                  {phases.map((p, i) => (
                    <PhaseItem key={p.phase} {...p} index={i} isLast={i === phases.length - 1} />
                  ))}
                </div>
              </div>
            </AuroraCard>
          </motion.div>
        </div>

        {/* ── Stock + Alertas ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <AuroraCard glow="emerald" className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Distribución de Stock</h2>
                    <p className="text-sm text-muted-foreground">Productos con mayor inventario</p>
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
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
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
                  <motion.div className="flex h-48 flex-col items-center justify-center text-center"
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
          </motion.div>
        </div>

        {/* ── Stack + Actividad ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <motion.div className="xl:col-span-2"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AuroraCard glow="cyan" className="h-full">
              <div className="p-6">
                <div className="mb-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">Stack Tecnológico</h2>
                  <p className="text-sm text-muted-foreground">React + Spring Boot · REST/JSON</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <TechBadge icon={Server}    label="Spring Boot 3" sub="Java 21 · REST API"    color="emerald" />
                  <TechBadge icon={Globe}     label="React 18+"     sub="Vite · Componentes"    color="cyan" />
                  <TechBadge icon={Database}  label="MySQL 8"       sub="Spring Data JPA"        color="blue" />
                  <TechBadge icon={Shield}    label="JWT Security"  sub="Auth stateless"         color="violet" />
                  <TechBadge icon={FileDown}  label="OpenAPI 3"     sub="Swagger docs"           color="amber" />
                  <TechBadge icon={GitBranch} label="Git"           sub="CI/CD · GitHub"         color="rose" />
                </div>
              </div>
            </AuroraCard>
          </motion.div>

          <motion.div className="xl:col-span-3"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Actividad Reciente</h2>
                    <p className="text-sm text-muted-foreground">Últimos productos registrados</p>
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
                      <motion.div key={p.id}
                        className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + i * 0.07 }}
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
                          <Badge variant="outline" className={cn(
                            'font-semibold',
                            p.stock <= 5
                              ? 'border-red-500/30 bg-red-500/10 text-red-500'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          )}>
                            {p.stock} uds
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>
        </div>

      </motion.div>
    </div>
  )
}

export default Dashboard
