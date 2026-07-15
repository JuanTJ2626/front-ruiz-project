import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { getProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } from '../services/proveedorService'
import { getPedidos, crearPedido, cambiarEstadoPedido, actualizarPedido, eliminarPedido, reenviarEmail } from '../services/pedidoService'
import { crearProducto } from '../services/productoService'
import { getUsuarioId, getNegocioId } from '../services/config'
import { useFormValidation, schemas } from './useFormValidation'

export const useProveedoresDashboard = () => {
  const [proveedores, setProveedores] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  // Estados de UI (modales y formularios)
  const [search, setSearch] = useState('')
  const [showFormProv, setShowFormProv] = useState(false)
  const [showFormPed, setShowFormPed] = useState(false)
  const [editandoProveedor, setEditandoProveedor] = useState(null)
  const [editandoPedido, setEditandoPedido] = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(null)
  const [modalRecibido, setModalRecibido] = useState(null)
  
  // Validaciones
  const valProv = useFormValidation(schemas.proveedor)
  const valPed = useFormValidation(schemas.pedido)
  const valPRap = useFormValidation(schemas.productoRapido)

  const [formProv, setFormProv] = useState({ nombre: '', contacto: '', email: '', telefono: '' })
  const [formPed, setFormPed] = useState({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '', enviarEmail: true })

  // Carga inicial
  const cargar = useCallback(async () => {
    try {
      setLoading(true)
      const [provData, pedData] = await Promise.all([
        getProveedores().catch(() => []),
        getPedidos().catch(() => []),
      ])
      setProveedores(Array.isArray(provData) ? provData : [])
      setPedidos(Array.isArray(pedData) ? pedData : [])
    } catch { 
      toast.error('Error al cargar datos') 
    } finally { 
      setLoading(false) 
    }
  }, [])

  // Proveedores filtrados
  const filteredProveedores = useMemo(() => {
    if (!search.trim()) return proveedores
    const q = search.toLowerCase()
    return proveedores.filter(p =>
      p.nombre?.toLowerCase().includes(q) ||
      p.contacto?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    )
  }, [proveedores, search])

  // Pedidos por proveedor
  const pedidosPorProveedor = useMemo(() => {
    return pedidos.reduce((acc, p) => {
      if (p.estado === 'PENDIENTE') acc[p.proveedorId] = (acc[p.proveedorId] || 0) + 1
      return acc
    }, {})
  }, [pedidos])

  /* ─── LÓGICA DE PROVEEDORES ─── */
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
    valProv.clearErrors()
  }

  const handleGuardarProv = async (e) => {
    e?.preventDefault()
    setSaving(true)
    if (!valProv.validate(formProv)) { setSaving(false); return }
    try {
      if (editandoProveedor) {
        await actualizarProveedor(editandoProveedor.id, { 
          ...formProv, 
          nombre: formProv.nombre.trim(),
          negocioId: Number(getNegocioId())
        })
        toast.success(`Proveedor "${formProv.nombre.trim()}" actualizado`)
      } else {
        await crearProveedor({ ...formProv, nombre: formProv.nombre.trim() })
        toast.success(`Proveedor "${formProv.nombre.trim()}" registrado`)
      }
      handleCerrarFormProveedor()
      cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) toast.error('Ya existe un proveedor con ese nombre')
      else if (status === 403) toast.error(`No tienes permiso para ${editandoProveedor ? 'editar' : 'agregar'} proveedores`)
      else toast.error(`No se pudo ${editandoProveedor ? 'actualizar' : 'registrar'} el proveedor. Intenta de nuevo`)
    } finally { 
      setSaving(false) 
    }
  }

  /* ─── LÓGICA DE PEDIDOS ─── */
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

  const handleCerrarFormPedido = () => {
    setShowFormPed(false)
    setEditandoPedido(null)
    setFormPed({ descripcion: '', cantidad: '', precioUnitario: '', fechaEsperada: '', notas: '', proveedorId: '', productoId: '', enviarEmail: true })
    valPed.clearErrors()
  }

  const handleGuardarPed = async (e) => {
    e?.preventDefault()
    setSaving(true)
    if (!valPed.validate(formPed)) { setSaving(false); return }
    try {
      const payload = {
        descripcion:    formPed.descripcion.trim(),
        notas:          formPed.notas || undefined,
        fechaEsperada:  formPed.fechaEsperada || undefined,
        cantidad:       formPed.cantidad,
        precioUnitario: formPed.precioUnitario ? parseFloat(formPed.precioUnitario) : undefined,
        proveedorId:    parseInt(formPed.proveedorId),
        productoId:     formPed.productoId ? parseInt(formPed.productoId) : undefined,
        usuarioId:      parseInt(getUsuarioId()),
        enviarEmail:    formPed.enviarEmail,
      }
      
      if (editandoPedido) {
        await actualizarPedido(editandoPedido.id, payload)
        toast.success('Pedido actualizado correctamente')
      } else {
        await crearPedido(payload)
        toast.success(formPed.enviarEmail ? 'Pedido creado y email enviado al proveedor' : 'Pedido creado correctamente')
      }
      handleCerrarFormPedido()
      cargar()
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para gestionar pedidos')
      else if (status === 404) toast.error('El proveedor o pedido ya no existe')
      else toast.error('No se pudo procesar el pedido. Intenta de nuevo')
    } finally { 
      setSaving(false) 
    }
  }

  const handleCambiarEstado = async (id, estado) => {
    if (estado === 'RECIBIDO') {
      const pedido = pedidos.find(p => p.id === id)
      if (pedido && !pedido.productoId) {
        setModalRecibido(pedido)
        return
      }
    }
    
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

  const handleConfirmarRecibido = async ({ tipo, productoId, nuevoProducto }) => {
    if (!modalRecibido) return
    
    try {
      let finalProductoId = productoId

      if (tipo === 'crear') {
        if (!valPRap.validate(nuevoProducto)) return false
        const creado = await crearProducto({
          nombre:      nuevoProducto.nombre.trim(),
          precio:      parseFloat(nuevoProducto.precio),
          stock:       parseInt(nuevoProducto.stock) || 0,
          stockMinimo: parseInt(nuevoProducto.stockMinimo) || 5,
        })
        finalProductoId = creado.id
        toast.success(`Producto "${nuevoProducto.nombre.trim()}" creado`)
      }

      await actualizarPedido(modalRecibido.id, {
        descripcion:   modalRecibido.descripcion,
        cantidad:      modalRecibido.cantidad,
        proveedorId:   modalRecibido.proveedorId,
        precioUnitario: modalRecibido.precioUnitario,
        productoId:    finalProductoId,
      })

      await cambiarEstadoPedido(modalRecibido.id, 'RECIBIDO')
      toast.success('Pedido recibido y stock actualizado correctamente')
      setModalRecibido(null)
      cargar()
      return true
    } catch (err) {
      const status = err?.response?.status
      if (status === 403) toast.error('No tienes permiso para realizar esta acción')
      else if (status === 409) toast.error('Ya existe un producto con ese nombre')
      else toast.error('No se pudo completar la recepción. Intenta de nuevo')
      return false
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

  /* ─── ELIMINACIONES ─── */
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

  return {
    state: {
      proveedores,
      pedidos,
      loading,
      saving,
      eliminando,
      search,
      showFormProv,
      showFormPed,
      editandoProveedor,
      editandoPedido,
      confirmEliminar,
      modalRecibido,
      formProv,
      formPed,
      filteredProveedores,
      pedidosPorProveedor
    },
    validations: {
      valProv,
      valPed,
      valPRap
    },
    actions: {
      cargar,
      setSearch,
      setShowFormProv,
      setShowFormPed,
      setFormProv,
      setFormPed,
      setConfirmEliminar,
      setModalRecibido,
      handleEditarProveedor,
      handleCerrarFormProveedor,
      handleGuardarProv,
      handleEditarPedido,
      handleCerrarFormPedido,
      handleGuardarPed,
      handleCambiarEstado,
      handleConfirmarRecibido,
      handleReenviarEmail,
      handleConfirmarEliminar
    }
  }
}
