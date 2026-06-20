import { useState, useEffect } from 'react';
import './App.css';
import { getProductos, crearProducto, eliminarProducto, actualizarProducto } from './services/api';
import Login from './components/Login';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    cargarProductos();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock)
      };

      if (editingId) {
        await actualizarProducto(editingId, payload);
      } else {
        await crearProducto(payload);
      }
      
      setFormData({ nombre: '', descripcion: '', precio: '', stock: '' });
      setEditingId(null);
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleEdit = (producto) => {
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock
    });
    setEditingId(producto.id);
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rx = ((y - centerY) / centerY) * -6;
    const ry = ((x - centerX) / centerX) * 6;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await eliminarProducto(id);
        cargarProductos();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const totalProductos = productos.length;
  const totalValor = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);
  const totalStock = productos.reduce((sum, p) => sum + p.stock, 0);

  const getStockBadge = (stock) => {
    if (stock > 20) return { label: 'Disponible', className: 'badge-success' };
    if (stock > 5) return { label: 'Stock medio', className: 'badge-warning' };
    if (stock > 0) return { label: 'Pocas unidades', className: 'badge-danger' };
    return { label: 'Agotado', className: 'badge-danger' };
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <div>
              <h1 className="header-title">Proyecto Ruiz</h1>
              <p className="header-subtitle">Sistema de Gestión de Inventario</p>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={() => setIsAuthenticated(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </div>
      </header>

      <div className="aurora-orbs" aria-hidden="true">
        <div className="aurora-orb" />
        <div className="aurora-orb" />
        <div className="aurora-orb" />
        <div className="aurora-orb" />
      </div>

      <main className="main-content">
        <div className="container">
          {!loading && productos.length > 0 && (
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <div>
                  <p className="stat-value">{totalProductos}</p>
                  <p className="stat-label">Productos</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                  </svg>
                </div>
                <div>
                  <p className="stat-value">${totalValor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <p className="stat-label">Valor total</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div>
                  <p className="stat-value">{totalStock.toLocaleString()}</p>
                  <p className="stat-label">Unidades en stock</p>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-layout">
            <section className="products-section">
              <div className="section-header">
                <h2 className="section-title">Inventario de Productos</h2>
                {!loading && productos.length > 0 && (
                  <span className="product-count">{productos.length} registros</span>
                )}
              </div>

              {loading ? (
                <div className="skeleton-grid">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="skeleton-card">
                      <div className="skeleton-line skeleton-title" />
                      <div className="skeleton-line skeleton-desc" />
                      <div className="skeleton-line skeleton-desc short" />
                      <div className="skeleton-row">
                        <div className="skeleton-line skeleton-price" />
                        <div className="skeleton-line skeleton-badge" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : productos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18" />
                      <path d="M16 10a4 4 0 01-8 0" />
                    </svg>
                  </div>
                  <h3 className="empty-title">No hay productos registrados aún</h3>
                  <p className="empty-desc">Comienza agregando tu primer producto al inventario.</p>
                </div>
              ) : (
                <div className="product-grid">
                  {productos.map((prod, index) => (
                    <div
                      key={prod.id}
                      className="product-card animate-fade-in"
                      style={{ animationDelay: `${index * 0.08}s` }}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="product-card-top">
                        <div className="product-info">
                          <h3 className="product-title">{prod.nombre}</h3>
                          <p className="product-category">{prod.descripcion || 'Sin descripción'}</p>
                        </div>
                        <div className="card-actions">
                          <button className="btn-icon" onClick={() => handleEdit(prod)} title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(prod.id)} title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="product-details">
                        <div className="product-price">
                          <span className="price-currency">$</span>
                          {prod.precio?.toFixed(2)}
                        </div>
                        <div className="product-meta">
                          <span className={`badge ${getStockBadge(prod.stock).className}`}>
                            <span className={`stock-dot ${prod.stock > 0 ? 'dot-green' : 'dot-red'}`} />
                            {getStockBadge(prod.stock).label}
                          </span>
                          <span className="stock-qty">{prod.stock} uds.</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="form-section">
              <div className="form-card">
                <div className="form-header">
                  <div className="form-icon">
                    {editingId ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="form-title">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                    <p className="form-subtitle">
                      {editingId ? 'Modifica los datos del producto' : 'Registra un nuevo producto'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Nombre del producto</label>
                    <div className="input-wrapper">
                      <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        name="nombre"
                        className="form-input has-icon"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                        minLength="2"
                        maxLength="150"
                        placeholder="Ej. Laptop Gaming"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Descripción</label>
                    <div className="input-wrapper">
                      <svg className="input-icon input-icon-top" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <textarea
                        name="descripcion"
                        className="form-input has-icon"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        rows="3"
                        maxLength="500"
                        placeholder="Detalles del producto..."
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Precio ($)</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                        </svg>
                        <input
                          type="number"
                          name="precio"
                          className="form-input has-icon"
                          value={formData.precio}
                          onChange={handleInputChange}
                          required
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Stock</label>
                      <div className="input-wrapper">
                        <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <input
                          type="number"
                          name="stock"
                          className="form-input has-icon"
                          value={formData.stock}
                          onChange={handleInputChange}
                          required
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editingId ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                          </svg>
                          Actualizar Producto
                        </>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Guardar Producto
                        </>
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setEditingId(null);
                          setFormData({ nombre: '', descripcion: '', precio: '', stock: '' });
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
