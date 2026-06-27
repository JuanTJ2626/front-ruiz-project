import { useMemo, useState } from 'react'
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

const TIPO_CONFIG = {
  entrada: { label: 'Entrada', icon: ArrowDownCircle, color: 'text-emerald-400', bg: 'border-emerald-500/30 bg-emerald-500/10' },
  salida: { label: 'Salida', icon: ArrowUpCircle, color: 'text-red-400', bg: 'border-red-500/30 bg-red-500/10' },
  ajuste: { label: 'Ajuste', icon: RefreshCw, color: 'text-amber-400', bg: 'border-amber-500/30 bg-amber-500/10' },
}

const DEMO_MOVIMIENTOS = [
  { id: 1, producto: 'Arroz 1kg', tipo: 'entrada', cantidad: 50, fecha: '2026-06-27 09:15', usuario: 'Admin' },
  { id: 2, producto: 'Aceite Vegetal', tipo: 'salida', cantidad: 12, fecha: '2026-06-27 08:42', usuario: 'Empleado' },
  { id: 3, producto: 'Detergente Líquido', tipo: 'ajuste', cantidad: -3, fecha: '2026-06-26 17:30', usuario: 'Admin' },
  { id: 4, producto: 'Papel Higiénico', tipo: 'entrada', cantidad: 100, fecha: '2026-06-26 14:00', usuario: 'Admin' },
  { id: 5, producto: 'Café Molido', tipo: 'salida', cantidad: 8, fecha: '2026-06-26 11:20', usuario: 'Empleado' },
  { id: 6, producto: 'Azúcar Refinada', tipo: 'entrada', cantidad: 30, fecha: '2026-06-25 16:45', usuario: 'Admin' },
]

const MovimientoRow = ({ mov, index }) => {
  const cfg = TIPO_CONFIG[mov.tipo]
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
        <p className="truncate text-sm font-bold text-foreground">{mov.producto}</p>
        <p className="text-xs text-muted-foreground">{mov.fecha} · {mov.usuario}</p>
      </div>
      <Badge variant="outline" className={cn('shrink-0 font-bold', cfg.bg, cfg.color)}>
        {mov.tipo === 'ajuste' && mov.cantidad < 0 ? '' : mov.tipo === 'salida' ? '-' : '+'}
        {Math.abs(mov.cantidad)} uds
      </Badge>
      <Badge variant="outline" className="hidden shrink-0 border-white/10 sm:inline-flex">
        {cfg.label}
      </Badge>
    </motion.div>
  )
}

const StockDashboard = ({ productos = [] }) => {
  const [movimientos, setMovimientos] = useState(DEMO_MOVIMIENTOS)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ producto: '', tipo: 'entrada', cantidad: '' })

  const stats = useMemo(() => {
    const totalStock = productos.reduce((s, p) => s + (p.stock || 0), 0)
    const lowStock = productos.filter(p => p.stock <= 5)
    const entradas = movimientos.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.cantidad, 0)
    const salidas = movimientos.filter(m => m.tipo === 'salida').reduce((s, m) => s + m.cantidad, 0)
    return { totalStock, lowStock, entradas, salidas }
  }, [productos, movimientos])

  const filtered = useMemo(() => {
    if (!search.trim()) return movimientos
    const q = search.toLowerCase()
    return movimientos.filter(m => m.producto.toLowerCase().includes(q) || m.tipo.includes(q))
  }, [movimientos, search])

  const lowItems = useMemo(
    () => [...productos].filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5),
    [productos]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    const cantidad = parseInt(form.cantidad)
    setMovimientos(prev => [{
      id: Date.now(),
      producto: form.producto,
      tipo: form.tipo,
      cantidad: form.tipo === 'salida' ? cantidad : form.tipo === 'ajuste' ? cantidad : cantidad,
      fecha: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }).replace(',', ''),
      usuario: 'Admin',
    }, ...prev])
    setForm({ producto: '', tipo: 'entrada', cantidad: '' })
    setShowForm(false)
    setSaving(false)
    toast.success(`Movimiento de ${form.tipo} registrado`)
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
              <Input id="s-producto" list="productos-list" value={form.producto} onChange={e => setForm({ ...form, producto: e.target.value })} required className="h-11 rounded-xl" placeholder="Nombre del producto" />
              <datalist id="productos-list">
                {productos.map(p => <option key={p.id} value={p.nombre} />)}
              </datalist>
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
