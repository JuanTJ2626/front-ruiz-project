import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  Users, UserPlus, Mail, Phone, Search, Star, ShoppingBag,
  MapPin, MoreHorizontal, X, Check, Loader2
} from 'lucide-react'
import { PageLayout } from './PageLayout'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { Avatar, AvatarFallback } from './ui/avatar'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'

const INITIAL_CLIENTES = [
  { id: 1, nombre: 'María García López', email: 'maria.garcia@email.com', telefono: '55 1234 5678', ciudad: 'CDMX', tipo: 'Frecuente', compras: 24, total: 4850 },
  { id: 2, nombre: 'Carlos Mendoza', email: 'cmendoza@outlook.com', telefono: '33 9876 5432', ciudad: 'Guadalajara', tipo: 'Nuevo', compras: 3, total: 620 },
  { id: 3, nombre: 'Ana Rodríguez', email: 'ana.r@empresa.mx', telefono: '81 5555 1234', ciudad: 'Monterrey', tipo: 'Corporativo', compras: 45, total: 12800 },
  { id: 4, nombre: 'Luis Hernández', email: 'luis.h@gmail.com', telefono: '55 8765 4321', ciudad: 'CDMX', tipo: 'Frecuente', compras: 18, total: 3200 },
  { id: 5, nombre: 'Patricia Vega', email: 'pvega@hotmail.com', telefono: '442 123 4567', ciudad: 'Querétaro', tipo: 'Ocasional', compras: 7, total: 980 },
]

const tipoStyles = {
  Frecuente: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  Nuevo: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Corporativo: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  Ocasional: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
}

const ClienteRow = ({ cliente, index }) => {
  const initials = cliente.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <Avatar className="h-11 w-11 border border-cyan-500/20">
        <AvatarFallback className="bg-cyan-500/10 text-sm font-bold text-cyan-400">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-bold text-foreground">{cliente.nombre}</span>
          <Badge variant="outline" className={cn('text-[10px] font-bold', tipoStyles[cliente.tipo])}>
            {cliente.tipo}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Mail size={11} /> {cliente.email}</span>
          <span className="flex items-center gap-1"><Phone size={11} /> {cliente.telefono}</span>
          <span className="flex items-center gap-1"><MapPin size={11} /> {cliente.ciudad}</span>
        </div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-sm font-bold text-emerald-400">${cliente.total.toLocaleString('es-MX')}</p>
        <p className="text-xs text-muted-foreground">{cliente.compras} compras</p>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
        <MoreHorizontal size={16} />
      </Button>
    </motion.div>
  )
}

const ClientesDashboard = () => {
  const [clientes, setClientes] = useState(INITIAL_CLIENTES)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', ciudad: '', tipo: 'Nuevo' })

  const filtered = useMemo(() => {
    if (!search.trim()) return clientes
    const q = search.toLowerCase()
    return clientes.filter(c =>
      c.nombre.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.ciudad.toLowerCase().includes(q)
    )
  }, [clientes, search])

  const stats = useMemo(() => ({
    total: clientes.length,
    frecuentes: clientes.filter(c => c.tipo === 'Frecuente').length,
    corporativos: clientes.filter(c => c.tipo === 'Corporativo').length,
    ingresos: clientes.reduce((s, c) => s + c.total, 0),
  }), [clientes])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    setClientes(prev => [...prev, {
      id: Date.now(),
      ...form,
      compras: 0,
      total: 0,
    }])
    setForm({ nombre: '', email: '', telefono: '', ciudad: '', tipo: 'Nuevo' })
    setShowForm(false)
    setSaving(false)
    toast.success('Cliente registrado correctamente')
  }

  return (
    <>
      <PageLayout
        title="Directorio de Clientes"
        subtitle="Gestiona contactos, historial de compras y segmentación de clientes de tu negocio."
        badge="Módulo Clientes"
        actions={
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl shadow-md">
            <UserPlus size={16} /> Nuevo Cliente
          </Button>
        }
      >
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuroraStatCard icon={Users} label="Total Clientes" value={stats.total} sub="registrados" glow="cyan" delay={80} />
          <AuroraStatCard icon={Star} label="Frecuentes" value={stats.frecuentes} sub="clientes activos" glow="emerald" delay={160} />
          <AuroraStatCard icon={ShoppingBag} label="Corporativos" value={stats.corporativos} sub="cuentas empresariales" glow="violet" delay={240} />
          <AuroraStatCard icon={ShoppingBag} label="Ingresos Clientes" value={`$${stats.ingresos.toLocaleString('es-MX')}`} sub="historial acumulado" glow="amber" delay={320} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <AuroraCard glow="blue">
            <div className="p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Lista de Clientes</h2>
                  <p className="text-sm text-muted-foreground">{filtered.length} contacto{filtered.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, email o ciudad..."
                    className="h-10 rounded-xl pl-9 pr-9"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <Users size={36} className="mb-3 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">No se encontraron clientes</p>
                  </div>
                ) : (
                  filtered.map((c, i) => <ClienteRow key={c.id} cliente={c} index={i} />)
                )}
              </div>
            </div>
          </AuroraCard>
        </motion.div>
      </PageLayout>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">Nuevo Cliente</SheetTitle>
            <SheetDescription>Registra un nuevo contacto en el directorio.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            <div className="space-y-2">
              <Label htmlFor="c-nombre">Nombre completo</Label>
              <Input id="c-nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required className="h-11 rounded-xl" placeholder="Ej. Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Correo electrónico</Label>
              <Input id="c-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-11 rounded-xl" placeholder="cliente@email.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-tel">Teléfono</Label>
              <Input id="c-tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="h-11 rounded-xl" placeholder="55 1234 5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-ciudad">Ciudad</Label>
              <Input id="c-ciudad" value={form.ciudad} onChange={e => setForm({ ...form, ciudad: e.target.value })} className="h-11 rounded-xl" placeholder="Ciudad de México" />
            </div>
          </form>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="gap-2 rounded-xl">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ClientesDashboard
