import { motion } from 'motion/react'
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react'
import { cn } from '#/lib/utils'

const TIPO_CONFIG = {
  ENTRADA: { Icon: ArrowDownCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', symbol: '+' },
  SALIDA:  { Icon: ArrowUpCircle,   color: 'text-rose-500',    bg: 'bg-rose-500/10',    symbol: '-' },
  AJUSTE:  { Icon: RefreshCw,       color: 'text-blue-400',    bg: 'bg-blue-500/10',    symbol: '±' },
}

/**
 * Fila de movimiento de stock (entrada / salida / ajuste).
 */
export const MovRow = ({ mov, index }) => {
  const cfg = TIPO_CONFIG[mov.tipo] ?? TIPO_CONFIG.ENTRADA
  const { Icon, color, bg, symbol } = cfg

  return (
    <motion.div
      className="flex items-center gap-3 border-b border-white/5 py-2.5 last:border-0"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', bg)}>
        <Icon size={14} className={color} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">
          {mov.producto?.nombre ?? 'Producto'}
        </p>
        <p className="text-[10px] text-muted-foreground capitalize">
          {mov.motivo ?? mov.tipo}
        </p>
      </div>

      <span className={cn('text-xs font-bold tabular-nums', color)}>
        {symbol}{mov.cantidad}
      </span>
    </motion.div>
  )
}
