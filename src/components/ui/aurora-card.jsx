import { cn } from "#/lib/utils"
import { useRef, useEffect, useState } from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"

const glowMap = {
  cyan: "aurora-glow-cyan",
  emerald: "aurora-glow-emerald",
  violet: "aurora-glow-violet",
  amber: "aurora-glow-amber",
  rose: "aurora-glow-rose",
  blue: "aurora-glow-blue",
}

/* Contador animado interno */
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 55, damping: 16, mass: 0.9 })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    motionVal.set(value)
  }, [inView, value, motionVal])

  useEffect(() => {
    return spring.on('change', (v) => {
      const formatted = decimals > 0
        ? v.toLocaleString('es-MX', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : Math.round(v).toLocaleString('es-MX')
      setDisplay(formatted)
    })
  }, [spring, decimals])

  return <span ref={ref}>{prefix}{display}{suffix}</span>
}

export function AuroraCard({
  children,
  className,
  glow = "cyan",
  featured = false,
  kpi = false,
  ...props
}) {
  return (
    <div
      className={cn(
        "aurora-card group relative",
        featured && "aurora-card-featured",
        kpi && "aurora-card-kpi",
        kpi && `aurora-kpi-${glow}`,
        className
      )}
      {...props}
    >
      <div className={cn("aurora-card-glow pointer-events-none", glowMap[glow])} />
      <div className="aurora-card-border pointer-events-none" />
      <div className="aurora-card-inner relative h-full">{children}</div>
    </div>
  )
}

export function AuroraStatCard({
  icon: Icon,
  label,
  value,
  prefix = '',
  decimals = 0,
  sub,
  glow = "cyan",
  delay = 0,
  trend,
  className,
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0

  return (
    <div
      className={cn("aurora-stat-enter", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <AuroraCard kpi glow={glow} className="h-full transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]"
        style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.12))' }}
      >
        <div className="flex h-full flex-col justify-between p-6">
          {/* Top row: label + icon */}
          <div className="flex items-start justify-between">
            <p className="aurora-kpi-label text-xs font-semibold uppercase tracking-widest">
              {label}
            </p>
            <div className="aurora-kpi-icon flex h-10 w-10 items-center justify-center rounded-2xl">
              <Icon size={19} strokeWidth={1.75} />
            </div>
          </div>

          {/* Big number */}
          <div className="my-4">
            <p className="aurora-kpi-value font-heading font-bold tracking-tight tabular-nums leading-none">
              <AnimatedNumber value={numericValue} prefix={prefix} decimals={decimals} />
            </p>
            {sub && (
              <p className="aurora-kpi-sub mt-2">{sub}</p>
            )}
          </div>

          {/* Bottom pill — estilo Apple "Start Free" */}
          <div className="flex items-center justify-between gap-2">
            <div className={cn(
              'flex-1 rounded-2xl px-4 py-2.5 text-center text-sm font-bold',
              'bg-black/15 text-black/70 dark:bg-white/12 dark:text-white/80',
              'backdrop-blur-md border border-black/8 dark:border-white/10'
            )}>
              {trend ?? 'Ver detalle'}
            </div>
          </div>
        </div>
      </AuroraCard>
    </div>
  )
}
