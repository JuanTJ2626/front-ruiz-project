import { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import {
  Archive, ArrowDownCircle, ArrowUpCircle, RefreshCw, AlertTriangle,
  Package, TrendingUp, Clock, Plus, Check, Loader2, Search, X
} from 'lucide-react'
import { PageLayout } from './PageLayout'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { registrarMovimiento, getMovimientosNegocio } from '../services/movimientoService'
import { getNegocioId, getUsuarioId } from '../services/config'

const TIPO_CONFIG = {
  ENTRADA: { label: 'Entrada', icon: ArrowDownCircle, color: 'text-emerald-400', bg: 'border-emerald-500/30 bg-emerald-500/10' },
  SALIDA:  { label: 'Salida',  icon: ArrowUpCircle,   color: 'text-red-400',     bg: 'border-red-500/30 bg-red-500/10' },
  AJUSTE:  { label: 'Ajuste',  icon: RefreshCw,       color: 'text-amber-400',   bg: 'border-amber-500/30 bg-amber-500/10' },
}



const MovimientoRow = ({ mov, index }) => {
  const tipo = mov.tipo || 'ENTRADA'
  const cfg = TIPO_CONFIG[tipo] || TIPO_CONFIG.ENTRADA
  const Icon = cfg.icon
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all hover:border-white/10 hover:bg-white/[0.04]"
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border', cfg.bg)}>
        <Icon size={18} className={cfg.color} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{mov.productoNombre || mov.producto}</p>
        <p className="text-xs text-muted-foreground">
          {mov.fecha ? new Date(mov.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : ''}
          {mov.usuarioNombre ? ` · ${mov.usuarioNombre}` : ''}
          {mov.motivo ? ` · ${mov.motivo}` : ''}
        </p>
      </div>
      <Badge variant="outline" className={cn('shrink-0 font-bold', cfg.bg, cfg.color)}>
        {tipo === 'SALIDA' ? '-' : '+'}{Math.abs(mov.cantidad)} uds
      </Badge>
      <Badge variant="outline" className="hidden shrink-0 border-white/10 sm:inline-flex">
        {cfg.label}
      </Badge>
    </motion.div>
  )
}

const StockDashboard = ({ productos = [] }) => {
  const [movimientos, setMovimientos] = useState([])
  const [loadingMovs, setLoadingMovs] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ productoId: '', tipo: 'ENTRADA', cantidad: '', motivo: '' })

  const cargarMovimientos = useCallback(async () => {
    try {
      setLoadingMovs(true)
      const data = await getMovimientosNegocio(30)
      setMovimientos(Array.isArray(data) ? data : [])
    } catch {
      toast.error('No se pudieron cargar los movimientos')
    } finally {
      setLoadingMovs(false)
    }
  }, [])

  useEffect(() => { cargarMovimientos() }, [cargarMovimientos])

  const stats = useMemo(() => {
    const totalStock = productos.reduce((s, p) => s + (p.stock || 0), 0)
    const lowStock = productos.filter(p => p.stock <= (p.stockMinimo || 5))
    const entradas = movimientos.filter(m => m.tipo === 'ENTRADA').reduce((s, m) => s + m.cantidad, 0)
    const salidas  = movimientos.filter(m => m.tipo === 'SALIDA').reduce((s, m) => s + m.cantidad, 0)
    return { totalStock, lowStock, entradas, salidas }
  }, [productos, movimientos])

  const filtered = useMemo(() => {
    if (!search.trim()) return movimientos
    const q = search.toLowerCase()
    return movimientos.filter(m =>
      (m.productoNombre || '').toLowerCase().includes(q) ||
      (m.tipo || '').toLowerCase().includes(q) ||
      (m.motivo || '').toLowerCase().includes(q)
    )
  }, [movimientos, search])

  const lowItems = useMemo(
    () => [...productos].filter(p => p.stock <= (p.stockMinimo || 5)).sort((a, b) => a.stock - b.stock).slice(0, 5),
    [productos]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const usuarioId = Number(getUsuarioId())
      await registrarMovimiento({
        tipo: form.tipo,
        cantidad: parseInt(form.cantidad),
        motivo: form.motivo || undefined,
        productoId: Number(form.productoId),
        usuarioId,
      })
      toast.success(`Movimiento de ${form.tipo.toLowerCase()} registrado`)
      setForm({ productoId: '', tipo: 'ENTRADA', cantidad: '', motivo: '' })
      setShowForm(false)
      cargarMovimientos()
    } catch (err) {
      toast.error(err.message || 'Error al registrar movimiento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageLayout
        title="Control de Stock"
        subtitle="Registra entradas, salidas y ajustes de inventario. Alertas automáticas cuando el stock baja del mínimo."
        badge="Módulo Stock · MVP"
        actions={
          <Button onClick={() => setShowForm(true)} className="gap-2 rounded-xl shadow-md">
            <Plus size={16} /> Nuevo Movimiento
          </Button>
        }
      >
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AuroraStatCard icon={Archive} label="Stock Total" value={stats.totalStock.toLocaleString()} sub="unidades actuales" glow="cyan" delay={80} />
          <AuroraStatCard icon={ArrowDownCircle} label="Entradas" value={stats.entradas} sub="unidades recibidas" glow="emerald" delay={160} />
          <AuroraStatCard icon={ArrowUpCircle} label="Salidas" value={stats.salidas} sub="unidades vendidas" glow="rose" delay={240} />
          <AuroraStatCard icon={AlertTriangle} label="Alertas" value={stats.lowStock.length} sub="stock ≤ mínimo" glow="amber" delay={320} trend={stats.lowStock.length > 0 ? 'Crítico' : undefined} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          <motion.div className="xl:col-span-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AuroraCard glow="blue" className="h-full">
              <div className="p-6">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Historial de Movimientos</h2>
                    <p className="text-sm text-muted-foreground">Entradas, salidas y ajustes recientes</p>
                  </div>
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                    <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar movimiento..." className="h-10 rounded-xl pl-9 pr-9" />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {filtered.map((m, i) => <MovimientoRow key={m.id} mov={m} index={i} />)}
                </div>
              </div>
            </AuroraCard>
          </motion.div>

          <motion.div className="xl:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <AuroraCard glow="amber" className="h-full">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-foreground">Alertas de Mínimo</h2>
                    <p className="text-sm text-muted-foreground">Productos bajo stock mínimo</p>
                  </div>
                  {lowItems.length > 0 && (
                    <Badge variant="outline" className="animate-pulse border-red-500/30 bg-red-500/10 text-red-400">
                      {lowItems.length}
                    </Badge>
                  )}
                </div>
                {lowItems.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center text-center">
                    <TrendingUp size={32} className="mb-3 text-emerald-400/60" />
                    <p className="font-heading font-bold text-foreground">Stock Saludable</p>
                    <p className="mt-1 text-sm text-muted-foreground">Ningún producto bajo el mínimo.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {lowItems.map(p => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-red-500/15 bg-red-500/5 p-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Package size={16} className="shrink-0 text-red-400" />
                          <span className="truncate text-sm font-semibold text-foreground">{p.nombre}</span>
                        </div>
                        <Badge variant="outline" className="shrink-0 border-red-500/30 bg-red-500/10 text-red-400">
                          {p.stock} uds
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={13} />
                    <span>Los movimientos se sincronizan con el backend vía API REST</span>
                  </div>
                </div>
              </div>
            </AuroraCard>
          </motion.div>
        </div>
      </PageLayout>

      <Sheet open={showForm} onOpenChange={setShowForm}>
        <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
          <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
            <SheetTitle className="text-xl font-bold">Registrar Movimiento</SheetTitle>
            <SheetDescription>Entrada, salida o ajuste de stock.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
            <div className="space-y-2">
              <Label htmlFor="s-producto">Producto</Label>
              <select
                id="s-producto"
                value={form.productoId}
                onChange={e => setForm({ ...form, productoId: e.target.value })}
                required
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
              >
                <option value="">Selecciona un producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} — Stock: {p.stock}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de movimiento</Label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, tipo: key })}
                      className={cn(
                        'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all',
                        form.tipo === key ? cfg.bg : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                      )}
                    >
                      <Icon size={18} className={form.tipo === key ? cfg.color : 'text-muted-foreground'} />
                      <span className="text-xs font-semibold">{cfg.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-cant">Cantidad</Label>
              <Input id="s-cant" type="number" min="1" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required className="h-11 rounded-xl" placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-motivo">Motivo <span className="text-muted-foreground">(opcional)</span></Label>
              <Input id="s-motivo" value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} className="h-11 rounded-xl" placeholder="Ej. Venta mostrador, Ajuste de inventario..." />
            </div>
          </form>
          <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
            <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="gap-2 rounded-xl">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Guardando...' : 'Registrar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default StockDashboard
