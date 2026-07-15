import { motion } from 'motion/react'
import { cn } from '#/lib/utils'

/**
 * Barra de stock con semáforo de colores:
 * - Rojo  : ≤ 20% del máximo (CRÍTICO)
 * - Ámbar : ≤ 50% del máximo (BAJO)
 * - Verde : > 50% del máximo (OK)
 *
 * La barra usa la clase `gsap-stock-bar-fill` y el atributo
 * `data-pct` para que el padre anime el ancho con GSAP.
 */
export const StockBar = ({ name, current, max, index }) => {
  const pct = Math.min((current / max) * 100, 100)

  const color =
    pct <= 20 ? { bar: '#ef4444', bg: 'bg-red-500/10',     text: 'text-red-500'     } :
    pct <= 50 ? { bar: '#f59e0b', bg: 'bg-amber-500/10',   text: 'text-amber-500'   } :
               { bar: '#10b981', bg: 'bg-emerald-500/10',  text: 'text-emerald-500' }

  return (
    <motion.div
      className="group flex flex-col gap-1.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: 0.4 + index * 0.08 }}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="min-w-0 flex-1 truncate font-semibold text-foreground">{name}</span>
        <span className={cn('shrink-0 text-xs font-bold', color.text)}>{Math.round(pct)}%</span>
      </div>

      <div className="relative h-2 overflow-hidden rounded-full bg-muted/30">
        <div
          className="gsap-stock-bar-fill h-full rounded-full"
          data-pct={pct}
          style={{ width: 0, background: `linear-gradient(90deg, ${color.bar}, ${color.bar}aa)` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{current} / {max} uds</span>
        <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold', color.bg, color.text)}>
          {pct <= 20 ? 'CRÍTICO' : pct <= 50 ? 'BAJO' : 'OK'}
        </span>
      </div>
    </motion.div>
  )
}
