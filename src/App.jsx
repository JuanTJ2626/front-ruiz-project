import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import { getProductos, crearProducto, eliminarProducto, actualizarProducto } from './services/productoService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import {
  Pencil, Trash2, Package, Tag, Archive, Search,
  Plus, TrendingUp, DollarSign, LayoutGrid, List,
  AlertTriangle, X, Check, Loader2
} from 'lucide-react';

/* ───────────────── Stat Card ───────────────── */
const StatCard = ({ icon: Icon, label, value, sub, bgClass, iconBg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="stat-card"
  >
    <div className="stat-icon" style={{ background: iconBg }}>
      <Icon size={22} color="#fff" />
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </motion.div>
);

/* ───────────────── Delete Modal ───────────────── */
const DeleteModal = ({ product, onConfirm, onCancel }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="modal-backdrop"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="modal-card"
    >
      <div className="modal-icon-wrap">
        <AlertTriangle color="#dc2626" size={28} />
      </div>
      <h3 className="modal-title">¿Eliminar producto?</h3>
      <p className="modal-desc">
        Se eliminará <strong>"{product?.nombre}"</strong> permanentemente. Esta acción no se puede deshacer.
      </p>
      <div className="modal-actions">
        <button onClick={onCancel} className="btn-secondary">Cancelar</button>
        <button onClick={onConfirm} className="btn-danger">Eliminar</button>
      </div>
    </motion.div>
  </motion.div>
);

/* ───────────────── Toast ───────────────── */
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 20, scale: 0.95 }}
    className={`toast ${type === 'success' ? 'toast-success' : 'toast-error'}`}
  >
    <div className={`toast-icon ${type === 'success' ? 'toast-icon-success' : 'toast-icon-error'}`}>
      {type === 'success' ? <Check size={16} /> : <X size={16} />}
    </div>
    <span className="toast-msg">{message}</span>
    <button onClick={onClose} className="toast-close"><X size={14} /></button>
  </motion.div>
);

