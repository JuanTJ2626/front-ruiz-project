import { useState } from 'react'
import { motion } from 'motion/react'
import { Users, Info } from 'lucide-react'
import { PageLayout } from './PageLayout'
import { AuroraCard } from './ui/aurora-card'

const ClientesDashboard = () => (
  <PageLayout
    title="Clientes"
    subtitle="Directorio de clientes del negocio."
    badge="Próximamente"
  >
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <AuroraCard glow="cyan">
        <div className="flex flex-col items-center justify-center gap-4 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Users size={30} className="text-cyan-400" />
          </div>
          <div>
            <p className="font-heading text-xl font-bold text-foreground">Módulo de Clientes</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Este módulo estará disponible cuando el backend implemente los endpoints de clientes.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-muted-foreground">
            <Info size={13} />
            Endpoint esperado: <code className="text-cyan-400 ml-1">GET /api/clientes/negocio/{'{id}'}</code>
          </div>
        </div>
      </AuroraCard>
    </motion.div>
  </PageLayout>
)

export default ClientesDashboard
