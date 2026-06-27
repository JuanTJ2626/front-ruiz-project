import { useState, useEffect, useRef, useMemo } from 'react';
import './App.css';
import { getProductos, crearProducto, eliminarProducto, actualizarProducto } from './services/productoService';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { toast } from 'sonner';

import { Toaster } from './components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './components/ui/sheet';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Textarea } from './components/ui/textarea';
import { Card, CardContent } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { Skeleton } from './components/ui/skeleton';

import {
  Pencil, Trash2, Package, Archive, Search,
  Plus, DollarSign, LayoutGrid, List,
  AlertTriangle, X, Check, Loader2
} from 'lucide-react';

/* ───────────────── Stat Card ───────────────── */
const StatCard = ({ icon: Icon, label, value, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="h-auto border-muted/40 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      <CardContent className="p-6 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/50 text-foreground shadow-sm">
            <Icon size={22} strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
      </CardContent>
    </Card>
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
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', stock: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const mainRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && mainRef.current && currentPage === 'productos') {
      const ctx = gsap.context(() => {
        gsap.fromTo('.admin-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.content-area', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2 });
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
        toast.success('Producto actualizado correctamente');
      } else {
        await crearProducto(payload);
        toast.success('Producto creado correctamente');
      }
      setFormData({ nombre: '', descripcion: '', precio: '', stock: '' });
      setEditingId(null);
      setShowForm(false);
      cargarProductos();
    } catch (error) {
      console.error('Error al guardar:', error);
      toast.error('Error al guardar el producto');
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
      toast.success('Producto eliminado');
      cargarProductos();
    } catch (error) {
      toast.error('Error al eliminar');
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
    return (
      <>
        <Toaster position="top-right" richColors />
        <Login onLogin={() => setIsAuthenticated(true)} />
      </>
    );
  }

  return (
    <div className="app-layout">
      {/* ── Toasts ── */}
      <Toaster position="bottom-right" richColors />

      <Sidebar onLogout={() => setIsAuthenticated(false)} activePage={currentPage} onNavigate={setCurrentPage} />

      {/* ── Dialog Shadcn ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-[24px] p-6">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={30} className="text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">¿Eliminar producto?</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Se eliminará <span className="font-semibold text-foreground">"{deleteTarget?.nombre}"</span> permanentemente. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDeleteConfirm}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Sheet Shadcn ── */}
      <Sheet open={showForm} onOpenChange={(open) => !open && cancelForm()}>
        <SheetContent side="right" className="w-[480px] max-w-full flex flex-col p-0 gap-0 border-l">
          <SheetHeader className="px-8 py-6 border-b shrink-0 bg-muted/20">
            <SheetTitle className="text-xl font-bold">
              {editingId ? 'Editar Producto' : 'Nuevo Producto'}
            </SheetTitle>
            <SheetDescription className="text-[15px]">
              {editingId ? 'Actualiza la información del producto.' : 'Agrega un nuevo producto al catálogo.'}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="sh-nombre" className="text-sm font-semibold">Nombre del producto</Label>
              <Input id="sh-nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required autoFocus className="h-11 rounded-xl" placeholder="Ej. Laptop Gaming Pro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sh-desc" className="text-sm font-semibold">Descripción</Label>
              <Textarea id="sh-desc" name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows={4} className="resize-none rounded-xl" placeholder="Detalles y características..." />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="sh-precio" className="text-sm font-semibold">Precio ($)</Label>
                <Input id="sh-precio" type="number" name="precio" value={formData.precio} onChange={handleInputChange} required min="0.01" step="0.01" className="h-11 rounded-xl" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sh-stock" className="text-sm font-semibold">Stock Inicial</Label>
                <Input id="sh-stock" type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" className="h-11 rounded-xl" placeholder="0" />
              </div>
            </div>
          </form>
          
          <div className="px-8 py-5 border-t flex justify-end gap-3 shrink-0 bg-muted/20">
            <Button type="button" variant="outline" onClick={cancelForm} className="rounded-xl h-11 px-6">Cancelar</Button>
            <Button onClick={handleSubmit} disabled={saving} className="rounded-xl h-11 px-8 gap-2 shadow-md">
              {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Check size={16} /> : <Plus size={16} />}
              {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="main-content" ref={mainRef}>
        {currentPage === 'dashboard' && <Dashboard productos={productos} />}

        {currentPage === 'productos' && (
        <div className="admin-container">

          {/* ══════ Header ══════ */}
          <div className="admin-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Inventario</h1>
              <p className="text-muted-foreground mt-1 text-[15px]">Administra y controla tu inventario en tiempo real</p>
            </div>
            <Button onClick={() => { cancelForm(); setShowForm(true); }} className="rounded-xl h-11 px-6 gap-2 shadow-md font-semibold text-[15px]">
              <Plus size={18} strokeWidth={2.5} />
              Nuevo Producto
            </Button>
          </div>

          {/* ══════ Stats ══════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Package} label="Total Productos" value={productos.length} sub="en catálogo" delay={0.05} />
            <StatCard icon={Archive} label="Unidades en Stock" value={stats.totalStock.toLocaleString()} sub="unidades totales" delay={0.1} />
            <StatCard icon={DollarSign} label="Valor del Inventario" value={`$${stats.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} sub="precio × stock" delay={0.15} />
            <StatCard icon={AlertTriangle} label="Stock Bajo" value={stats.lowStock} sub="≤ 5 unidades" delay={0.2} />
          </div>

          {/* ══════ Content ══════ */}
          <div className="content-area">
            <Card className="border-muted/40 shadow-sm rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-muted/40 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="pl-9 pr-9 h-10 rounded-xl bg-background"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-medium text-muted-foreground">
                    {filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex bg-muted/40 p-1 rounded-lg border border-border/50">
                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid size={16} /></button>
                    <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><List size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Product Display */}
              <div className="p-6 bg-background">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <Skeleton className="h-[140px] w-full rounded-2xl" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                      <Package size={32} className="text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{searchQuery ? 'Sin resultados' : 'Catálogo vacío'}</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'Empieza agregando tu primer producto al inventario.'}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setShowForm(true)} className="mt-6 rounded-xl gap-2">
                        <Plus size={16} /> Agregar Producto
                      </Button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden" animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                  >
                    {filteredProducts.map((prod) => (
                      <motion.div
                        key={prod.id}
                        layout
                        variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
                        className="group relative"
                      >
                        <Card className="h-full border-muted/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">
                          <CardContent className="p-5 flex flex-col h-full">
                            <div className="flex justify-between items-start gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground truncate text-base">{prod.nombre}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prod.descripcion || 'Sin descripción'}</p>
                              </div>
                              <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(prod)}>
                                  <Pencil size={14} />
                                </Button>
                                <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" onClick={() => setDeleteTarget(prod)}>
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-auto pt-4 flex justify-between items-center">
                              <span className="font-bold text-lg text-emerald-600 dark:text-emerald-500">${prod.precio?.toFixed(2)}</span>
                              <div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${prod.stock <= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                <Archive size={12} />
                                {prod.stock} uds
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="rounded-xl border border-muted/50 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="font-semibold text-foreground">Producto</TableHead>
                          <TableHead className="font-semibold text-foreground">Descripción</TableHead>
                          <TableHead className="font-semibold text-foreground text-right">Precio</TableHead>
                          <TableHead className="font-semibold text-foreground text-center">Stock</TableHead>
                          <TableHead className="font-semibold text-foreground text-right">Valor Total</TableHead>
                          <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((prod) => (
                          <TableRow key={prod.id} className="hover:bg-muted/10 transition-colors">
                            <TableCell className="font-bold text-foreground">{prod.nombre}</TableCell>
                            <TableCell className="text-muted-foreground truncate max-w-[200px]">{prod.descripcion || '—'}</TableCell>
                            <TableCell className="text-emerald-600 font-semibold text-right">${prod.precio?.toFixed(2)}</TableCell>
                            <TableCell className="text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${prod.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>
                                {prod.stock}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium">${((prod.precio || 0) * (prod.stock || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(prod)}>
                                  <Pencil size={14} className="text-muted-foreground" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600" onClick={() => setDeleteTarget(prod)}>
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}

export default App;
