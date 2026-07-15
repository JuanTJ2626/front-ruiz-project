import { motion } from 'motion/react'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '../ui/badge'

/**
 * Fila de alerta para un producto con stock crítico.
 * Muestra un indicador pulsante y el stock actual.
 */
export const LowStockItem = ({ name, stock, index }) => (
  <motion.div
    className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3 transition-all hover:border-red-500/40 hover:bg-red-500/10"
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4, delay: index * 0.07 }}
  >
    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
      <AlertTriangle size={17} className="text-red-500" />
      {/* Ping animado */}
      <span className="absolute -right-1 -top-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
      </span>
    </div>

    <div className="min-w-0 flex-1">
      <span className="block truncate text-sm font-bold text-foreground">{name}</span>
      <span className="text-xs font-medium text-red-400/80">Stock mínimo alcanzado</span>
    </div>

    <Badge className="shrink-0 border-0 bg-red-500/15 font-bold text-red-500">
      {stock} uds
    </Badge>
  </motion.div>
)
