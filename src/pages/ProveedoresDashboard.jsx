import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Truck, Plus, Mail, Phone, Search, Package, Clock, ShoppingCart,
  CheckCircle2, X, Check, Loader2, User, Send, Pencil, History, ChevronDown, ChevronUp,
  CalendarDays, XCircle, AlertTriangle, Info, Lock, MailCheck, MailX, Trash2 } from 'lucide-react'
import { PageLayout } from '../components/PageLayout'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Switch } from '../components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedorService'
import { getPedidos, crearPedido, cambiarEstadoPedido, actualizarPedido, eliminarPedido, reenviarEmail } from '../services/pedidoService'
import { getUsuarioId, getNegocioId } from '../services/config'
import { useRol } from '../hooks/useRol'
import { useApp } from '../context/AppContext'

/* ── Fila de proveedor ─────────────────────────────────────── */
const ProveedorRow = ({ proveedor, index, pedidosPorProveedor, onEditar, onEliminar, isAdmin }) => {
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
      {isAdmin && (
        <div className="flex shrink-0 gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline"
                className="h-8 rounded-lg border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                onClick={() => onEditar(proveedor)}>
                <Pencil size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar proveedor</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline"
                className="h-8 rounded-lg border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                onClick={() => onEliminar(proveedor)}>
                <Trash2 size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Eliminar proveedor</TooltipContent>
          </Tooltip>
        </div>
      )}
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

const PedidoRow = ({ pedido, index, onCambiarEstado, onReenviarEmail, onEditar, onEliminar, isAdmin }) => {
  const [enviando, setEnviando] = useState(false)
  
  const handleReenviar = async () => {
    setEnviando(true)
    try {
      await onReenviarEmail(pedido.id)
    } finally {
      setEnviando(false)
    }
  }

  const puedeEditar = pedido.estado === 'PENDIENTE' || pedido.estado === 'ENVIADO'

  return (
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
        </p>
        {pedido.productoNombre && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
            <Package size={10} /> {pedido.productoNombre}
          </p>
        )}
      </div>
      <Badge variant="outline" className={cn('shrink-0 text-[10px] font-bold', estadoPedidoStyle[pedido.estado] ?? '')}>
        {pedido.estado}
      </Badge>
      {(pedido.estado === 'PENDIENTE' || pedido.estado === 'ENVIADO') && isAdmin && (
        <>
          {puedeEditar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline"
                  className="shrink-0 h-8 rounded-lg border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  onClick={() => onEditar(pedido)}>
                  <Pencil size={12} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar pedido</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline"
                className="shrink-0 h-8 rounded-lg border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                onClick={handleReenviar} disabled={enviando}>
                {enviando ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reenviar email al proveedor</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline"
                className="shrink-0 h-8 rounded-lg border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                onClick={() => onEliminar(pedido)}>
                <Trash2 size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancelar y eliminar pedido</TooltipContent>
          </Tooltip>
          <Button size="sm" className="shrink-0 h-8 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onCambiarEstado(pedido.id, 'RECIBIDO')}>
            <Check size={12} /> Recibido
          </Button>
        </>
      )}
    </motion.div>
  )
}

/* ════════════════════════════════════════════════════════════ */
const HistorialPedidos = ({ pedidos }) => {
  const [abierto, setAbierto] = useState(false)
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos
    if (filtroEstado !== 'TODOS') lista = lista.filter(p => p.estado === filtroEstado)
    if (filtroBusqueda.trim()) {
      const q = filtroBusqueda.toLowerCase()
      lista = lista.filter(p =>
        p.descripcion?.toLowerCase().includes(q) ||
        p.proveedorNombre?.toLowerCase().includes(q) ||
        p.productoNombre?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [pedidos, filtroEstado, filtroBusqueda])

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
    >
      <AuroraCard glow="violet">
        <div className="p-6">
          {/* Header colapsable */}
          <button
            onClick={() => setAbierto(v => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <History size={18} className="text-violet-400" />
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Historial de Pedidos</h2>
                <p className="text-sm text-muted-foreground">
                  {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} completados o cancelados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400">
                {pedidos.filter(p => p.estado === 'RECIBIDO').length} recibidos · {pedidos.filter(p => p.estado === 'CANCELADO').length} cancelados
              </Badge>
              {abierto ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
          </button>

          {/* Contenido expandible */}
          {abierto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Filtros */}
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input
                    value={filtroBusqueda}
                    onChange={e => setFiltroBusqueda(e.target.value)}
                    placeholder="Buscar pedido..."
                    className="h-9 rounded-xl pl-9 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {['TODOS', 'RECIBIDO', 'CANCELADO'].map(estado => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        filtroEstado === estado
                          ? estado === 'RECIBIDO'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : estado === 'CANCELADO'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                          : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {estado === 'TODOS' && <Package size={11} />}
                      {estado === 'RECIBIDO' && <CheckCircle2 size={11} />}
                      {estado === 'CANCELADO' && <XCircle size={11} />}
                      {estado === 'TODOS'
                        ? `Todos (${pedidos.length})`
                        : estado === 'RECIBIDO'
                        ? `Recibidos (${pedidos.filter(p => p.estado === 'RECIBIDO').length})`
                        : `Cancelados (${pedidos.filter(p => p.estado === 'CANCELADO').length})`}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-4 opacity-20" />

              {/* Lista */}
              {pedidosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Package size={30} className="mb-3 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground">Sin resultados</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {pedidosFiltrados.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{p.descripcion}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.proveedorNombre} · {p.cantidad} {p.cantidad === 1 ? 'unidad' : 'unidades'}
                          {p.precioUnitario ? ` · $${Number(p.precioUnitario).toFixed(2)} c/u` : ''}
                          {p.precioUnitario && p.cantidad ? ` · Total: $${(Number(p.precioUnitario) * p.cantidad).toFixed(2)}` : ''}
                        </p>
                        {p.productoNombre && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
                            <Package size={10} /> {p.productoNombre}
                          </p>
                        )}
                        {p.fechaEsperada && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground/60 mt-0.5">
                            <CalendarDays size={10} /> Esperado: {new Date(p.fechaEsperada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] font-bold ${
                          p.estado === 'RECIBIDO'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {p.estado === 'RECIBIDO'
                          ? <span className="flex items-center gap-1"><CheckCircle2 size={10} /> RECIBIDO</span>
                          : <span className="flex items-center gap-1"><XCircle size={10} /> CANCELADO</span>}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </AuroraCard>
    </motion.div>
  )
}

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
  const [formPed, setFormPed]             = useState({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '', enviarEmail: true })
  const [editandoPedido, setEditandoPedido] = useState(null)
  const [editandoProveedor, setEditandoProveedor] = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(null) // { tipo: 'proveedor'|'pedido', item }
  const [eliminando, setEliminando] = useState(false)

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
      if (editandoProveedor) {
        // Actualizar proveedor existente
        await actualizarProveedor(editandoProveedor.id, { 
          ...formProv, 
          nombre: formProv.nombre.trim(),
          negocioId: Number(getNegocioId())
        })
        toast.success(`Proveedor "${formProv.nombre.trim()}" actualizado`)
      } else {
        // Crear nuevo proveedor
        await crearProveedor({ ...formProv, nombre: formProv.nombre.trim() })
        toast.success(`Proveedor "${formProv.nombre.trim()}" registrado`)
      }
      setFormProv({ nombre: '', contacto: '', email: '', telefono: '' })
      setEditandoProveedor(null)
      setShowFormProv(false); cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) toast.error('Ya existe un proveedor con ese nombre')
      else if (status === 403) toast.error(`No tienes permiso para ${editandoProveedor ? 'editar' : 'agregar'} proveedores`)
      else toast.error(`No se pudo ${editandoProveedor ? 'actualizar' : 'registrar'} el proveedor. Intenta de nuevo`)
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
      const payload = {
        descripcion:    formPed.descripcion.trim(),
        notas:          formPed.notas || undefined,
        fechaEsperada:  formPed.fechaEsperada || undefined,
        cantidad,
        precioUnitario: formPed.precioUnitario ? parseFloat(formPed.precioUnitario) : undefined,
        proveedorId:    parseInt(formPed.proveedorId),
        productoId:     formPed.productoId ? parseInt(formPed.productoId) : undefined,
        usuarioId:      parseInt(getUsuarioId()),
        enviarEmail:    formPed.enviarEmail,
      }
      await crearPedido(payload)
      toast.success(formPed.enviarEmail ? 'Pedido creado y email enviado al proveedor' : 'Pedido creado correctamente')
      setFormPed({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '', enviarEmail: true })
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

  const handleReenviarEmail = async (pedidoId) => {
    try {
      await reenviarEmail(pedidoId)
      toast.success('Email reenviado al proveedor correctamente')
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para enviar emails')
      else if (status === 404) toast.error('Pedido o proveedor no encontrado')
      else toast.error('No se pudo enviar el email. Intenta de nuevo')
    }
  }

  const handleEditarPedido = (pedido) => {
    setEditandoPedido(pedido)
    setFormPed({
      descripcion: pedido.descripcion || '',
      cantidad: String(pedido.cantidad || ''),
      precioUnitario: pedido.precioUnitario ? String(pedido.precioUnitario) : '',
      fechaEsperada: pedido.fechaEsperada || '',
      notas: pedido.notas || '',
      proveedorId: String(pedido.proveedorId || ''),
      productoId: pedido.productoId ? String(pedido.productoId) : '',
      enviarEmail: true,
    })
    setShowFormPed(true)
  }

  const handleActualizarPedido = async (e) => {
    e.preventDefault(); setSaving(true)
    
    if (!formPed.descripcion?.trim()) { 
      setSaving(false); 
      return toast.error('La descripción del pedido es obligatoria') 
    }
    
    const cantidad = parseInt(formPed.cantidad)
    if (!formPed.cantidad || isNaN(cantidad) || cantidad < 1) { 
      setSaving(false); 
      return toast.error('La cantidad debe ser mayor a cero') 
    }
    
    try {
      const payload = {
        descripcion: formPed.descripcion.trim(),
        notas: formPed.notas || undefined,
        fechaEsperada: formPed.fechaEsperada || undefined,
        cantidad,
        precioUnitario: formPed.precioUnitario ? parseFloat(formPed.precioUnitario) : undefined,
        proveedorId: parseInt(formPed.proveedorId),
        productoId: formPed.productoId ? parseInt(formPed.productoId) : undefined,
      }
      
      await actualizarPedido(editandoPedido.id, payload)
      toast.success('Pedido actualizado correctamente')
      setFormPed({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '', enviarEmail: true })
      setEditandoPedido(null)
      setShowFormPed(false)
      cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para editar pedidos')
      else if (status === 404) toast.error('El pedido ya no existe')
      else toast.error('No se pudo actualizar el pedido. Intenta de nuevo')
    } finally { 
      setSaving(false) 
    }
  }

  const handleCerrarFormPedido = () => {
    setShowFormPed(false)
    setEditandoPedido(null)
    setFormPed({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '', enviarEmail: true })
  }

  const handleEditarProveedor = (proveedor) => {
    setEditandoProveedor(proveedor)
    setFormProv({
      nombre: proveedor.nombre || '',
      contacto: proveedor.contacto || '',
      email: proveedor.email || '',
      telefono: proveedor.telefono || '',
    })
    setShowFormProv(true)
  }

  const handleCerrarFormProveedor = () => {
    setShowFormProv(false)
    setEditandoProveedor(null)
    setFormProv({ nombre: '', contacto: '', email: '', telefono: '' })
  }

  const handleConfirmarEliminar = async () => {
    if (!confirmEliminar) return
    setEliminando(true)
    try {
      if (confirmEliminar.tipo === 'proveedor') {
        await eliminarProveedor(confirmEliminar.item.id)
        toast.success(`Proveedor "${confirmEliminar.item.nombre}" eliminado`)
      } else {
        await eliminarPedido(confirmEliminar.item.id)
        toast.success('Pedido eliminado correctamente')
      }
      setConfirmEliminar(null)
      cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para eliminar')
      else if (status === 409) toast.error('No se puede eliminar: tiene pedidos asociados. Primero elimina los pedidos del proveedor')
      else toast.error('No se pudo eliminar. Intenta de nuevo')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <TooltipProvider>
      <PageLayout
        title="Directorio de Proveedores"
        subtitle="Gestiona contactos, pedidos pendientes y recepción de mercancía."

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
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
                    {filtered.map((p, i) => <ProveedorRow key={p.id} proveedor={p} index={i} pedidosPorProveedor={pedidosPorProveedor} onEditar={handleEditarProveedor} onEliminar={(prov) => setConfirmEliminar({ tipo: 'proveedor', item: prov })} isAdmin={isAdmin} />)}
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
                      <PedidoRow key={p.id} pedido={p} index={i} onCambiarEstado={handleCambiarEstado} onReenviarEmail={handleReenviarEmail} onEditar={handleEditarPedido} onEliminar={(ped) => setConfirmEliminar({ tipo: 'pedido', item: ped })} isAdmin={isAdmin} />
                    ))}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>
        </div>

        {/* Historial de pedidos completados/cancelados */}
        {pedidos.filter(p => ['RECIBIDO','CANCELADO'].includes(p.estado)).length > 0 && (
          <HistorialPedidos 
            pedidos={pedidos.filter(p => ['RECIBIDO','CANCELADO'].includes(p.estado))} 
          />
        )}
      </PageLayout>

      {/* Sheet: nuevo/editar proveedor */}
      <Sheet open={showFormProv} onOpenChange={(open) => !open && handleCerrarFormProveedor()}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">
              {editandoProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
            </SheetTitle>
            <SheetDescription>
              {editandoProveedor ? 'Modifica los datos del proveedor.' : 'Registra un proveedor en el directorio.'}
            </SheetDescription>
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
              <p className="text-xs text-muted-foreground">
                {formProv.email?.trim() 
                  ? <span className="flex items-center gap-1 text-emerald-400"><MailCheck size={11} /> Este proveedor podrá recibir notificaciones por email de sus pedidos</span>
                  : <span className="flex items-center gap-1 text-amber-400"><MailX size={11} /> Sin email configurado, no se podrán enviar notificaciones automáticas</span>}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={formProv.telefono} onChange={e => setFormProv({...formProv,telefono:e.target.value})} className="h-11 rounded-xl" placeholder="+52 55 0000 0000" />
            </div>
          </form>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="outline" onClick={handleCerrarFormProveedor} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleGuardarProv} disabled={saving} className="gap-2 rounded-xl">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Guardando...' : editandoProveedor ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet: nuevo/editar pedido */}
      <Sheet open={showFormPed} onOpenChange={(open) => !open && handleCerrarFormPedido()}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">
              {editandoPedido ? 'Editar Pedido' : 'Nuevo Pedido'}
            </SheetTitle>
            <SheetDescription>
              {editandoPedido ? 'Modifica los datos del pedido.' : 'Crea un pedido a un proveedor.'}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={editandoPedido ? handleActualizarPedido : handleGuardarPed} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            {/* Proveedor */}
            <div className="space-y-2">
              <Label>Proveedor *</Label>
              <Select 
                value={formPed.proveedorId} 
                onValueChange={v => setFormPed({...formPed, proveedorId: v})}
                disabled={!!editandoPedido}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Selecciona un proveedor..." />
                </SelectTrigger>
                <SelectContent>
                  {proveedores.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editandoPedido && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock size={11} /> El proveedor no se puede cambiar una vez creado el pedido
                </p>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Input 
                value={formPed.descripcion} 
                onChange={e => setFormPed({...formPed,descripcion:e.target.value})} 
                required 
                className="h-11 rounded-xl" 
                placeholder="Ej. Martillos de acero 500g" 
                disabled={editandoPedido?.estado === 'ENVIADO'}
              />
            </div>

            {/* Producto del inventario */}
            <div className="space-y-2">
              <Label>Producto del inventario <span className="text-muted-foreground">(opcional)</span></Label>
              <Select 
                value={formPed.productoId} 
                onValueChange={v => setFormPed({...formPed, productoId: v})}
                disabled={editandoPedido?.estado === 'ENVIADO'}
              >
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
                <Input 
                  type="number" 
                  min="1" 
                  value={formPed.cantidad} 
                  onChange={e => setFormPed({...formPed,cantidad:e.target.value})} 
                  required 
                  className="h-11 rounded-xl" 
                  placeholder="0" 
                  disabled={editandoPedido?.estado === 'ENVIADO'}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio unitario</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  value={formPed.precioUnitario} 
                  onChange={e => setFormPed({...formPed,precioUnitario:e.target.value})} 
                  className="h-11 rounded-xl" 
                  placeholder="0.00" 
                  disabled={editandoPedido?.estado === 'ENVIADO'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fecha esperada</Label>
              <Input 
                type="date" 
                value={formPed.fechaEsperada} 
                onChange={e => setFormPed({...formPed,fechaEsperada:e.target.value})} 
                className="h-11 rounded-xl" 
              />
            </div>
            <div className="space-y-2">
              <Label>Notas</Label>
              <Input 
                value={formPed.notas} 
                onChange={e => setFormPed({...formPed,notas:e.target.value})} 
                className="h-11 rounded-xl" 
                placeholder="Instrucciones adicionales..." 
              />
            </div>

            {!editandoPedido && (
              <>
                <Separator className="opacity-30" />

                {/* Notificar al proveedor - solo en crear */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Notificar al proveedor</Label>
                    <Switch
                      checked={formPed.enviarEmail}
                      onCheckedChange={(checked) => setFormPed({...formPed, enviarEmail: checked})}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formPed.enviarEmail ? (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Send size={11} />
                        Se enviará un email automático al proveedor con los detalles del pedido
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle size={11} /> Solo se registrará el pedido sin notificación
                      </span>
                    )}
                  </p>
                </div>
              </>
            )}

            {editandoPedido?.estado === 'ENVIADO' && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="flex items-center gap-1.5 text-xs text-amber-400">
                  <Info size={13} /> Este pedido ya fue enviado. Solo puedes modificar la fecha esperada y las notas.
                </p>
              </div>
            )}
          </form>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="outline" onClick={handleCerrarFormPedido} className="rounded-xl">Cancelar</Button>
            <Button onClick={editandoPedido ? handleActualizarPedido : handleGuardarPed} disabled={saving} className="gap-2 rounded-xl">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Guardando...' : editandoPedido ? 'Actualizar' : 'Crear Pedido'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog: confirmar eliminación */}
      <Dialog open={!!confirmEliminar} onOpenChange={(open) => !open && setConfirmEliminar(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 size={18} />
              {confirmEliminar?.tipo === 'proveedor' ? 'Eliminar Proveedor' : 'Eliminar Pedido'}
            </DialogTitle>
            <DialogDescription className="pt-1">
              {confirmEliminar?.tipo === 'proveedor' ? (
                <>
                  Estás a punto de eliminar al proveedor{' '}
                  <span className="font-semibold text-foreground">"{confirmEliminar?.item?.nombre}"</span>.
                  {(confirmEliminar?.item?.id && pedidosPorProveedor[confirmEliminar.item.id] > 0) && (
                    <span className="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-amber-400">
                      <AlertTriangle size={13} /> Este proveedor tiene pedidos pendientes. Elimínalo solo si estás seguro.
                    </span>
                  )}
                </>
              ) : (
                <>
                  Estás a punto de eliminar el pedido{' '}
                  <span className="font-semibold text-foreground">"{confirmEliminar?.item?.descripcion}"</span>.
                  Esta acción no se puede deshacer.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setConfirmEliminar(null)} className="rounded-xl" disabled={eliminando}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmarEliminar}
              disabled={eliminando}
              className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white"
            >
              {eliminando ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default ProveedoresDashboard
