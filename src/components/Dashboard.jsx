import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Package, Archive, DollarSign, AlertTriangle, TrendingUp, Clock, Box,
  Smartphone, Bell, Building2, FileDown, Globe, Shield, Layers,
  BarChart3, Truck, Users, Zap, CheckCircle2, Circle, Sparkles,
  ArrowUpRight, Database, Server, GitBranch
} from 'lucide-react'
import { Badge } from './ui/badge'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { cn } from '#/lib/utils'

const AURORA_COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899']

const StockBar = ({ name, current, max, color, index }) => {
  const pct = Math.min((current / max) * 100, 100)
  return (
    <motion.div
      className="group flex flex-col gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.5 + index * 0.08 }}
    >
      <div className="flex items-center justify-between text-sm">
        <span className="max-w-[180px] truncate font-semibold text-foreground">{name}</span>
        <span className="font-bold text-muted-foreground">{Math.round(pct)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted/40">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{current} / {max} uds</span>
    </motion.div>
  )
}

const LowStockItem = ({ name, stock }) => (
  <motion.div
    className="flex items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/5 p-3 transition-colors hover:border-red-500/25 hover:bg-red-500/10"
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
      <AlertTriangle size={18} className="text-red-400" />
    </div>
    <div className="min-w-0 flex-1">
      <span className="block truncate text-sm font-bold text-foreground">{name}</span>
      <span className="text-xs font-medium text-red-400">Stock mínimo alcanzado</span>
    </div>
    <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-400">
      {stock} uds
    </Badge>
  </motion.div>
)

const FeatureCard = ({ icon: Icon, title, description, glow, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    className="h-full"
  >
    <AuroraCard glow={glow} className="h-full transition-transform duration-500 hover:-translate-y-0.5">
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

const ModuleRow = ({ icon: Icon, name, description, priority, status, delay }) => (
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
        <Badge
          variant="outline"
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider',
            priority === 'mvp'
              ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
              : 'border-violet-500/30 bg-violet-500/10 text-violet-400'
          )}
        >
          {priority === 'mvp' ? 'MVP' : 'Media'}
        </Badge>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
    <Badge variant="outline" className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
      {status}
    </Badge>
  </motion.div>
)

const PhaseItem = ({ phase, period, deliverables, status, index, isLast }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
    className="relative flex gap-4"
  >
    <div className="flex flex-col items-center">
      <div className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border-2',
        status === 'active'
          ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
          : 'border-muted-foreground/30 bg-muted/30 text-muted-foreground'
      )}>
        {status === 'active' ? <Zap size={14} /> : <Circle size={10} fill="currentColor" />}
      </div>
      {!isLast && <div className="mt-1 w-px flex-1 bg-gradient-to-b from-cyan-500/40 to-transparent" />}
    </div>
    <div className="pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-heading text-sm font-bold text-foreground">{phase}</span>
        <span className="text-xs font-medium text-muted-foreground">{period}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{deliverables}</p>
    </div>
  </motion.div>
)