/* ═════════════════ Main App ═════════════════ */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', stock: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const mainRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (isAuthenticated && mainRef.current && currentPage === 'productos') {
      const ctx = gsap.context(() => {
        gsap.fromTo('.admin-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.stat-card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.15 });
        gsap.fromTo('.content-area', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.4 });
      }, mainRef);
      return () => ctx.revert();
    }
  }, [isAuthenticated, currentPage]);

  useEffect(() => { cargarProductos(); }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const q = searchQuery.toLowerCase();
    return productos.filter(p =>
      p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q)
    );
  }, [productos, searchQuery]);

  const stats = useMemo(() => {
    const totalStock = productos.reduce((s, p) => s + (p.stock || 0), 0);
    const totalValue = productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || 0)), 0);
    const lowStock = productos.filter(p => p.stock <= 5).length;
    return { totalStock, totalValue, lowStock };
  }, [productos]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...formData, precio: parseFloat(formData.precio), stock: parseInt(formData.stock) };
      if (editingId) {
        await actualizarProducto(editingId, payload);
        showToast('Producto actualizado correctamente');
      } else {
        await crearProducto(payload);
        showToast('Producto creado correctamente');
      }
      setFormData({ nombre: '', descripcion: '', precio: '', stock: '' });
      setEditingId(null);
      setShowForm(false);
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar:', error);
      showToast('Error al guardar el producto', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (producto) => {
    setFormData({ nombre: producto.nombre, descripcion: producto.descripcion || '', precio: producto.precio, stock: producto.stock });
    setEditingId(producto.id);
    setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await eliminarProducto(deleteTarget.id);
      showToast('Producto eliminado');
      cargarProductos();
    } catch (error) {
      showToast('Error al eliminar', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const cancelForm = () => {
    setEditingId(null);
    setFormData({ nombre: '', descripcion: '', precio: '', stock: '' });
    setShowForm(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar onLogout={() => setIsAuthenticated(false)} activePage={currentPage} onNavigate={setCurrentPage} />

      <AnimatePresence>
        {deleteTarget && <DeleteModal product={deleteTarget} onConfirm={handleDeleteConfirm} onCancel={() => setDeleteTarget(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <main className="main-content" ref={mainRef}>
        {currentPage === 'dashboard' && <Dashboard productos={productos} />}

        {currentPage === 'productos' && (
        <div className="admin-container">

          {/* ══════ Header ══════ */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Panel de Inventario</h1>
              <p className="admin-subtitle">Administra y controla tu inventario en tiempo real</p>
            </div>
            <button onClick={() => { cancelForm(); setShowForm(true); }} className="btn-primary-lg">
              <Plus size={20} strokeWidth={2.5} />
              Nuevo Producto
            </button>
          </div>

          {/* ══════ Stats ══════ */}
          <div className="stats-grid">
            <StatCard icon={Package} label="Total Productos" value={productos.length} sub="en catálogo" iconBg="linear-gradient(135deg, #6366f1, #4f46e5)" delay={0.05} />
            <StatCard icon={Archive} label="Unidades en Stock" value={stats.totalStock.toLocaleString()} sub="unidades totales" iconBg="linear-gradient(135deg, #8b5cf6, #7c3aed)" delay={0.1} />
            <StatCard icon={DollarSign} label="Valor del Inventario" value={`$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} sub="precio × stock" iconBg="linear-gradient(135deg, #10b981, #059669)" delay={0.15} />
            <StatCard icon={AlertTriangle} label="Stock Bajo" value={stats.lowStock} sub="≤ 5 unidades" iconBg="linear-gradient(135deg, #f59e0b, #d97706)" delay={0.2} />
          </div>

          {/* ══════ Content ══════ */}
          <div className="content-area">
            {/* Toolbar */}
            <div className="toolbar">
              <div className="search-wrap">
                <Search className="search-icon" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="search-clear"><X size={16} /></button>
                )}
              </div>
              <div className="toolbar-right">
                <span className="result-count">{filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}</span>
                <div className="view-toggle">
                  <button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setViewMode('table')} className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}><List size={18} /></button>
                </div>
              </div>
            </div>

            {/* Product Display */}
            {loading ? (
              <div className="empty-state">
                <div className="spinner" />
                <p className="empty-text">Cargando inventario...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <Package size={56} color="#cbd5e1" />
                <p className="empty-title">{searchQuery ? 'Sin resultados' : 'Sin productos'}</p>
                <p className="empty-text">
                  {searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'Empieza agregando tu primer producto'}
                </p>
                {!searchQuery && (
                  <button onClick={() => setShowForm(true)} className="btn-primary" style={{ marginTop: 16 }}>
                    <Plus size={18} /> Agregar Producto
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div
                className="product-grid"
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
              >
                {filteredProducts.map((prod) => (
                  <motion.div
                    key={prod.id}
                    layout
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    className="product-card"
                  >
                    <div className="card-accent" />
                    <div className="card-body">
                      <div className="card-header">
                        <div className="card-info">
                          <h3 className="card-title">{prod.nombre}</h3>
                          <p className="card-desc">{prod.descripcion || 'Sin descripción'}</p>
                        </div>
                        <div className="card-actions">
                          <button onClick={() => handleEdit(prod)} className="card-action-btn edit" title="Editar"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteTarget(prod)} className="card-action-btn delete" title="Eliminar"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="card-footer">
                        <span className="card-price">${prod.precio?.toFixed(2)}</span>
                        <span className={`card-stock ${prod.stock <= 5 ? 'low' : 'ok'}`}>
                          <Archive size={12} />
                          {prod.stock} uds
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Descripción</th>
                      <th className="text-right">Precio</th>
                      <th className="text-center">Stock</th>
                      <th className="text-right">Valor Total</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((prod, i) => (
                      <motion.tr key={prod.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="table-row">
                        <td className="td-name">{prod.nombre}</td>
                        <td className="td-desc">{prod.descripcion || '—'}</td>
                        <td className="td-price">${prod.precio?.toFixed(2)}</td>
                        <td className="td-stock">
                          <span className={`stock-badge ${prod.stock <= 5 ? 'low' : 'ok'}`}>{prod.stock}</span>
                        </td>
                        <td className="td-total">${((prod.precio || 0) * (prod.stock || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="td-actions">
                          <button onClick={() => handleEdit(prod)} className="card-action-btn edit"><Pencil size={14} /></button>
                          <button onClick={() => setDeleteTarget(prod)} className="card-action-btn delete"><Trash2 size={14} /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </div>
        )}
      </main>

      {/* ══════ Slide-over Form ══════ */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="panel-backdrop" onClick={cancelForm} />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="form-panel"
            >
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                  <p className="panel-subtitle">{editingId ? 'Actualiza la información' : 'Agrega al catálogo'}</p>
                </div>
                <button onClick={cancelForm} className="panel-close"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="panel-body">
                <div className="form-group">
                  <label className="form-label">Nombre del producto</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required minLength="2" maxLength="150" placeholder="Ej. Laptop Gaming Pro" className="form-input" autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="4" maxLength="500" placeholder="Detalles y características..." className="form-input form-textarea" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Precio ($)</label>
                    <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} required min="0.01" step="0.01" placeholder="0.00" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" placeholder="0" className="form-input" />
                  </div>
                </div>
              </form>

              <div className="panel-footer">
                <button type="button" onClick={cancelForm} className="btn-secondary">Cancelar</button>
                <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                  {saving ? <Loader2 size={18} className="spin" /> : editingId ? <Check size={18} /> : <Plus size={18} />}
                  {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
