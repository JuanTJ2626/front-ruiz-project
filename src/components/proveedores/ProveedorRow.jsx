import { motion } from 'motion/react'
import { Truck, Clock, User, Mail, Phone, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'

export const ProveedorRow = ({ proveedor, index, pedidosPorProveedor, onEditar, onEliminar, isAdmin }) => {
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