const TechBadge = ({ icon: Icon, label, sub }) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-colors hover:border-cyan-500/20 hover:bg-cyan-500/5">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
      <Icon size={16} className="text-cyan-400" />
    </div>
    <div>
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  </div>
)

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
    { icon: Users, name: 'Usuarios y acceso', description: 'Registro, login, roles y permisos', priority: 'mvp', status: 'En curso' },
    { icon: Package, name: 'Gestión de productos', description: 'CRUD con categorías, fotos y atributos', priority: 'mvp', status: 'Activo' },
    { icon: Archive, name: 'Control de stock', description: 'Entradas, salidas, ajustes y alertas', priority: 'mvp', status: 'En curso' },
    { icon: Truck, name: 'Proveedores', description: 'Directorio de contactos y pedidos', priority: 'media', status: 'Pendiente' },
    { icon: BarChart3, name: 'Reportes y dashboard', description: 'Métricas clave y exportación', priority: 'media', status: 'Activo' },
    { icon: Layers, name: 'Multi-negocio', description: 'Una cuenta, múltiples negocios', priority: 'media', status: 'Pendiente' },
  ]

  const phases = [
    { phase: 'Fase 1', period: 'Día 1–3', deliverables: 'Setup, modelo de datos, auth JWT, CRUD productos', status: 'active' },
    { phase: 'Fase 2', period: 'Día 4–6', deliverables: 'Control de stock, movimientos, alertas de mínimo', status: 'pending' },
    { phase: 'Fase 3', period: 'Día 7–9', deliverables: 'Dashboard, reportes, módulo de proveedores', status: 'pending' },
    { phase: 'Fase 4', period: 'Día 10–12', deliverables: 'Multi-negocio, roles y permisos granulares', status: 'pending' },
    { phase: 'Fase 5', period: 'Día 13–15', deliverables: 'UX responsive, pruebas, CI/CD, documentación', status: 'pending' },
  ]

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
        transition={{ duration: 0.7 }}
      >
        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <AuroraCard glow="cyan" featured className="overflow-hidden">
            <div className="relative p-8 lg:p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <Badge className="gap-1.5 border-0 bg-cyan-500/15 px-3 py-1 text-cyan-300 hover:bg-cyan-500/20">
                      <Sparkles size={13} />
                      v1.0 · Junio 2026
                    </Badge>
                    <Badge variant="outline" className="gap-1.5 border-emerald-500/25 bg-emerald-500/10 text-emerald-400">
                      <TrendingUp size={13} />
                      Sistema activo
                    </Badge>
                  </div>
                  <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground lg:text-4xl">
                    Sistema de Inventario en Línea
                    <span className="mt-1 block bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                      para Pequeños Negocios
                    </span>
                  </h1>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    {greet()}, Admin — {today}. Gestiona tu inventario de forma accesible,
                    intuitiva y eficiente desde cualquier dispositivo con conexión a internet.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                    <CheckCircle2 size={20} className="text-emerald-400" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">API Response</p>
                      <p className="font-heading text-lg font-bold text-foreground">&lt; 500 ms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-sm">
                    <Server size={20} className="text-cyan-400" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Backend</p>
                      <p className="font-heading text-lg font-bold text-foreground">Spring Boot 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AuroraCard>
        </motion.div>

        {/* ── Stats Aurora Cards ── */}
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
            value={stats.totalStock.toLocaleString()}
            sub="unidades en inventario"
            glow="emerald"
            delay={160}
          />
          <AuroraStatCard
            icon={DollarSign}
            label="Valor del Inventario"
            value={`$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            sub="precio × stock en tiempo real"
            glow="violet"
            delay={240}
          />
          <AuroraStatCard
            icon={AlertTriangle}
            label="Stock Crítico"
            value={stats.lowStock.length}
            sub="productos ≤ 5 unidades"
            glow="amber"
            delay={320}
            trend={stats.lowStock.length > 0 ? 'Atención' : undefined}
          />
        </div>

        {/* ── Propuesta de Valor ── */}
        <div className="mb-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">Propuesta de Valor</h2>
              <p className="text-sm text-muted-foreground">Ventajas diferenciadoras del sistema</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <FeatureCard key={f.title} {...f} delay={0.35 + i * 0.07} />
            ))}
          </div>
        </div>

        {/* ── Módulos + Fases ── */}
        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-5">
          <motion.div
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Módulos del Sistema</h2>
                    <p className="text-sm text-muted-foreground">Alcance del proyecto · MVP y fases posteriores</p>
                  </div>
                  <Badge variant="outline" className="gap-1 border-cyan-500/20 text-cyan-400">
                    <Layers size={12} /> 6 módulos
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {modules.map((m, i) => (
                    <ModuleRow key={m.name} {...m} delay={0.5 + i * 0.06} />
                  ))}
                </div>
              </div>
            </AuroraCard>
          </motion.div>

          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
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
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
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
                    <Box size={32} className="mb-3 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">Sin productos registrados</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {topStocked.map((p, i) => (
                      <StockBar
                        key={p.id}
                        name={p.nombre}
                        current={p.stock || 0}
                        max={topStocked[0]?.stock || 100}
                        color={AURORA_COLORS[i]}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AuroraCard glow="rose" className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Alertas de Stock</h2>
                    <p className="text-sm text-muted-foreground">Productos que requieren atención inmediata</p>
                  </div>
                  {lowItems.length > 0 && (
                    <Badge variant="outline" className="animate-pulse border-red-500/30 bg-red-500/10 text-red-400">
                      {lowItems.length} alertas
                    </Badge>
                  )}
                </div>
                {lowItems.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                      <CheckCircle2 size={28} className="text-emerald-400" />
                    </div>
                    <p className="font-heading font-bold text-foreground">Inventario Saludable</p>
                    <p className="mt-1 text-sm text-muted-foreground">Todos los productos tienen stock suficiente.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {lowItems.map(p => (
                      <LowStockItem key={p.id} name={p.nombre} stock={p.stock} />
                    ))}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>
        </div>

        {/* ── Stack + Actividad ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <motion.div
            className="xl:col-span-2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
            <AuroraCard glow="cyan" className="h-full">
              <div className="p-6">
                <div className="mb-5">
                  <h2 className="font-heading text-xl font-bold text-foreground">Stack Tecnológico</h2>
                  <p className="text-sm text-muted-foreground">React + Spring Boot · REST/JSON</p>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <TechBadge icon={Server} label="Spring Boot 3" sub="Java 21 · REST API" />
                  <TechBadge icon={Globe} label="React 18+" sub="Vite · Componentes" />
                  <TechBadge icon={Database} label="MySQL 16" sub="Spring Data JPA" />
                  <TechBadge icon={Shield} label="JWT Security" sub="Auth stateless" />
                  <TechBadge icon={FileDown} label="OpenAPI 3" sub="Swagger docs" />
                  <TechBadge icon={GitBranch} label="Git" sub="CI/CD · GitHub" />
                </div>
              </div>
            </AuroraCard>
          </motion.div>

          <motion.div
            className="xl:col-span-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-foreground">Actividad Reciente</h2>
                    <p className="text-sm text-muted-foreground">Últimos productos registrados en el catálogo</p>
                  </div>
                  <Badge variant="outline" className="gap-1.5">
                    <Clock size={12} /> {productos.length} total
                  </Badge>
                </div>
                {recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Package size={32} className="mb-3 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">No hay actividad reciente</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-white/5">
                    {recent.map((p, i) => (
                      <motion.div
                        key={p.id}
                        className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 + i * 0.06 }}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="aurora-icon-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                            <Box size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-foreground">{p.nombre}</p>
                            <p className="text-xs text-muted-foreground">Registrado recientemente</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="font-bold text-emerald-400">${p.precio?.toFixed(2)}</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              p.stock <= 5
                                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
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
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
