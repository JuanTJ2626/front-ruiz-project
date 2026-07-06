import { useMemo } from 'react'
import { motion } from 'motion/react'
import { Users, Mail, Phone, MapPin, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'
import { PageLayout } from '../components/PageLayout'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Progress } from '../components/ui/progress'

// Datos de demostración
const DEMO_CLIENTES = [
  { id: 1, nombre: 'Carlos Rodríguez', email: 'carlos.r@mail.com', telefono: '+52 55 1234 5678', ciudad: 'Ciudad de México', compras: 12, total: 15680.50, estado: 'Activo' },
  { id: 2, nombre: 'María González', email: 'maria.g@mail.com', telefono: '+52 33 2345 6789', ciudad: 'Guadalajara', compras: 8, total: 9240.00, estado: 'Activo' },
  { id: 3, nombre: 'Juan Martínez', email: 'juan.m@mail.com', telefono: '+52 81 3456 7890', ciudad: 'Monterrey', compras: 15, total: 22340.75, estado: 'Premium' },
  { id: 4, nombre: 'Ana López', email: 'ana.l@mail.com', telefono: '+52 55 4567 8901', ciudad: 'Ciudad de México', compras: 5, total: 6720.00, estado: 'Nuevo' },
  { id: 5, nombre: 'Pedro Sánchez', email: 'pedro.s@mail.com', telefono: '+52 33 5678 9012', ciudad: 'Puebla', compras: 20, total: 31450.25, estado: 'Premium' },
]

const ClientRow = ({ cliente, index }) => {
  const initials = cliente.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const statusConfig = {
    'Premium': 'border-violet-500/30 bg-violet-500/10 text-violet-400',
    'Activo': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    'Nuevo': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <Avatar className="h-12 w-12 shrink-0 border-2 border-cyan-500/20">
        <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-sm font-bold text-cyan-300">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-heading text-sm font-bold text-foreground">{cliente.nombre}</span>
          <Badge variant="outline" className={`shrink-0 text-[10px] font-bold ${statusConfig[cliente.estado]}`}>
            {cliente.estado}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Mail size={10} /> {cliente.email}</span>
          <span className="flex items-center gap-1"><Phone size={10} /> {cliente.telefono}</span>
          <span className="flex items-center gap-1"><MapPin size={10} /> {cliente.ciudad}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground">Total comprado</p>
        <p className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
          ${cliente.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-muted-foreground">{cliente.compras} compra{cliente.compras > 1 ? 's' : ''}</p>
      </div>
    </motion.div>
  )
}

const ClientesDashboard = () => {
  const stats = useMemo(() => ({
    total: DEMO_CLIENTES.length,
    premium: DEMO_CLIENTES.filter(c => c.estado === 'Premium').length,
    comprasTotal: DEMO_CLIENTES.reduce((sum, c) => sum + c.compras, 0),
    ventasTotal: DEMO_CLIENTES.reduce((sum, c) => sum + c.total, 0),
  }), [])

  const top3 = useMemo(() => 
    [...DEMO_CLIENTES].sort((a, b) => b.total - a.total).slice(0, 3),
    []
  )

  return (
    <PageLayout
      title="Directorio de Clientes"
      subtitle="Gestiona clientes, historial de compras y análisis de comportamiento."
      badge="Vista previa · Demo"
    >
      {/* KPIs */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AuroraStatCard icon={Users} label="Clientes Totales" value={stats.total} sub="en el directorio" glow="cyan" delay={80} />
        <AuroraStatCard icon={TrendingUp} label="Clientes Premium" value={stats.premium} sub="alto valor" glow="violet" delay={160} />
        <AuroraStatCard icon={ShoppingBag} label="Compras Totales" value={stats.comprasTotal} sub="transacciones" glow="emerald" delay={240} />
        <AuroraStatCard icon={DollarSign} label="Ventas Totales" value={stats.ventasTotal} prefix="$" decimals={2} sub="ingresos acumulados" glow="amber" delay={320} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Lista de clientes */}
        <motion.div className="xl:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <AuroraCard glow="blue" className="h-full">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Todos los Clientes</h2>
                  <p className="text-sm text-muted-foreground">{DEMO_CLIENTES.length} cliente{DEMO_CLIENTES.length > 1 ? 's' : ''} registrado{DEMO_CLIENTES.length > 1 ? 's' : ''}</p>
                </div>
                <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs">
                  Datos de demostración
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                {DEMO_CLIENTES.map((cliente, i) => (
                  <ClientRow key={cliente.id} cliente={cliente} index={i} />
                ))}
              </div>
            </div>
          </AuroraCard>
        </motion.div>

        {/* Top clientes */}
        <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AuroraCard glow="violet" className="h-full">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Top 3 Clientes</h2>
                  <p className="text-sm text-muted-foreground">Mayor volumen de compras</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {top3.map((cliente, i) => {
                  const maxTotal = top3[0].total
                  const percentage = (cliente.total / maxTotal) * 100
                  const initials = cliente.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

                  return (
                    <div key={cliente.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-violet-300">
                          #{i + 1}
                        </div>
                        <Avatar className="h-10 w-10 border border-violet-500/20">
                          <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-violet-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">{cliente.nombre}</p>
                          <p className="text-xs text-muted-foreground">{cliente.compras} compras</p>
                        </div>
                        <p className="shrink-0 font-heading text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          ${cliente.total.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <Progress value={percentage} className="h-1.5 bg-violet-500/10 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-cyan-500" />
                    </div>
                  )
                })}
              </div>
            </div>
          </AuroraCard>
        </motion.div>
      </div>

      {/* Info de demo */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <AuroraCard glow="cyan">
          <div className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
              <Users size={24} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="font-heading text-sm font-bold text-foreground">Vista previa del módulo de clientes</p>
              <p className="text-sm text-muted-foreground">
                Los datos mostrados son de demostración. Este módulo estará completamente funcional cuando el backend implemente los endpoints de clientes.
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs">
              Próximamente
            </Badge>
          </div>
        </AuroraCard>
      </motion.div>
    </PageLayout>
  )
}

export default ClientesDashboard
