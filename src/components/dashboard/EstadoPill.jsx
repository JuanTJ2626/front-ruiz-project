import { cn } from '#/lib/utils'

/** Mapa de estilos por estado de pedido */
const ESTADO_STYLES = {
  PENDIENTE: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  ENVIADO:   'bg-blue-500/15 text-blue-400 border-blue-500/30',
  RECIBIDO:  'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  CANCELADO: 'bg-red-500/15 text-red-400 border-red-500/30',
}

/**
 * Pill de estado de pedido (PENDIENTE, ENVIADO, RECIBIDO, CANCELADO).
 */
export const EstadoPill = ({ estado }) => (
  <span
    className={cn(
      'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
      ESTADO_STYLES[estado] ?? 'bg-muted text-muted-foreground'
    )}
  >
    {estado}
  </span>
)
