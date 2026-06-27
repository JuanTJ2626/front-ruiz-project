import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Package, Archive, DollarSign, AlertTriangle, TrendingUp, Clock, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';

/* ───── Shadcn Stat Card ───── */
const StatCard = ({ icon: Icon, label, value, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <Card className="h-auto border-muted/40 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 text-foreground shadow-sm">
            <Icon size={24} strokeWidth={1.5} />
          </div>
        </div>
        <div className="mt-auto">
          <p className="text-[13px] font-semibold text-muted-foreground tracking-wide uppercase mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {sub && <p className="text-[13px] font-medium text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const StockBar = ({ name, current, max, color }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <motion.div
      className="flex flex-col gap-2 py-2 px-2 transition-all duration-200 ease-in-out rounded-xl hover:bg-muted/30"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex justify-between items-center text-sm px-1">
        <span className="font-bold text-foreground truncate max-w-[180px]">{name}</span>
        <span className="font-bold text-muted-foreground">{Math.round(pct)}%</span>
      </div>
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: color }}
        />
      </div>
      <span className="text-xs font-semibold text-muted-foreground px-1">{current} / {max} unidades</span>
    </motion.div>
  );
};

const LowStockItem = ({ name, stock }) => (
  <motion.div
    className="flex items-center gap-4 p-3.5 border border-transparent hover:border-red-500/20 transition-all duration-200 ease-in-out rounded-2xl hover:bg-muted/30"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
      <AlertTriangle size={18} className="text-red-600" />
    </div>
    <div className="flex-1 min-w-0">
      <span className="block text-[15px] font-bold text-foreground truncate">{name}</span>
      <span className="block text-xs font-semibold text-red-500 mt-0.5">Atención requerida</span>
    </div>
    <motion.span
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Badge variant="outline" className="text-red-600 border-red-200 bg-white">
        {stock} uds
      </Badge>
    </motion.span>
  </motion.div>
);

const RecentRow = ({ name, price, stock, index }) => (
  <motion.div
    className="flex justify-between items-center py-3.5 px-3 border-b border-border/40 last:border-0 transition-all duration-200 ease-in-out hover:bg-muted/30 rounded-xl"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0 text-muted-foreground shadow-sm">
        <Box size={18} />
      </div>
      <div>
        <span className="block text-[15px] font-bold text-foreground truncate">{name}</span>
        <span className="block text-xs font-semibold text-muted-foreground mt-0.5">Añadido recientemente</span>
      </div>
    </div>
    <div className="flex items-center gap-4 shrink-0">
      <span className="text-[15px] font-bold text-emerald-600">
        ${price?.toFixed(2)}
      </span>
      <Badge variant={stock <= 5 ? "destructive" : "secondary"} className={stock <= 5 ? "bg-red-100 text-red-700 hover:bg-red-100" : ""}>
        {stock} uds
      </Badge>
    </div>
  </motion.div>
);

const Dashboard = ({ productos }) => {
  const stats = useMemo(() => {
    const totalStock = productos.reduce((s, p) => s + (p.stock || 0), 0);
    const totalValue = productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || 0)), 0);
    const lowStock = productos.filter(p => p.stock <= 5);
    return { totalStock, totalValue, lowStock };
  }, [productos]);

  const lowItems = useMemo(() => [...productos].filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock), [productos]);
  const recent = useMemo(() => [...productos].slice(-5).reverse(), [productos]);
  const topStocked = useMemo(() => [...productos].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 5), [productos]);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <motion.div className="p-8 lg:p-10 max-w-[1400px] mx-auto font-sans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <motion.h1 
            className="text-3xl font-bold tracking-tight text-foreground m-0" 
            style={{ fontFamily: "'Outfit', sans-serif" }}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          >
            {greet()}, Admin
          </motion.h1>
          <motion.p 
            className="text-[15px] font-medium text-muted-foreground capitalize mt-1" 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            {today}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Badge variant="outline" className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border-emerald-200 text-sm gap-2">
            <TrendingUp size={16} strokeWidth={2.5} />
            Sistema Activo
          </Badge>
        </motion.div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Total Productos" value={productos.length} sub="en catálogo" delay={0.1} />
        <StatCard icon={Archive} label="Stock Total" value={stats.totalStock.toLocaleString()} sub="unidades" delay={0.2} />
        <StatCard icon={DollarSign} label="Valor Global" value={`$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} sub="precio × stock" delay={0.3} />
        <StatCard icon={AlertTriangle} label="Stock Crítico" value={stats.lowStock.length} sub="≤ 5 unidades" delay={0.4} />
      </div>

      {/* ── Shadcn Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Top Stock */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
          <Card className="h-auto border-muted/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Distribución de Stock</CardTitle>
              <CardDescription>Productos con mayor inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {topStocked.map((p, i) => (
                  <StockBar key={p.id} name={p.nombre} current={p.stock || 0} max={topStocked[0]?.stock || 100}
                    color={['#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'][i]} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
          <Card className="h-auto border-muted/40 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Alertas de Stock</CardTitle>
              <CardDescription>Requieren atención inmediata</CardDescription>
            </CardHeader>
            <CardContent>
              {lowItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-2 border border-emerald-100 shadow-sm">
                    <Package size={28} className="text-emerald-500" />
                  </div>
                  <p className="font-bold text-foreground">Inventario Saludable</p>
                  <p className="text-sm font-medium text-muted-foreground">Todos los productos tienen stock suficiente.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {lowItems.map(p => <LowStockItem key={p.id} name={p.nombre} stock={p.stock} />)}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Products */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
        <Card className="h-auto border-muted/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">Actividad Reciente</CardTitle>
              <CardDescription>Últimos productos registrados</CardDescription>
            </div>
            <Badge variant="outline" className="gap-2 px-3 py-1 bg-background">
              <Clock size={14} className="text-muted-foreground" /> {productos.length} en total
            </Badge>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-background border border-border/50 flex items-center justify-center mb-4 shadow-sm">
                  <Package size={28} className="text-muted-foreground" />
                </div>
                <p className="font-bold text-foreground">Sin productos</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">No hay actividad reciente en el catálogo.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {recent.map((p, i) => <RecentRow key={p.id} name={p.nombre} price={p.precio} stock={p.stock} index={i} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
