import { useEffect } from 'react'
import { motion } from 'motion/react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '#/components/ui/tooltip'
import { PageLayout } from '../components/PageLayout'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Truck, Plus, Search, Package, Clock, ShoppingCart, CheckCircle2, X } from 'lucide-react'

// Hooks & Context
import { useRol } from '../hooks/useRol'
import { useApp } from '../context/AppContext'
import { useProveedoresDashboard } from '../hooks/useProveedoresDashboard'

// Components
import { ProveedorRow } from '../components/proveedores/ProveedorRow'
import { PedidoRow } from '../components/proveedores/PedidoRow'
import { HistorialPedidos } from '../components/proveedores/HistorialPedidos'
import { ProveedorFormSheet } from '../components/proveedores/ProveedorFormSheet'
import { PedidoFormSheet } from '../components/proveedores/PedidoFormSheet'
import { RecepcionPedidoModal } from '../components/proveedores/RecepcionPedidoModal'
import { ConfirmacionEliminarModal } from '../components/proveedores/ConfirmacionEliminarModal'

const ProveedoresDashboard = () => {
  const { isAdmin } = useRol()
  const { productos = [] } = useApp()
  const { state, actions, validations } = useProveedoresDashboard()

  useEffect(() => {
    actions.cargar()
  }, [actions.cargar])

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
                  <Button variant="outline" onClick={() => actions.setShowFormPed(true)} className="gap-2 rounded-xl">
                    <ShoppingCart size={16} /> Nuevo Pedido
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Crear un pedido a un proveedor</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={() => actions.setShowFormProv(true)} className="gap-2 rounded-xl shadow-md">
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
          <AuroraStatCard icon={Truck} label="Proveedores" value={state.proveedores.length} sub="registrados" glow="cyan" delay={80} />
          <AuroraStatCard 
            icon={Clock} 
            label="Pedidos Pendientes" 
            value={state.pedidos.filter(p => p.estado === 'PENDIENTE').length} 
            sub="por recibir" glow="amber" delay={160} 
            trend={state.pedidos.filter(p=>p.estado==='PENDIENTE').length > 0 ? 'Pendiente' : undefined} 
          />
          <AuroraStatCard icon={CheckCircle2} label="Recibidos" value={state.pedidos.filter(p => p.estado === 'RECIBIDO').length} sub="pedidos completados" glow="emerald" delay={240} />
          <AuroraStatCard icon={Package} label="Total Pedidos" value={state.pedidos.length} sub="en el sistema" glow="violet" delay={320} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Lista de proveedores */}
          <motion.div className="xl:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Lista de Proveedores</h2>
                    <p className="text-sm text-muted-foreground">{state.filteredProveedores.length} proveedor{state.filteredProveedores.length !== 1 ? 'es' : ''}</p>
                  </div>
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                    <Input value={state.search} onChange={e => actions.setSearch(e.target.value)} placeholder="Buscar proveedor..." className="h-10 rounded-xl pl-9 pr-9" />
                    {state.search && <button onClick={() => actions.setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
                  </div>
                </div>
                {state.loading ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Cargando...</div>
                ) : state.filteredProveedores.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <Truck size={36} className="mb-3 text-muted-foreground/40" />
                    <p className="font-medium text-muted-foreground">Sin proveedores registrados</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {state.filteredProveedores.map((p, i) => (
                      <ProveedorRow 
                        key={p.id} 
                        proveedor={p} 
                        index={i} 
                        pedidosPorProveedor={state.pedidosPorProveedor} 
                        onEditar={actions.handleEditarProveedor} 
                        onEliminar={(prov) => actions.setConfirmEliminar({ tipo: 'proveedor', item: prov })} 
                        isAdmin={isAdmin} 
                      />
                    ))}
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
                  {state.pedidos.filter(p => p.estado === 'PENDIENTE').length > 0 && (
                    <Badge variant="outline" className="animate-pulse border-amber-500/30 bg-amber-500/10 text-amber-400">
                      {state.pedidos.filter(p => p.estado === 'PENDIENTE').length}
                    </Badge>
                  )}
                </div>
                {state.pedidos.filter(p => ['PENDIENTE','ENVIADO'].includes(p.estado)).length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <CheckCircle2 size={30} className="mb-3 text-emerald-400/60" />
                    <p className="font-medium text-muted-foreground">Sin pedidos activos</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {state.pedidos.filter(p => ['PENDIENTE','ENVIADO'].includes(p.estado)).map((p, i) => (
                      <PedidoRow 
                        key={p.id} 
                        pedido={p} 
                        index={i} 
                        onCambiarEstado={actions.handleCambiarEstado} 
                        onReenviarEmail={actions.handleReenviarEmail} 
                        onEditar={actions.handleEditarPedido} 
                        onEliminar={(ped) => actions.setConfirmEliminar({ tipo: 'pedido', item: ped })} 
                        isAdmin={isAdmin} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>
        </div>

        {/* Historial de pedidos completados/cancelados */}
        {state.pedidos.filter(p => ['RECIBIDO','CANCELADO'].includes(p.estado)).length > 0 && (
          <HistorialPedidos 
            pedidos={state.pedidos.filter(p => ['RECIBIDO','CANCELADO'].includes(p.estado))} 
          />
        )}
      </PageLayout>

      {/* Modals y Forms */}
      <ProveedorFormSheet 
        open={state.showFormProv} 
        onOpenChange={actions.setShowFormProv}
        editandoProveedor={state.editandoProveedor}
        formProv={state.formProv}
        setFormProv={actions.setFormProv}
        saving={state.saving}
        onGuardar={actions.handleGuardarProv}
        onCerrar={actions.handleCerrarFormProveedor}
        valProv={validations.valProv}
      />

      <PedidoFormSheet 
        open={state.showFormPed} 
        onOpenChange={actions.setShowFormPed}
        editandoPedido={state.editandoPedido}
        formPed={state.formPed}
        setFormPed={actions.setFormPed}
        proveedores={state.proveedores}
        productos={productos}
        saving={state.saving}
        onGuardar={actions.handleGuardarPed}
        onCerrar={actions.handleCerrarFormPedido}
        valPed={validations.valPed}
      />

      <RecepcionPedidoModal 
        open={!!state.modalRecibido}
        pedido={state.modalRecibido}
        productos={productos}
        onConfirmar={actions.handleConfirmarRecibido}
        onCancelar={() => actions.setModalRecibido(null)}
        valPRap={validations.valPRap}
      />

      <ConfirmacionEliminarModal 
        open={!!state.confirmEliminar}
        confirmEliminar={state.confirmEliminar}
        pedidosPorProveedor={state.pedidosPorProveedor}
        eliminando={state.eliminando}
        onConfirmar={actions.handleConfirmarEliminar}
        onCancelar={() => actions.setConfirmEliminar(null)}
      />
    </TooltipProvider>
  )
}

export default ProveedoresDashboard
