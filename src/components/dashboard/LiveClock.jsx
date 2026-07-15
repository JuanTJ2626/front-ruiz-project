import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

/**
 * Reloj en tiempo real que se actualiza cada segundo.
 * Muestra hora en formato HH:MM:SS con badge de actividad.
 */
export const LiveClock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs font-mono font-semibold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-white/50">
      <Activity size={11} />
      <span className="tabular-nums">
        {time.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </span>
  )
}
