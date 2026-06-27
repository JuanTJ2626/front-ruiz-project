import { useState } from 'react'
import { motion } from 'motion/react'
import {
  Settings, Building2, Bell, Shield, User, Globe, Store,
  Mail, Phone, Save, Check, Loader2, Moon, Layers
} from 'lucide-react'
import { PageLayout } from './PageLayout'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Avatar, AvatarFallback } from './ui/avatar'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'

const NEGOCIOS = [
  { id: 1, nombre: 'Tienda Central', giro: 'Abarrotes', activo: true },
  { id: 2, nombre: 'Sucursal Norte', giro: 'Ferretería', activo: false },
  { id: 3, nombre: 'Boutique Moda', giro: 'Ropa', activo: false },
]

const Toggle = ({ enabled, onChange, label, description }) => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
    <div>
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300',
        enabled ? 'bg-cyan-500' : 'bg-muted'
      )}
    >
      <span className={cn(
        'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300',
        enabled ? 'translate-x-5' : 'translate-x-0.5'
      )} />
    </button>
  </div>
)

const ConfiguracionDashboard = () => {
  const [saving, setSaving] = useState(false)
  const [negocioActivo, setNegocioActivo] = useState(1)
  const [alertas, setAlertas] = useState({ stockMinimo: true, email: true, push: false })
  const [negocio, setNegocio] = useState({
    nombre: 'Mi Negocio',
    giro: 'Tienda de abarrotes',
    email: 'contacto@minegocio.mx',
    telefono: '55 1234 5678',
  })
  const [perfil, setPerfil] = useState({
    nombre: 'Administrador',
    email: 'admin@inventario.mx',
    rol: 'Administrador',
  })

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Configuración guardada correctamente')
  }

  return (
    <PageLayout
      title="Configuración del Sistema"
      subtitle="Administra tu negocio, perfil de usuario, alertas y preferencias de la plataforma."
      badge="Ajustes"
      actions={
        <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl shadow-md">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AuroraStatCard icon={Building2} label="Negocios" value={NEGOCIOS.length} sub="cuentas vinculadas" glow="cyan" delay={80} />
        <AuroraStatCard icon={Shield} label="Rol Actual" value={perfil.rol} sub="permisos completos" glow="violet" delay={160} />
        <AuroraStatCard icon={Bell} label="Alertas" value={Object.values(alertas).filter(Boolean).length} sub="notificaciones activas" glow="amber" delay={240} />
        <AuroraStatCard icon={Globe} label="Versión" value="1.0" sub="Junio 2026" glow="emerald" delay={320} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Perfil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AuroraCard glow="cyan" className="h-full">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Perfil de Usuario</h2>
                  <p className="text-xs text-muted-foreground">Datos de tu cuenta</p>
                </div>
              </div>

              <div className="mb-5 flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-cyan-500/30">
                  <AvatarFallback className="bg-cyan-500/10 text-lg font-bold text-cyan-400">AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-heading font-bold text-foreground">{perfil.nombre}</p>
                  <Badge variant="outline" className="mt-1 border-violet-500/30 bg-violet-500/10 text-violet-400">
                    {perfil.rol}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="p-nombre">Nombre</Label>
                  <Input id="p-nombre" value={perfil.nombre} onChange={e => setPerfil({ ...perfil, nombre: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-email">Correo</Label>
                  <Input id="p-email" type="email" value={perfil.email} onChange={e => setPerfil({ ...perfil, email: e.target.value })} className="h-10 rounded-xl" />
                </div>
              </div>
            </div>
          </AuroraCard>
        </motion.div>

        {/* Negocio */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <AuroraCard glow="emerald" className="h-full">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
                  <Store size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Datos del Negocio</h2>
                  <p className="text-xs text-muted-foreground">Información general</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="n-nombre">Nombre del negocio</Label>
                  <Input id="n-nombre" value={negocio.nombre} onChange={e => setNegocio({ ...negocio, nombre: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-giro">Giro comercial</Label>
                  <Input id="n-giro" value={negocio.giro} onChange={e => setNegocio({ ...negocio, giro: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-email"><Mail size={12} className="mr-1 inline" />Email</Label>
                  <Input id="n-email" value={negocio.email} onChange={e => setNegocio({ ...negocio, email: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="n-tel"><Phone size={12} className="mr-1 inline" />Teléfono</Label>
                  <Input id="n-tel" value={negocio.telefono} onChange={e => setNegocio({ ...negocio, telefono: e.target.value })} className="h-10 rounded-xl" />
                </div>
              </div>
            </div>
          </AuroraCard>
        </motion.div>

        {/* Alertas */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <AuroraCard glow="amber" className="h-full">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
                  <Bell size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Notificaciones</h2>
                  <p className="text-xs text-muted-foreground">Alertas de inventario</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Toggle
                  enabled={alertas.stockMinimo}
                  onChange={v => setAlertas({ ...alertas, stockMinimo: v })}
                  label="Alertas de stock mínimo"
                  description="Aviso cuando un producto baja del mínimo"
                />
                <Toggle
                  enabled={alertas.email}
                  onChange={v => setAlertas({ ...alertas, email: v })}
                  label="Notificaciones por email"
                  description="Recibe alertas en tu correo"
                />
                <Toggle
                  enabled={alertas.push}
                  onChange={v => setAlertas({ ...alertas, push: v })}
                  label="Notificaciones push"
                  description="Alertas en tiempo real en el navegador"
                />
              </div>

              <Separator className="my-5 bg-white/5" />

              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <Settings size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-foreground">Umbral de stock mínimo</p>
                  <p className="text-xs text-muted-foreground">Alerta cuando stock ≤ 5 unidades</p>
                </div>
              </div>
            </div>
          </AuroraCard>
        </motion.div>
      </div>

      {/* Multi-negocio */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <AuroraCard glow="violet">
          <div className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold text-foreground">Multi-Negocio</h2>
                  <p className="text-sm text-muted-foreground">Selecciona el negocio activo para filtrar productos, stock y reportes</p>
                </div>
              </div>
              <Badge variant="outline" className="border-violet-500/30 text-violet-400">
                {NEGOCIOS.length} negocios
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {NEGOCIOS.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => { setNegocioActivo(n.id); toast.success(`Negocio activo: ${n.nombre}`) }}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                    negocioActivo === n.id
                      ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <Building2 size={18} className={negocioActivo === n.id ? 'text-cyan-400' : 'text-muted-foreground'} />
                    {negocioActivo === n.id && (
                      <Badge className="border-0 bg-cyan-500/20 text-cyan-300">
                        <Check size={10} className="mr-1" /> Activo
                      </Badge>
                    )}
                  </div>
                  <p className="font-heading text-sm font-bold text-foreground">{n.nombre}</p>
                  <p className="text-xs text-muted-foreground">{n.giro}</p>
                </button>
              ))}
            </div>
          </div>
        </AuroraCard>
      </motion.div>

      {/* Seguridad */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <AuroraCard glow="rose">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
                <Shield size={18} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Seguridad</h2>
                <p className="text-sm text-muted-foreground">Autenticación JWT · Spring Security</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Shield, label: 'JWT Activo', sub: 'Token en localStorage' },
                { icon: User, label: 'Rol: Admin', sub: 'Acceso completo al sistema' },
                { icon: Moon, label: 'Sesión segura', sub: 'Bearer Authorization header' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <Icon size={18} className="text-cyan-400" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AuroraCard>
      </motion.div>
    </PageLayout>
  )
}

export default ConfiguracionDashboard
