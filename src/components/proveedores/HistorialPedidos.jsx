import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { History, ChevronUp, ChevronDown, Search, Package, CheckCircle2, XCircle, CalendarDays } from 'lucide-react'
import { AuroraCard } from '#/components/ui/aurora-card'
import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import { Separator } from '#/components/ui/separator'

export const HistorialPedidos = ({ pedidos }) => {
  const [abierto, setAbierto] = useState(false)
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos
    if (filtroEstado !== 'TODOS') lista = lista.filter(p => p.estado === filtroEstado)
    if (filtroBusqueda.trim()) {
      const q = filtroBusqueda.toLowerCase()
      lista = lista.filter(p =>
        p.descripcion?.toLowerCase().includes(q) ||
        p.proveedorNombre?.toLowerCase().includes(q) ||
        p.productoNombre?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [pedidos, filtroEstado, filtroBusqueda])

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
    >
      <AuroraCard glow="violet">
        <div className="p-6">
          <button
            onClick={() => setAbierto(v => !v)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <History size={18} className="text-violet-400" />
              <div>
                <h2 className="font-heading text-lg font-bold text-foreground">Historial de Pedidos</h2>
                <p className="text-sm text-muted-foreground">
                  {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} completados o cancelados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-400">
                {pedidos.filter(p => p.estado === 'RECIBIDO').length} recibidos · {pedidos.filter(p => p.estado === 'CANCELADO').length} cancelados
              </Badge>
              {abierto ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
          </button>

          {abierto && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mt-5 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                  <Input
                    value={filtroBusqueda}
                    onChange={e => setFiltroBusqueda(e.target.value)}
                    placeholder="Buscar pedido..."
                    className="h-9 rounded-xl pl-9 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {['TODOS', 'RECIBIDO', 'CANCELADO'].map(estado => (
                    <button
                      key={estado}
                      onClick={() => setFiltroEstado(estado)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        filtroEstado === estado
                          ? estado === 'RECIBIDO'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : estado === 'CANCELADO'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                          : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {estado === 'TODOS' && <Package size={11} />}
                      {estado === 'RECIBIDO' && <CheckCircle2 size={11} />}
                      {estado === 'CANCELADO' && <XCircle size={11} />}
                      {estado === 'TODOS'
                        ? `Todos (${pedidos.length})`
                        : estado === 'RECIBIDO'
                        ? `Recibidos (${pedidos.filter(p => p.estado === 'RECIBIDO').length})`
                        : `Cancelados (${pedidos.filter(p => p.estado === 'CANCELADO').length})`}
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="my-4 opacity-20" />

              {pedidosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Package size={30} className="mb-3 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground">Sin resultados</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                  {pedidosFiltrados.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">{p.descripcion}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.proveedorNombre} · {p.cantidad} {p.cantidad === 1 ? 'unidad' : 'unidades'}
                          {p.precioUnitario ? ` · $${Number(p.precioUnitario).toFixed(2)} c/u` : ''}
                          {p.precioUnitario && p.cantidad ? ` · Total: $${(Number(p.precioUnitario) * p.cantidad).toFixed(2)}` : ''}
                        </p>
                        {p.productoNombre && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground/70 mt-0.5">
                            <Package size={10} /> {p.productoNombre}
                          </p>
                        )}
                        {p.fechaEsperada && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground/60 mt-0.5">
                            <CalendarDays size={10} /> Esperado: {new Date(p.fechaEsperada).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] font-bold ${
                          p.estado === 'RECIBIDO'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-red-500/30 bg-red-500/10 text-red-400'
                        }`}
                      >
                        {p.estado === 'RECIBIDO'
                          ? <span className="flex items-center gap-1"><CheckCircle2 size={10} /> RECIBIDO</span>
                          : <span className="flex items-center gap-1"><XCircle size={10} /> CANCELADO</span>}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </AuroraCard>
    </motion.div>
  )
}
