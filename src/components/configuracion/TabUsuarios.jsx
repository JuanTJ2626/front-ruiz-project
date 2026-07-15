import { motion } from 'motion/react'
import { Users, Plus } from 'lucide-react'
import { AuroraCard } from '../ui/aurora-card'
import { Button } from '../ui/button'
import { UsuarioRow } from './UsuarioRow'

/**
 * Tab "Usuarios" del panel de configuración (solo ADMIN).
 * Muestra la lista de usuarios con skeleton de carga y estado vacío.
 */
export const TabUsuarios = ({
  usuarios,
  loadingUsuarios,
  currentUsername,
  onNuevoUsuario,
  onToggleActivo,
  onCambiarRol,
  onEliminar,
  onAsignarNegocio,
  onQuitarNegocio,
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
    <AuroraCard glow="violet">
      <div className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Gestión de Usuarios</h2>
              <p className="text-sm text-muted-foreground">Crea empleados y gestiona roles</p>
            </div>
          </div>
          <Button onClick={onNuevoUsuario} className="gap-2 rounded-xl" size="sm">
            <Plus size={14} /> Nuevo usuario
          </Button>
        </div>

        {/* Skeleton de carga */}
        {loadingUsuarios ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-32 animate-pulse rounded bg-white/10" />
                  <div className="h-2.5 w-48 animate-pulse rounded bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : usuarios.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center py-10 text-center">
            <Users size={32} className="mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
          </div>
        ) : (
          /* Lista de usuarios */
          <div className="flex flex-col gap-2">
            {usuarios.map(u => (
              <UsuarioRow
                key={u.id}
                usuario={u}
                currentUsername={currentUsername}
                onToggleActivo={onToggleActivo}
                onCambiarRol={onCambiarRol}
                onEliminar={onEliminar}
                onAsignarNegocio={onAsignarNegocio}
                onQuitarNegocio={onQuitarNegocio}
              />
            ))}
          </div>
        )}
      </div>
    </AuroraCard>
  </motion.div>
)
