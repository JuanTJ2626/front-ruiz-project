import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Package, Archive, DollarSign, AlertTriangle, TrendingUp, Clock, Box } from 'lucide-react';
import './Dashboard.css';

const StatCard = ({ icon: Icon, label, value, sub, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
    className="dash-stat"
  >
    <div className="dash-stat-icon" style={{ background: gradient }}>
      <Icon size={20} color="#fff" />
    </div>
    <div>
      <p className="dash-stat-label">{label}</p>
      <motion.p
        className="dash-stat-value"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: delay + 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {value}
      </motion.p>
      {sub && <p className="dash-stat-sub">{sub}</p>}
    </div>
  </motion.div>
);

const StockBar = ({ name, current, max, color }) => {
  const pct = Math.min((current / max) * 100, 100);
  return (
    <motion.div
      className="stock-row"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ x: 4, transition: { duration: 0.15 } }}
    >
      <div className="stock-row-head">
        <span className="stock-row-name">{name}</span>
        <span className="stock-row-pct">{Math.round(pct)}%</span>
      </div>
      <div className="stock-track">
        <motion.div
          className="stock-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: color }}
        />
      </div>
      <span className="stock-row-qty">{current} / {max} uds</span>
    </motion.div>
  );
};

const LowStockItem = ({ name, stock }) => (
  <motion.div
    className="low-item"
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ x: 4, backgroundColor: 'rgba(239, 68, 68, 0.08)', transition: { duration: 0.15 } }}
  >
    <div className="low-icon">
      <AlertTriangle size={14} color="#dc2626" />
    </div>
    <div className="low-info">
      <span className="low-name">{name}</span>
      <span className="low-meta">{stock} unidades</span>
    </div>
    <motion.span
      className="low-badge"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {stock}
    </motion.span>
  </motion.div>
);

const RecentRow = ({ name, price, stock, index }) => (
  <motion.div
    className="recent-row"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.4 + index * 0.05 }}
    whileHover={{ backgroundColor: 'var(--bg-main)', paddingLeft: 8, paddingRight: 8, borderRadius: 10, transition: { duration: 0.15 } }}
  >
    <div className="recent-left">
      <motion.div
        className="recent-icon"
        whileHover={{ scale: 1.1, borderColor: '#6366f1', color: '#6366f1', transition: { duration: 0.15 } }}
      >
        <Box size={14} />
      </motion.div>
      <span className="recent-name">{name}</span>
    </div>
    <div className="recent-right">
      <motion.span
        className="recent-price"
        whileHover={{ scale: 1.05, color: '#059669', transition: { duration: 0.15 } }}
      >
        ${price?.toFixed(2)}
      </motion.span>
      <span className={`recent-stock ${stock <= 5 ? 'recent-low' : 'recent-ok'}`}>{stock} uds</span>
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

  const lowItems = useMemo(() =>
    [...productos].filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock),
  [productos]);

  const recent = useMemo(() =>
    [...productos].slice(-5).reverse(),
  [productos]);

  const topStocked = useMemo(() =>
    [...productos].sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 5),
  [productos]);

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
    <motion.div className="dash-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {/* Header */}
      <div className="dash-head">
        <div>
          <motion.h1 className="dash-title" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {greet()}, Admin
          </motion.h1>
          <motion.p className="dash-date" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
            {today.charAt(0).toUpperCase() + today.slice(1)}
          </motion.p>
        </div>
        <motion.div className="dash-badge" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <TrendingUp size={16} />
          <span>Inventario activo</span>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="dash-grid">
        <StatCard icon={Package} label="Total Productos" value={productos.length} sub="en catálogo" gradient="linear-gradient(135deg, #6366f1, #4f46e5)" delay={0.05} />
        <StatCard icon={Archive} label="Unidades en Stock" value={stats.totalStock.toLocaleString()} sub="unidades totales" gradient="linear-gradient(135deg, #06b6d4, #0891b2)" delay={0.1} />
        <StatCard icon={DollarSign} label="Valor del Inventario" value={`$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} sub="precio × stock" gradient="linear-gradient(135deg, #10b981, #059669)" delay={0.15} />
        <StatCard icon={AlertTriangle} label="Stock Bajo" value={stats.lowStock.length} sub="≤ 5 unidades" gradient="linear-gradient(135deg, #f59e0b, #d97706)" delay={0.2} />
      </div>

      {/* Dos columnas */}
      <div className="dash-cols">
        {/* Stock */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', transition: { duration: 0.2 } }}
        >
          <div className="dash-card-head">
            <h3>Distribución de Stock</h3>
            <span>Productos con mayor inventario</span>
          </div>
          <div className="stock-list">
            {topStocked.map((p, i) => (
              <StockBar key={p.id} name={p.nombre} current={p.stock || 0} max={topStocked[0]?.stock || 100}
                color={['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6'][i]} />
            ))}
          </div>
        </motion.div>

        {/* Alertas */}
        <motion.div
          className="dash-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', transition: { duration: 0.2 } }}
        >
          <div className="dash-card-head">
            <h3>Alertas de Stock Bajo</h3>
            <span>Productos que necesitan reabastecerse</span>
          </div>
          {lowItems.length === 0 ? (
            <div className="dash-empty">
              <Package size={32} color="#94a3b8" />
              <p>Todo en orden, sin stock bajo</p>
            </div>
          ) : (
            <div className="low-list">
              {lowItems.map(p => <LowStockItem key={p.id} name={p.nombre} stock={p.stock} />)}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recientes */}
      <motion.div
        className="dash-card dash-card-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.06)', transition: { duration: 0.2 } }}
      >
        <div className="dash-card-head">
          <div>
            <h3>Productos Recientes</h3>
            <span>Últimos registrados en el catálogo</span>
          </div>
          <div className="dash-total-badge">
            <Clock size={14} />
            {productos.length} total
          </div>
        </div>
        {recent.length === 0 ? (
          <div className="dash-empty">
            <Package size={32} color="#94a3b8" />
            <p>No hay productos registrados</p>
          </div>
        ) : (
          <div className="recent-list">
            {recent.map((p, i) => <RecentRow key={p.id} name={p.nombre} price={p.precio} stock={p.stock} index={i} />)}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
