import { motion } from 'motion/react'
import { Package, Archive, AlertTriangle, Pencil, Trash2, BoxIcon } from 'lucide-react'
import { Card, CardContent, CardFooter } from '#/components/ui/card'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'

export const ProductoCard = ({ prod, isAdmin, onEdit, onDelete }) => {
  const isCritical = prod.stock <= (prod.stockMinimo || 5)
  const stockPct = prod.stockMinimo
    ? Math.min(Math.round((prod.stock / (prod.stockMinimo * 4)) * 100), 100)
    : null

  return (
    <motion.div
      layout
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      className="group"
    >
      <Card className={`
        h-full flex flex-col overflow-hidden transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        ${isCritical
          ? 'border-red-500/30 shadow-[0_0_0_1px_rgba(239,68,68,0.15)]'
          : 'border-muted/50'}
      `}>
        {/* Imagen / placeholder */}
        {prod.imagenUrl ? (
          <div className="relative h-44 overflow-hidden bg-muted/30 shrink-0">
            <img src={prod.imagenUrl} alt={prod.nombre}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            {isCritical && (
              <div className="absolute top-2.5 left-2.5">
                <Badge className="gap-1 border-0 bg-red-500/90 text-white text-[10px] font-bold shadow-md backdrop-blur-sm">
                  <AlertTriangle size={9} /> Stock crítico
                </Badge>
              </div>
            )}
            {prod.categoriaNombre && (
              <div className="absolute top-2.5 right-2.5">
                <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
                  {prod.categoriaNombre}
                </Badge>
              </div>
            )}
          </div>
        ) : (
          <div className={`relative h-28 shrink-0 flex items-center justify-center
            ${isCritical ? 'bg-red-500/5' : 'bg-muted/20'}`}>
            <BoxIcon size={36} className={isCritical ? 'text-red-400/40' : 'text-muted-foreground/20'} />
            {isCritical && (
              <div className="absolute top-2.5 left-2.5">
                <Badge className="gap-1 border-0 bg-red-500/90 text-white text-[10px] font-bold">
                  <AlertTriangle size={9} /> Stock crítico
                </Badge>
              </div>
            )}
            {prod.categoriaNombre && (
              <div className="absolute top-2.5 right-2.5">
                <Badge variant="secondary" className="text-[10px]">
                  {prod.categoriaNombre}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Cuerpo */}
        <CardContent className="flex flex-col flex-1 gap-3 p-4">
          <div>
            <h3 className="font-bold text-foreground text-[15px] leading-snug line-clamp-1">{prod.nombre}</h3>
            {prod.sku && <span className="text-[11px] font-mono text-muted-foreground/70">{prod.sku}</span>}
          </div>
          {prod.descripcion && (
            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">{prod.descripcion}</p>
          )}
          <div className="mt-auto space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Archive size={11} /> Stock
              </span>
              <span className={`font-bold tabular-nums ${isCritical ? 'text-red-500' : 'text-foreground'}`}>
                {prod.stock} uds
                {prod.stockMinimo ? (
                  <span className="text-muted-foreground font-normal"> / mín {prod.stockMinimo}</span>
                ) : null}
              </span>
            </div>
            {stockPct !== null && (
              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-red-500' : stockPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${stockPct}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-4 py-3 flex items-center justify-between gap-2">
          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
            ${prod.precio?.toFixed(2)}
          </span>
          <Separator orientation="vertical" className="h-4 opacity-30" />
          <span className="text-[11px] text-muted-foreground tabular-nums">
            Valor: ${((prod.precio || 0) * (prod.stock || 0)).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            {isAdmin && (<>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => onEdit(prod)}>
                    <Pencil size={13} className="text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar producto</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20" onClick={() => onDelete(prod)}>
                    <Trash2 size={13} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar producto</TooltipContent>
              </Tooltip>
            </>)}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
