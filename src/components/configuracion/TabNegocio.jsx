import { motion } from 'motion/react'
import { Building2, Layers, Upload, Loader2, Plus, Trash2, Check, X } from 'lucide-react'
import { AuroraCard } from '../ui/aurora-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { cn } from '#/lib/utils'

/**
 * Tab "Negocio" del panel de configuración.
 * Muestra el formulario de datos del negocio activo (nombre, giro, logo)
 * y la lista de negocios para cambiar el activo.
 */
export const TabNegocio = ({
  // Formulario del negocio activo
  formNegocio,
  updateField,
  uploadingLogo,
  handleSubirLogo,
  // Lista de negocios
  negocios,
  negocioActivo,
  isAdmin,
  isSuperAdmin,
  onSeleccionarNegocio,
  onNuevoNegocio,
  onEliminarNegocio,
}) => (
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    {/* ── Datos del negocio activo ── */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <AuroraCard glow="emerald" className="h-full">
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Datos del Negocio</h2>
              <p className="text-xs text-muted-foreground">Negocio activo</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={formNegocio.nombre}
                onChange={e => updateField('nombre', e.target.value)}
                className="h-10 rounded-xl"
                placeholder="Mi Negocio"
              />
            </div>

            <div className="space-y-2">
              <Label>Giro comercial</Label>
              <Input
                value={formNegocio.direccion || ''}
                onChange={e => updateField('direccion', e.target.value)}
                className="h-10 rounded-xl"
                placeholder="Ferretería, Abarrotes..."
              />
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo del negocio</Label>
              <div className="relative flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                {formNegocio.logoUrl ? (
                  <div className="relative">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 shadow-lg">
                      <img src={formNegocio.logoUrl} alt="logo del negocio" className="h-full w-full object-contain p-2" />
                    </div>
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Logo activo
                    </span>
                  </div>
                ) : (
                  <div className="flex h-28 w-28 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02]">
                    <Upload size={24} className="text-muted-foreground/40" />
                    <span className="text-[10px] text-muted-foreground/40">Sin logo</span>
                  </div>
                )}

                <div className="flex w-full flex-col gap-2">
                  <label className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400',
                    uploadingLogo && 'cursor-not-allowed opacity-60'
                  )}>
                    {uploadingLogo ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                    {uploadingLogo ? 'Subiendo...' : formNegocio.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={e => handleSubirLogo(e.target.files?.[0])}
                    />
                  </label>

                  {formNegocio.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateField('logoUrl', '')}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2 text-xs font-medium text-red-400/70 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X size={13} /> Quitar logo
                    </button>
                  )}
                </div>
                <p className="text-center text-[11px] text-muted-foreground/50">PNG, JPG, WebP o SVG · Máx. 2MB</p>
              </div>
            </div>
          </div>
        </div>
      </AuroraCard>
    </motion.div>

    {/* ── Lista de negocios ── */}
    {(negocios.length > 0 || isAdmin) && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <AuroraCard glow="blue" className="h-full">
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Mis Negocios</h2>
                  <p className="text-sm text-muted-foreground">Selecciona el activo</p>
                </div>
              </div>
              <Button size="sm" onClick={onNuevoNegocio} className="gap-2 rounded-xl">
                <Plus size={14} /> Nuevo
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {negocios.map(n => (
                <div
                  key={n.id}
                  className={cn(
                    'relative flex flex-col items-start gap-2 rounded-xl border p-4 transition-all',
                    negocioActivo === n.id
                      ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  )}
                >
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); onEliminarNegocio(n) }}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground/40 transition-all hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSeleccionarNegocio(n)}
                    className="flex w-full flex-col items-start gap-1 text-left"
                  >
                    <div className="flex w-full items-center justify-between pr-4">
                      <Building2 size={16} className={negocioActivo === n.id ? 'text-cyan-400' : 'text-muted-foreground'} />
                      {negocioActivo === n.id && (
                        <Badge className="border-0 bg-cyan-500/20 text-[10px] text-cyan-300">
                          <Check size={9} className="mr-1" /> Activo
                        </Badge>
                      )}
                    </div>
                    <p className="font-heading text-sm font-bold text-foreground">{n.nombre}</p>
                    {n.giro && <p className="text-xs text-muted-foreground">{n.giro}</p>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AuroraCard>
      </motion.div>
    )}
  </div>
)
