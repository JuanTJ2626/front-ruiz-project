import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { Switch } from '#/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/ui/tooltip'
import { Building2, KeyRound, Shield, Store, Trash2, X } from 'lucide-react'
import { cn } from '#/lib/utils'

export const UsuarioRow = ({
  usuario: u,
  currentUsername,
  onToggleActivo,
  onCambiarRol,
  onEliminar,
  onAsignarNegocio,
  onQuitarNegocio,
}) => {
  const isSelf = u.username === currentUsername

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 sm:flex-row sm:items-center">
      <Avatar className="hidden h-10 w-10 shrink-0 border border-white/10 sm:flex">
        <AvatarFallback className="bg-muted text-sm font-bold">{(u.username || u.nombre || '?').slice(0,2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Avatar className="h-7 w-7 shrink-0 border border-white/10 sm:hidden">
            <AvatarFallback className="bg-muted text-xs font-bold">{(u.username || u.nombre || '?').slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold text-foreground">{u.username || u.nombre}</span>
          <Badge variant="outline" className={cn('text-[10px] font-bold',
            u.rol === 'SUPER_ADMIN' ? 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400' :
            u.rol === 'ADMIN' ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 
            'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
          )}>{u.rol}</Badge>
        </div>

        {/* Negocio asignado */}
        <div className="mt-1 flex items-center gap-1.5">
          {u.negocioNombre ? (
            <span className="flex items-center gap-1 text-xs">
              <Building2 size={10} className={
                u.rol === 'SUPER_ADMIN' ? 'text-fuchsia-400' :
                u.rol === 'ADMIN' ? 'text-violet-400' : 'text-emerald-400'
              } />
              <span className={cn('font-medium',
                u.rol === 'SUPER_ADMIN' ? 'text-fuchsia-400/80' :
                u.rol === 'ADMIN' ? 'text-violet-400/80' : 'text-emerald-400/80'
              )}>{u.negocioNombre}</span>
            </span>
          ) : (
            u.rol !== 'SUPER_ADMIN' && (
              <span className="text-xs text-amber-500/70">Sin negocio asignado</span>
            )
          )}
        </div>

        {u.email && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{u.email}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {/* Switch activar/desactivar */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <Switch
                checked={u.activo !== false}
                onCheckedChange={() => u.rol !== 'SUPER_ADMIN' && !isSelf && onToggleActivo(u)}
                disabled={u.rol === 'SUPER_ADMIN' || isSelf}
                className={cn(
                  "data-[state=checked]:bg-emerald-500",
                  (u.rol === 'SUPER_ADMIN' || isSelf) && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {u.rol === 'SUPER_ADMIN'
              ? '🔒 El SUPER_ADMIN no puede desactivarse'
              : isSelf
              ? '⚠️ No puedes desactivar tu propia cuenta'
              : (u.activo !== false ? 'Desactivar usuario' : 'Activar usuario')}
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-5 opacity-30" />
        
        {/* Asignar / quitar negocio — solo para EMPLEADOS */}
        {u.rol === 'EMPLEADO' && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"
                  onClick={() => onAsignarNegocio(u)}>
                  <Store size={14} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{u.negocioId ? 'Cambiar negocio' : 'Asignar negocio'}</TooltipContent>
            </Tooltip>
            {u.negocioId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost"
                    className="h-8 w-8 rounded-lg hover:bg-amber-500/10 hover:text-amber-500"
                    onClick={() => onQuitarNegocio(u.id, u.username)}>
                    <X size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quitar negocio</TooltipContent>
              </Tooltip>
            )}
            <Separator orientation="vertical" className="h-5 opacity-30" />
          </>
        )}
        
        {/* Cambiar rol */}
        {u.rol !== 'SUPER_ADMIN' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon" variant="ghost"
                className={cn(
                  'h-8 w-8 rounded-lg',
                  isSelf && 'opacity-40 cursor-not-allowed'
                )}
                onClick={() => onCambiarRol(u)}
              >
                <KeyRound size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSelf
                ? '⚠️ No puedes cambiar tu propio rol'
                : 'Cambiar rol (EMPLEADO ⇄ ADMIN)'}
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Eliminar */}
        {u.rol !== 'SUPER_ADMIN' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon" variant="ghost"
                className={cn(
                  'h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500',
                  isSelf && 'opacity-40 cursor-not-allowed'
                )}
                onClick={() => !isSelf && onEliminar(u)}
              >
                <Trash2 size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSelf
                ? '⚠️ No puedes eliminar tu propia cuenta'
                : 'Eliminar usuario'}
            </TooltipContent>
          </Tooltip>
        )}
        
        {/* Indicador SUPER_ADMIN protegido */}
        {u.rol === 'SUPER_ADMIN' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
                <Shield size={14} className="text-fuchsia-400" />
              </div>
            </TooltipTrigger>
            <TooltipContent>🔒 Cuenta protegida - No se puede modificar ni eliminar</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
