import { motion } from 'motion/react'
import { User } from 'lucide-react'
import { AuroraCard } from '../ui/aurora-card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Badge } from '../ui/badge'

/**
 * Tab "Perfil" del panel de configuración.
 * Muestra el avatar, nombre de usuario y rol. Solo lectura:
 * los cambios de perfil se gestionan desde el backend.
 */
export const TabPerfil = ({ username, rol }) => {
  const initials = username.slice(0, 2).toUpperCase()

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <AuroraCard glow="cyan" className="max-w-md">
        <div className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <User size={18} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">Perfil</h2>
              <p className="text-xs text-muted-foreground">Tu cuenta</p>
            </div>
          </div>

          <div className="mb-5 flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-cyan-500/30">
              <AvatarFallback className="bg-cyan-500/10 text-lg font-bold text-cyan-400">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-heading font-bold text-foreground">{username}</p>
              <Badge variant="outline" className="mt-1 border-violet-500/30 bg-violet-500/10 text-violet-400">
                {rol}
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <p className="text-xs text-muted-foreground">
              El perfil se gestiona desde el backend. Contacta al administrador para cambios.
            </p>
          </div>
        </div>
      </AuroraCard>
    </motion.div>
  )
}
