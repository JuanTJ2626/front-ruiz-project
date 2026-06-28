import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Truck, Plus, Mail, Phone, Search, Package, Clock, ShoppingCart,
  CheckCircle2, AlertCircle, X, Check, Loader2, User, ChevronRight } from 'lucide-react'
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
import { getPedidosPendientes, crearPedido, cambiarEstadoPedido } from '../services/pedidoService'
import { getUsuarioId } from '../services/config'
import { useRol } from '../hooks/useRol'

/* ── Fila de proveedor ─────────────────────────────────────── */
const ProveedorRow = ({ proveedor, index, pedidosPorProveedor }) => {
  const pendientes = pedidosPorProveedor[proveedor.id] ?? 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.06 }}
      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div className="aurora-icon-ring flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
        <Truck size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-bold text-foreground">{proveedor.nombre}</span>
          {pendientes > 0 && (
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Clock size={10} className="mr-1" /> {pendientes} pedido{pendientes > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {proveedor.contacto  && <span className="flex items-center gap-1"><User  size={11} /> {proveedor.contacto}</span>}
          {proveedor.email     && <span className="flex items-center gap-1"><Mail  size={11} /> {proveedor.email}</span>}
          {proveedor.telefono  && <span className="flex items-center gap-1"><Phone size={11} /> {proveedor.telefono}</span>}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Fila de pedido ────────────────────────────────────────── */
const estadoPedidoStyle = {
  PENDIENTE: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  ENVIADO:   'border-blue-500/30 bg-blue-500/10 text-blue-400',
  RECIBIDO:  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  CANCELADO: 'border-red-500/30 bg-red-500/10 text-red-400',
}

const PedidoRow = ({ pedido, index, onCambiarEstado }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 + index * 0.05 }}
    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
  >
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-foreground">{pedido.descripcion}</p>
      <p className="text-xs text-muted-foreground">
        {pedido.proveedorNombre} · {pedido.cantidad} uds
        {pedido.precioUnitario ? ` · $${Number(pedido.precioUnitario).toFixed(2)} c/u` : ''}
      </p>
    </div>
    <Badge variant="outline" className={cn('shrink-0 text-[10px] font-bold', estadoPedidoStyle[pedido.estado] ?? '')}>
      {pedido.estado}
    </Badge>
    {pedido.estado === 'PENDIENTE' && isAdmin && (
      <Button size="sm" variant="outline" className="shrink-0 h-8 rounded-lg text-xs gap-1"
        onClick={() => onCambiarEstado(pedido.id, 'ENVIADO')}>
        <ChevronRight size={12} /> Enviado
      </Button>
    )}
    {pedido.estado === 'ENVIADO' && isAdmin && (
      <Button size="sm" className="shrink-0 h-8 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
        onClick={() => onCambiarEstado(pedido.id, 'RECIBIDO')}>
        <Check size={12} /> Recibido
      </Button>
    )}
  </motion.div>
)

/* ════════════════════════════════════════════════════════════ */
const ProveedoresDashboard = () => {
  const [proveedores, setProveedores]     = useState([])
  const [pedidos, setPedidos]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [showFormProv, setShowFormProv]   = useState(false)
  const [showFormPed, setShowFormPed]     = useState(false)
  const [saving, setSaving]               = useState(false)
  const [formProv, setFormProv]           = useState({ nombre: '', contacto: '', email: '', telefono: '' })
  const [formPed, setFormPed]             = useState({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '' })

  const { isAdmin } = useRol()

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const [provData, pedData] = await Promise.all([
        getProveedores().catch(() => []),
        getPedidosPendientes().catch(() => []),
      ])
      setProveedores(Array.isArray(provData) ? provData : [])
      setPedidos(Array.isArray(pedData) ? pedData : [])
    } catch { toast.error('Error al cargar datos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  /* pedidos pendientes agrupados por proveedor */
  const pedidosPorProveedor = useMemo(() => {
    return pedidos.reduce((acc, p) => {
      if (p.estado === 'PENDIENTE') acc[p.proveedorId] = (acc[p.proveedorId] || 0) + 1
      return acc
    }, {})
  }, [pedidos])

  const filtered = useMemo(() => {
    if (!search.trim()) return proveedores
    const q = search.toLowerCase()
    return proveedores.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.contacto?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  }, [proveedores, search])

  const handleGuardarProv = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await crearProveedor(formProv)
      toast.success('Proveedor registrado')
      setFormProv({ nombre: '', contacto: '', email: '', telefono: '' })
      setShowFormProv(false); cargar()
    } catch (err) { toast.error(err.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleGuardarPed = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await crearPedido({
        ...formPed,
        cantidad: parseInt(formPed.cantidad),
        precioUnitario: formPed.precioUnitario ? parseFloat(formPed.precioUnitario) : undefined,
        proveedorId: parseInt(formPed.proveedorId),
        usuarioId: parseInt(getUsuarioId()),
      })
      toast.success('Pedido creado correctamente')
      setFormPed({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '' })
      setShowFormPed(false); cargar()
    } catch (err) { toast.error(err.message || 'Error al crear pedido') }
    finally { setSaving(false) }
  }

  const handleCambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoPedido(id, estado)
      toast.success(`Pedido marcado como ${estado.toLowerCase()}`)
      cargar()
    } catch (err) { toast.error(err.message || 'Error al cambiar estado') }
  }

  return (
    <>
      <PageLayout
        title="Directorio de Proveedores"
        subtitle="Gestiona contactos, pedidos pendientes y recepción de mercancía."
        badge="Módulo Proveedores"
        actions={
          isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFormPed(true)} className="gap-2 rounded-xl">
                <ShoppingCart size={16} /> Nuevo Pedido
              </Button>
              <Button onClick={() => setShowFormProv(true)} className="gap-2 rounded-xl shadow-md">
                <Plus size={16} /> Nuevo Proveedor
              </Button>
            </div>
          )
        }
      >
        {/* KPIs */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuroraStatCard icon={Truck}        label="Proveedores"       value={proveedores.length} sub="registrados"      glow="cyan"   delay={80} />
          <AuroraStatCard icon={Clock}        label="Pedidos Pendientes" value={pedidos.filter(p => p.estado === 'PENDIENTE').length} sub="por recibir" glow="amber" delay={160} trend={pedidos.filter(p=>p.estado==='PENDIENTE').length > 0 ? 'Pendiente' : undefined} />
          <AuroraStatCard icon={CheckCircle2} label="Recibidos"         value={pedidos.filter(p => p.estado === 'RECIBIDO').length}  sub="pedidos completados" glow="emerald" delay={240} />
          <AuroraStatCard icon={Package}      label="Total Pedidos"     value={pedidos.length}     sub="en el sistema"   glow="violet" delay={320} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Proveedores */}
          <motion.div className="xl:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Lista de Proveedores</h2>
                    <p className="text-sm text-muted-foreground">{filtered.length} proveedor{filtered.length !== 1 ? 'es' : ''}</p>
                  </div>
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar proveedor..." className="h-10 rounded-xl pl-9 pr-9" />
                    {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
                  </div>
                </div>
                {loading ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <Truck size={36} className="mb-3 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">Sin proveedores registrados</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {filtered.map((p, i) => <ProveedorRow key={p.id} proveedor={p} index={i} pedidosPorProveedor={pedidosPorProveedor} />)}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>

          {/* Pedidos pendientes */}
          <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <AuroraCard glow="amber" className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Pedidos Activos</h2>
                    <p className="text-sm text-muted-foreground">Pendientes y en camino</p>
                  </div>
                  {pedidos.filter(p => p.estado === 'PENDIENTE').length > 0 && (
                    <Badge variant="outline" className="animate-pulse border-amber-500/30 bg-amber-500/10 text-amber-400">
                      {pedidos.filter(p => p.estado === 'PENDIENTE').length}
                    </Badge>
                  )}
                </div>
                {pedidos.filter(p => ['PENDIENTE','ENVIADO'].includes(p.estado)).length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <CheckCircle2 size={30} className="mb-3 text-emerald-400/60" />
                    <p className="font-medium text-muted-foreground">Sin pedidos activos</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {pedidos.filter(p => ['PENDIENTE','ENVIADO'].includes(p.estado)).map((p, i) => (
                      <PedidoRow key={p.id} pedido={p} index={i} onCambiarEstado={handleCambiarEstado} />
                    ))}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>
        </div>
      </PageLayout>

      {/* Sheet: nuevo proveedor */}
      <Sheet open={showFormProv} onOpenChange={setShowFormProv}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">Nuevo Proveedor</SheetTitle>
            <SheetDescription>Registra un proveedor en el directorio.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleGuardarProv} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            <div className="space-y-2"><Label>Nombre / Empresa *</Label><Input value={formProv.nombre} onChange={e => setFormProv({...formProv,nombre:e.target.value})} required className="h-11 rounded-xl" /></div>
            <div className="space-y-2"><Label>Persona de contacto</Label><Input value={formProv.contacto} onChange={e => setFormProv({...formProv,contacto:e.target.value})} className="h-11 rounded-xl" /></div>
            <div className="space-y-2"><Label>Correo</Label><Input type="email" value={formProv.email} onChange={e => setFormProv({...formProv,email:e.target.value})} className="h-11 rounded-xl" /></div>
            <div className="space-y-2"><Label>Teléfono</Label><Input value={formProv.telefono} onChange={e => setFormProv({...formProv,telefono:e.target.value})} className="h-11 rounded-xl" /></div>
          </form>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="outline" onClick={() => setShowFormProv(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleGuardarProv} disabled={saving} className="gap-2 rounded-xl">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet: nuevo pedido */}
      <Sheet open={showFormPed} onOpenChange={setShowFormPed}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">Nuevo Pedido</SheetTitle>
            <SheetDescription>Crea un pedido a un proveedor.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleGuardarPed} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <select value={formPed.proveedorId} onChange={e => setFormPed({...formPed,proveedorId:e.target.value})} required className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                <option value="">Selecciona un proveedor...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="space-y-2"><Label>Descripción *</Label><Input value={formPed.descripcion} onChange={e => setFormPed({...formPed,descripcion:e.target.value})} required className="h-11 rounded-xl" placeholder="Ej. Martillos de acero 500g" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cantidad *</Label><Input type="number" min="1" value={formPed.cantidad} onChange={e => setFormPed({...formPed,cantidad:e.target.value})} required className="h-11 rounded-xl" /></div>
              <div className="space-y-2"><Label>Precio unitario</Label><Input type="number" step="0.01" min="0" value={formPed.precioUnitario} onChange={e => setFormPed({...formPed,precioUnitario:e.target.value})} className="h-11 rounded-xl" placeholder="0.00" /></div>
            </div>
            <div className="space-y-2"><Label>Fecha esperada</Label><Input type="date" value={formPed.fechaEsperada} onChange={e => setFormPed({...formPed,fechaEsperada:e.target.value})} className="h-11 rounded-xl" /></div>
            <div className="space-y-2"><Label>Notas</Label><Input value={formPed.notas} onChange={e => setFormPed({...formPed,notas:e.target.value})} className="h-11 rounded-xl" placeholder="Instrucciones adicionales..." /></div>
          </form>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="outline" onClick={() => setShowFormPed(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleGuardarPed} disabled={saving} className="gap-2 rounded-xl">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Guardando...' : 'Crear Pedido'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ProveedoresDashboard
