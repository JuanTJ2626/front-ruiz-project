import { motion } from 'motion/react'
import { AuroraCard } from './ui/aurora-card'
import { Badge } from './ui/badge'
import { Sparkles } from 'lucide-react'

export function PageLayout({ title, subtitle, badge, actions, children }) {
  return (
    <div className="dashboard-aurora-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora-orb aurora-orb-1" />
        <div className="aurora-orb aurora-orb-2" />
        <div className="aurora-orb aurora-orb-3" />
      </div>

      <motion.div
        className="relative z-10 mx-auto max-w-[1440px] p-6 font-sans lg:p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <AuroraCard glow="cyan" featured>
            <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />
              <div className="relative">
                {badge && (
                  <Badge className="mb-3 gap-1.5 border-0 bg-cyan-500/15 px-3 py-1 text-cyan-300">
                    <Sparkles size={13} />
                    {badge}
                  </Badge>
                )}
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 max-w-xl text-[15px] text-muted-foreground">{subtitle}</p>
                )}
              </div>
              {actions && <div className="relative flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
          </AuroraCard>
        </motion.div>

        {children}
      </motion.div>
    </div>
  )
}
