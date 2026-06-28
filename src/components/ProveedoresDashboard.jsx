import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  Truck, Plus, Mail, Phone, Search, Package, Clock,
  CheckCircle2, AlertCircle, X, Check, Loader2, User
} from 'lucide-react'
import { PageLayout } from './PageLayout'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { getProveedores, crearProveedor } from '../services/proveedorService'

const INITIAL_PROVEEDORES = [
  { id: 1, nombre: 'Distribuidora del Norte SA', contacto: 'Roberto Sánchez', email: 'ventas@distnorte.mx', telefono: '81 4000 1234', pedidosPendientes: 2, productos: 45, estado: 'Activo' },
  { id: 2, nombre: 'Abarrotes Mayoreo CDMX', contacto: 'Lucía Morales', email: 'pedidos@mayoreo.mx', telefono: '55 5555 9876', pedidosPendientes: 0, productos: 120, estado: 'Activo' },
  { id: 3, nombre: 'Ferretería Industrial GDL', contacto: 'Miguel Torres', email: 'm.torres@ferind.mx', telefono: '33 3610 4567', pedidosPendientes: 1, productos: 78, estado: 'Activo' },
  { id: 4, nombre: 'Papelería Central', contacto: 'Sofía Ruiz', email: 'central@papeleria.com', telefono: '442 210 8899', pedidosPendientes: 3, productos: 32, estado: 'Pendiente' },
  { id: 5, nombre: 'Importadora Pacífico', contacto: 'Diego Campos', email: 'dcampos@importpac.com', telefono: '664 123 4567', pedidosPendientes: 0, productos: 15, estado: 'Inactivo' },
]

const estadoStyles = {
  Activo: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Pendiente: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Inactivo: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
}

const ProveedorRow = ({ proveedor, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + index * 0.06 }}
    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
  >
    <div className="aurora-icon-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
      <Truck size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-heading text-sm font-bold text-foreground">{proveedor.nombre}</span>
        <Badge variant="outline" className={cn('text-[10px] font-bold', estadoStyles[proveedor.estado])}>
          {proveedor.estado}
        </Badge>
        {proveedor.pedidosPendientes > 0 && (
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock size={10} className="mr-1" /> {proveedor.pedidosPendientes} pedido{proveedor.pedidosPendientes > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><User size={11} /> {proveedor.contacto}</span>
        <span className="flex items-center gap-1"><Mail size={11} /> {proveedor.email}</span>
        <span className="flex items-center gap-1"><Phone size={11} /> {proveedor.telefono}</span>
      </div>
    </div>
    <div className="hidden shrink-0 text-right sm:block">
      <p className="text-sm font-bold text-cyan-400">{proveedor.productos}</p>
      <p className="text-xs text-muted-foreground">productos</p>
    </div>
  </motion.div>
)

const ProveedoresDashboard = () => {
  const [proveedores, setProveedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nombre: '', contacto: '', email: '', telefono: '' })

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getProveedores()
      setProveedores(Array.isArray(data) ? data : [])
    } catch { toast.error('No se pudieron cargar los proveedores') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtered = useMemo(() => {
    if (!search.trim()) return proveedores
    const q = search.toLowerCase()
    return proveedores.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.contacto.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    )
  }, [proveedores, search])

  const stats = useMemo(() => ({
    total: proveedores.length,
    activos: proveedores.length,
    pedidos: 0,
    productos: 0,
  }), [proveedores])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await crearProveedor(form)
      toast.success('Proveedor registrado correctamente')
      setForm({ nombre: '', contacto: '', email: '', telefono: '' })
      setShowForm(false)
      cargar()
    } catch (err) {
      toast.error(err.message || 'Error al guardar proveedor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageLayout
        title="Directorio de Proveedores"
        subtitle="Gestiona contactos de proveedores, pedidos pendientes y relación con productos del inventario."
        badge="Módulo Proveedores"
        actions={
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl shadow-md">
            <Plus size={16} /> Nuevo Proveedor
          </Button>
        }
      >
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuroraStatCard icon={Truck} label="Proveedores" value={stats.total} sub="registrados" glow="cyan" delay={80} />
          <AuroraStatCard icon={CheckCircle2} label="Activos" value={stats.activos} sub="con contrato vigente" glow="emerald" delay={160} />
          <AuroraStatCard icon={Clock} label="Pedidos Pendientes" value={stats.pedidos} sub="por recibir" glow="amber" delay={240} trend={stats.pedidos > 0 ? 'Pendiente' : undefined} />
          <AuroraStatCard icon={Package} label="Productos Vinculados" value={stats.productos} sub="en catálogo" glow="violet" delay={320} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <AuroraCard glow="blue">
            <div className="p-6">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Lista de Proveedores</h2>
                  <p className="text-sm text-muted-foreground">{filtered.length} proveedor{filtered.length !== 1 ? 'es' : ''}</p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar proveedor..."
                    className="h-10 rounded-xl pl-9 pr-9"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {stats.pedidos > 0 && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <AlertCircle size={18} className="shrink-0 text-amber-400" />
                  <p className="text-sm text-amber-200/80">
                    Tienes <strong className="text-amber-300">{stats.pedidos} pedido{stats.pedidos > 1 ? 's' : ''} pendiente{stats.pedidos > 1 ? 's' : ''}</strong> por recibir de proveedores.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <Truck size={36} className="mb-3 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">No se encontraron proveedores</p>
                  </div>
                ) : (
                  filtered.map((p, i) => <ProveedorRow key={p.id} proveedor={p} index={i} />)
                )}
              </div>
            </div>
          </AuroraCard>
        </motion.div>
      </PageLayout>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">Nuevo Proveedor</SheetTitle>
            <SheetDescription>Registra un proveedor en el directorio.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            <div className="space-y-2">
              <Label htmlFor="pr-nombre">Nombre / Empresa</Label>
              <Input id="pr-nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-contacto">Persona de contacto</Label>
              <Input id="pr-contacto" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-email">Correo</Label>
              <Input id="pr-email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pr-tel">Teléfono</Label>
              <Input id="pr-tel" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="h-11 rounded-xl" />
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

export default ProveedoresDashboard
