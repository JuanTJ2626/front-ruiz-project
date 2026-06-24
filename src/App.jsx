import { useState, useEffect } from 'react';
import './App.css';
import { getProductos, crearProducto, eliminarProducto, actualizarProducto } from './services/productoService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';

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

  const handleDelete = async (id) => {
    if (window.confirm('¿Estas seguro de eliminar este producto?')) {
      try {
        await eliminarProducto(id);
        cargarProductos();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar onLogout={() => setIsAuthenticated(false)} />

      <main className="main-content">
        <div className="container">
          <h1>Proyecto Ruiz API</h1>

          <div className="dashboard-layout">
            <section className="products-section">
              <h2>Inventario de Productos</h2>

              {loading ? (
                <p>Cargando productos...</p>
              ) : productos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(0,0,0,0.02)', borderRadius: 12 }}>
                  <p>No hay productos registrados aun.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {productos.map((prod) => (
                    <div key={prod.id} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 16, border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <strong>{prod.nombre}</strong>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handleEdit(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>✏️</button>
                          <button onClick={() => handleDelete(prod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ef4444' }}>🗑️</button>
                        </div>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{prod.descripcion || 'Sin descripcion'}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <strong style={{ color: '#1E3A8A' }}>${prod.precio?.toFixed(2)}</strong>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Stock: {prod.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside style={{ width: 380 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                    {editingId ? 'Modifica los datos del producto' : 'Registra un nuevo producto'}
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Nombre del producto</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required minLength="2" maxLength="150" placeholder="Ej. Laptop Gaming" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Descripcion</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" maxLength="500" placeholder="Detalles del producto..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', minHeight: 80 }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Precio ($)</label>
                      <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} required min="0.01" step="0.01" placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '0.85rem', color: '#334155' }}>Stock</label>
                      <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" placeholder="0" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '0.95rem' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button type="submit" style={{ flex: 1, padding: '10px 20px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                      {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
                    </button>

                    {editingId && (
                      <button type="button" onClick={() => { setEditingId(null); setFormData({ nombre: '', descripcion: '', precio: '', stock: '' }); }} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
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
    </div>
  );
}

export default App;
