import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Truck, Plus, Mail, Phone, Search, Package, Clock, ShoppingCart,
  CheckCircle2, X, Check, Loader2, User } from 'lucide-react'
import { PageLayout } from '../components/PageLayout'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { getProveedores, crearProveedor } from '../services/proveedorService'
import { getPedidos, crearPedido, cambiarEstadoPedido } from '../services/pedidoService'
import { getUsuarioId } from '../services/config'
import { useRol } from '../hooks/useRol'
import { useApp } from '../context/AppContext'

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

/* ── Estilos de estado de pedido ───────────────────────────── */
const estadoPedidoStyle = {
  PENDIENTE: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  ENVIADO:   'border-blue-500/30 bg-blue-500/10 text-blue-400',
  RECIBIDO:  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  CANCELADO: 'border-red-500/30 bg-red-500/10 text-red-400',
}

const PedidoRow = ({ pedido, index, onCambiarEstado, isAdmin }) => (
  <motion.div
    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2 + index * 0.05 }}
    className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
  >
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-foreground">{pedido.descripcion}</p>
      <p className="text-xs text-muted-foreground">
        {pedido.proveedorNombre} · {pedido.cantidad} {pedido.cantidad === 1 ? 'unidad' : 'unidades'}
        {pedido.precioUnitario ? ` · $${Number(pedido.precioUnitario).toFixed(2)} c/u` : ''}
        {pedido.productoNombre ? ` · 📦 ${pedido.productoNombre}` : ''}
      </p>
    </div>
    <Badge variant="outline" className={cn('shrink-0 text-[10px] font-bold', estadoPedidoStyle[pedido.estado] ?? '')}>
      {pedido.estado}
    </Badge>
    {(pedido.estado === 'PENDIENTE' || pedido.estado === 'ENVIADO') && isAdmin && (
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
  const [formPed, setFormPed]             = useState({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '' })

  const { isAdmin } = useRol()
  const { productos = [] } = useApp()

  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const [provData, pedData] = await Promise.all([
        getProveedores().catch(() => []),
        getPedidos().catch(() => []),
      ])
      setProveedores(Array.isArray(provData) ? provData : [])
      setPedidos(Array.isArray(pedData) ? pedData : [])
    } catch { toast.error('Error al cargar datos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { cargar() }, [cargar])

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
    if (!formProv.nombre?.trim()) {
      setSaving(false)
      return toast.error('El nombre o empresa del proveedor es obligatorio')
    }
    try {
      await crearProveedor({ ...formProv, nombre: formProv.nombre.trim() })
      toast.success(`Proveedor "${formProv.nombre.trim()}" registrado`)
      setFormProv({ nombre: '', contacto: '', email: '', telefono: '' })
      setShowFormProv(false); cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) toast.error('Ya existe un proveedor con ese nombre')
      else if (status === 403) toast.error('No tienes permiso para agregar proveedores')
      else toast.error('No se pudo registrar el proveedor. Intenta de nuevo')
    }
    finally { setSaving(false) }
  }

  const handleGuardarPed = async (e) => {
    e.preventDefault(); setSaving(true)
    if (!formPed.proveedorId) { setSaving(false); return toast.error('Selecciona un proveedor para el pedido') }
    if (!formPed.descripcion?.trim()) { setSaving(false); return toast.error('La descripción del pedido es obligatoria') }
    const cantidad = parseInt(formPed.cantidad)
    if (!formPed.cantidad || isNaN(cantidad) || cantidad < 1) { setSaving(false); return toast.error('La cantidad debe ser mayor a cero') }
    try {
      await crearPedido({
        descripcion:    formPed.descripcion.trim(),
        notas:          formPed.notas || undefined,
        fechaEsperada:  formPed.fechaEsperada || undefined,
        cantidad,
        precioUnitario: formPed.precioUnitario ? parseFloat(formPed.precioUnitario) : undefined,
        proveedorId:    parseInt(formPed.proveedorId),
        productoId:     formPed.productoId ? parseInt(formPed.productoId) : undefined,
        usuarioId:      parseInt(getUsuarioId()),
      })
      toast.success('Pedido creado correctamente')
      setFormPed({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '' })
      setShowFormPed(false); cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para crear pedidos')
      else if (status === 404) toast.error('El proveedor seleccionado ya no existe')
      else toast.error('No se pudo crear el pedido. Intenta de nuevo')
    }
    finally { setSaving(false) }
  }

  const handleCambiarEstado = async (id, estado) => {
    try {
      await cambiarEstadoPedido(id, estado)
      toast.success(`Pedido marcado como ${estado.toLowerCase()}`)
      cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para cambiar el estado del pedido')
      else if (status === 404) toast.error('El pedido ya no existe')
      else toast.error('No se pudo actualizar el estado del pedido')
    }
  }

  return (
    <TooltipProvider>
      <PageLayout
        title="Directorio de Proveedores"
        subtitle="Gestiona contactos, pedidos pendientes y recepción de mercancía."
        badge="Módulo Proveedores"
        actions={
          isAdmin && (
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowFormPed(true)} className="gap-2 rounded-xl">
                    <ShoppingCart size={16} /> Nuevo Pedido
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Crear un pedido a un proveedor</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => setShowFormProv(true)} className="gap-2 rounded-xl shadow-md">
                    <Plus size={16} /> Nuevo Proveedor
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Registrar un nuevo proveedor</TooltipContent>
              </Tooltip>
            </div>
          )
        }
      >
        {/* KPIs */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuroraStatCard icon={Truck}        label="Proveedores"        value={proveedores.length} sub="registrados"          glow="cyan"   delay={80} />
          <AuroraStatCard icon={Clock}        label="Pedidos Pendientes" value={pedidos.filter(p => p.estado === 'PENDIENTE').length} sub="por recibir" glow="amber" delay={160} trend={pedidos.filter(p=>p.estado==='PENDIENTE').length > 0 ? 'Pendiente' : undefined} />
          <AuroraStatCard icon={CheckCircle2} label="Recibidos"          value={pedidos.filter(p => p.estado === 'RECIBIDO').length}  sub="pedidos completados" glow="emerald" delay={240} />
          <AuroraStatCard icon={Package}      label="Total Pedidos"      value={pedidos.length}     sub="en el sistema"        glow="violet" delay={320} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Lista de proveedores */}
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

          {/* Pedidos activos */}
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
                      <PedidoRow key={p.id} pedido={p} index={i} onCambiarEstado={handleCambiarEstado} isAdmin={isAdmin} />
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
            <div className="space-y-2">
              <Label>Nombre / Empresa *</Label>
              <Input value={formProv.nombre} onChange={e => setFormProv({...formProv,nombre:e.target.value})} required className="h-11 rounded-xl" placeholder="Distribuidora López" />
            </div>
            <div className="space-y-2">
              <Label>Persona de contacto</Label>
              <Input value={formProv.contacto} onChange={e => setFormProv({...formProv,contacto:e.target.value})} className="h-11 rounded-xl" placeholder="Juan López" />
            </div>
            <Separator className="opacity-30" />
            <div className="space-y-2">
              <Label>Correo electrónico</Label>
              <Input type="email" value={formProv.email} onChange={e => setFormProv({...formProv,email:e.target.value})} className="h-11 rounded-xl" placeholder="contacto@proveedor.com" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={formProv.telefono} onChange={e => setFormProv({...formProv,telefono:e.target.value})} className="h-11 rounded-xl" placeholder="+52 55 0000 0000" />
            </div>
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
            {/* Proveedor */}
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <Select value={formPed.proveedorId} onValueChange={v => setFormPed({...formPed, proveedorId: v})}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona un proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Input value={formPed.descripcion} onChange={e => setFormPed({...formPed,descripcion:e.target.value})} required className="h-11 rounded-xl" placeholder="Ej. Martillos de acero 500g" />
            </div>

            {/* Producto del inventario */}
            <div className="space-y-2">
              <Label>Producto del inventario <span className="text-muted-foreground">(opcional)</span></Label>
              <Select value={formPed.productoId} onValueChange={v => setFormPed({...formPed, productoId: v})}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Sin vincular a producto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin vincular a producto</SelectItem>
                  {productos.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre} — Stock: {p.stock}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Si lo vinculas, al marcar el pedido como <strong>Recibido</strong> el stock sube automáticamente.</p>
            </div>

            <Separator className="opacity-30" />

            {/* Cantidad y precio */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cantidad *</Label>
                <Input type="number" min="1" value={formPed.cantidad} onChange={e => setFormPed({...formPed,cantidad:e.target.value})} required className="h-11 rounded-xl" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label>Precio unitario</Label>
                <Input type="number" step="0.01" min="0" value={formPed.precioUnitario} onChange={e => setFormPed({...formPed,precioUnitario:e.target.value})} className="h-11 rounded-xl" placeholder="0.00" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fecha esperada</Label>
              <Input type="date" value={formPed.fechaEsperada} onChange={e => setFormPed({...formPed,fechaEsperada:e.target.value})} className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input value={formPed.notas} onChange={e => setFormPed({...formPed,notas:e.target.value})} className="h-11 rounded-xl" placeholder="Instrucciones adicionales..." />
            </div>
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
    </TooltipProvider>
  )
}

export default ProveedoresDashboard
