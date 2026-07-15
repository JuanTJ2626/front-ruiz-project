import { useState } from 'react'
import { motion } from 'motion/react'
import { Package, Pencil, Mail, Trash2, Check, Loader2 } from 'lucide-react'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { cn } from '#/lib/utils'

const estadoPedidoStyle = {
  PENDIENTE: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  ENVIADO:   'border-blue-500/30 bg-blue-500/10 text-blue-400',
  RECIBIDO:  'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  CANCELADO: 'border-red-500/30 bg-red-500/10 text-red-400',
}

export const PedidoRow = ({ pedido, index, onCambiarEstado, onReenviarEmail, onEditar, onEliminar, isAdmin }) => {
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
      className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04] sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-bold text-foreground">{pedido.descripcion}</p>
          <Badge variant="outline" className={cn('shrink-0 text-[10px] font-bold', estadoPedidoStyle[pedido.estado] ?? '')}>
            {pedido.estado}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {pedido.proveedorNombre} · {pedido.cantidad} {pedido.cantidad === 1 ? 'unidad' : 'unidades'}
          {pedido.precioUnitario ? ` · $${Number(pedido.precioUnitario).toFixed(2)} c/u` : ''}
        </p>
        {pedido.productoNombre && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
            <Package size={10} /> {pedido.productoNombre}
          </p>
        )}
      </div>

      {(pedido.estado === 'PENDIENTE' || pedido.estado === 'ENVIADO') && isAdmin && (
        <div className="flex flex-wrap items-center gap-2">
          {puedeEditar && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline"
                  className="h-8 rounded-lg border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
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
                className="h-8 rounded-lg border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                onClick={handleReenviar} disabled={enviando}>
                {enviando ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reenviar email al proveedor</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline"
                className="h-8 rounded-lg border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                onClick={() => onEliminar(pedido)}>
                <Trash2 size={12} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancelar y eliminar pedido</TooltipContent>
          </Tooltip>
          <Button size="sm" className="h-8 rounded-lg text-xs gap-1 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onCambiarEstado(pedido.id, 'RECIBIDO')}>
            <Check size={12} /> Recibido
          </Button>
        </div>
      )}
    </motion.div>
  )
}
