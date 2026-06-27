import { cn } from "#/lib/utils"

const glowMap = {
  cyan: "aurora-glow-cyan",
  emerald: "aurora-glow-emerald",
  violet: "aurora-glow-violet",
  amber: "aurora-glow-amber",
  rose: "aurora-glow-rose",
  blue: "aurora-glow-blue",
}

export function AuroraCard({
  children,
  className,
  glow = "cyan",
  featured = false,
  ...props
}) {
  return (
    <div
      className={cn(
        "aurora-card group relative",
        featured && "aurora-card-featured",
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
  sub,
  glow = "cyan",
  delay = 0,
  trend,
  className,
}) {
  return (
    <div
      className={cn("aurora-stat-enter", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <AuroraCard glow={glow} className="h-full transition-transform duration-500 hover:-translate-y-1">
        <div className="flex h-full flex-col justify-between p-6">
          <div className="mb-5 flex items-start justify-between">
            <div className="aurora-icon-ring flex h-12 w-12 items-center justify-center rounded-2xl">
              <Icon size={22} strokeWidth={1.75} />
            </div>
            {trend && (
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                {trend}
              </span>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {sub && (
              <p className="mt-1.5 text-sm text-muted-foreground">{sub}</p>
            )}
          </div>
        </div>
      </AuroraCard>
    </div>
  )
}
