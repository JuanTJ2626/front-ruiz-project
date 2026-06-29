import { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import gsap from 'gsap';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import {
  Pencil, Trash2, Package, Archive, Search, Plus, DollarSign,
  LayoutGrid, List, AlertTriangle, X, Check, Loader2, ImagePlus, Tag
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { AuroraStatCard } from './ui/aurora-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Skeleton } from './ui/skeleton';
import { crearProducto, eliminarProducto, actualizarProducto } from '../services/productoService';
import { crearCategoria } from '../services/categoriaService';
import { subirImagenProducto } from '../services/uploadService';
import { useApp } from '../context/AppContext';

const FORM_DEFAULT = { nombre: '', descripcion: '', precio: '', stock: '', imagenUrl: '', sku: '', stockMinimo: '5', categoriaId: '' };

export default function ProductosPage() {
  const { productos, categorias, loading, recargar } = useApp();
  const [saving, setSaving]               = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [viewMode, setViewMode]           = useState('grid');
  const [showForm, setShowForm]           = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [formData, setFormData]           = useState(FORM_DEFAULT);
  const [uploadingImg, setUploadingImg]   = useState(false);
  const [showFormCategoria, setShowFormCategoria] = useState(false);
  const [savingCategoria, setSavingCategoria]     = useState(false);
  const [formCategoria, setFormCategoria]         = useState({ nombre: '', descripcion: '' });
  const [editingId, setEditingId]         = useState(null);
  const mainRef  = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (mainRef.current && location.pathname === '/productos') {
      const ctx = gsap.context(() => {
        gsap.fromTo('.admin-header', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
        gsap.fromTo('.content-area', { y: 50,  opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2 });
      }, mainRef);
      return () => ctx.revert();
    }
  }, [location.pathname]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const q = searchQuery.toLowerCase();
    return productos.filter(p => p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
  }, [productos, searchQuery]);

  const stats = useMemo(() => ({
    totalStock: productos.reduce((s, p) => s + (p.stock || 0), 0),
    totalValue: productos.reduce((s, p) => s + ((p.precio || 0) * (p.stock || 0)), 0),
    lowStock:   productos.filter(p => p.stock <= 5).length,
  }), [productos]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const cancelForm = () => {
    setEditingId(null);
    setFormData(FORM_DEFAULT);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      const payload = {
        nombre:      formData.nombre,
        descripcion: formData.descripcion || undefined,
        precio:      parseFloat(formData.precio),
        stock:       parseInt(formData.stock),
        sku:         formData.sku         || undefined,
        stockMinimo: formData.stockMinimo ? parseInt(formData.stockMinimo) : 5,
        categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : undefined,
        imagenUrl:   formData.imagenUrl   || undefined,
      };
      if (editingId) { await actualizarProducto(editingId, payload); toast.success('Producto actualizado'); }
      else           { await crearProducto(payload);                  toast.success('Producto creado'); }
      cancelForm();
      recargar(); // <-- sincroniza todos los dashboards
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleEdit = (p) => {
    setFormData({ nombre: p.nombre, descripcion: p.descripcion || '', precio: p.precio,
      stock: p.stock, imagenUrl: p.imagenUrl || '', sku: p.sku || '',
      stockMinimo: p.stockMinimo ?? 5, categoriaId: p.categoriaId || '' });
    setEditingId(p.id); setShowForm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await eliminarProducto(deleteTarget.id); toast.success('Producto eliminado'); recargar(); }
    catch { toast.error('Error al eliminar'); }
    finally { setDeleteTarget(null); }
  };

  const handleGuardarCategoria = async (e) => {
    e?.preventDefault(); setSavingCategoria(true);
    try {
      await crearCategoria(formCategoria);
      toast.success('Categoría creada');
      setFormCategoria({ nombre: '', descripcion: '' });
      setShowFormCategoria(false);
      recargar();
    } catch (err) { toast.error(err.message || 'Error al crear categoría'); }
    finally { setSavingCategoria(false); }
  };

  return (
    <div ref={mainRef} className="dashboard-aurora-bg relative min-h-screen p-6 lg:p-10">
      {/* Dialogo eliminar */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm rounded-[24px] p-6">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle size={30} className="text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">¿Eliminar producto?</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Se eliminará <span className="font-semibold text-foreground">"{deleteTarget?.nombre}"</span> permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-0 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDeleteConfirm}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet formulario producto */}
      <Sheet open={showForm} onOpenChange={(open) => !open && cancelForm()}>
        <SheetContent side="right" className="w-[480px] max-w-full flex flex-col p-0 gap-0 border-l">
          <SheetHeader className="px-8 py-6 border-b shrink-0 bg-muted/20">
            <SheetTitle className="text-xl font-bold">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</SheetTitle>
            <SheetDescription>{editingId ? 'Actualiza la información del producto.' : 'Agrega un nuevo producto al catálogo.'}</SheetDescription>
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Imagen del producto</Label>
              <div className="flex items-center gap-3">
                {formData.imagenUrl && <img src={formData.imagenUrl} alt="producto" className="h-14 w-14 rounded-xl object-cover border border-muted/50" />}
                <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-muted/50 bg-muted/10 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/20 ${uploadingImg ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  {uploadingImg ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
                  {uploadingImg ? 'Subiendo...' : formData.imagenUrl ? 'Cambiar imagen' : 'Subir imagen'}
                  <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" disabled={uploadingImg}
                    onChange={async (e) => {
                      const archivo = e.target.files?.[0]; if (!archivo) return;
                      if (archivo.size > 5 * 1024 * 1024) { toast.error('La imagen no puede superar 5MB'); return; }
                      setUploadingImg(true);
                      try { const { url } = await subirImagenProducto(archivo); setFormData(f => ({ ...f, imagenUrl: url })); toast.success('Imagen subida'); }
                      catch (err) { toast.error(err.message || 'Error al subir imagen'); }
                      finally { setUploadingImg(false); }
                    }} />
                </label>
                {formData.imagenUrl && <button type="button" onClick={() => setFormData(f => ({...f, imagenUrl: ''}))} className="text-xs text-muted-foreground hover:text-destructive"><X size={14} /></button>}
              </div>
              <p className="text-[11px] text-muted-foreground">JPG, PNG, GIF o WebP · Máx 5MB</p>
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
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="sh-sku" className="text-sm font-semibold">SKU <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <Input id="sh-sku" name="sku" value={formData.sku} onChange={handleInputChange} className="h-11 rounded-xl" placeholder="Ej. PROD-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sh-stockmin" className="text-sm font-semibold">Stock Mínimo</Label>
                <Input id="sh-stockmin" type="number" name="stockMinimo" value={formData.stockMinimo} onChange={handleInputChange} min="0" className="h-11 rounded-xl" placeholder="5" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Categoría <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <button type="button" onClick={() => setShowFormCategoria(true)} className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-600 transition-colors">
                  <Tag size={12} /> Nueva categoría
                </button>
              </div>
              <select name="categoriaId" value={formData.categoriaId} onChange={handleInputChange}
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground">
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
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

      {/* Sheet nueva categoría */}
      <Sheet open={showFormCategoria} onOpenChange={setShowFormCategoria}>
        <SheetContent side="right" className="w-[380px] max-w-full flex flex-col p-0 gap-0 border-l">
          <SheetHeader className="px-8 py-6 border-b shrink-0 bg-muted/20">
            <SheetTitle className="text-xl font-bold">Nueva Categoría</SheetTitle>
            <SheetDescription>Organiza tus productos por categoría.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleGuardarCategoria} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Nombre *</Label>
              <Input value={formCategoria.nombre} onChange={e => setFormCategoria(f => ({...f, nombre: e.target.value}))} required className="h-11 rounded-xl" placeholder="Ej. Bebidas, Herramientas..." autoFocus />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <Input value={formCategoria.descripcion} onChange={e => setFormCategoria(f => ({...f, descripcion: e.target.value}))} className="h-11 rounded-xl" placeholder="Descripción de la categoría" />
            </div>
          </form>
          <div className="px-8 py-5 border-t flex justify-end gap-3 shrink-0 bg-muted/20">
            <Button variant="outline" onClick={() => setShowFormCategoria(false)} className="rounded-xl h-11 px-6">Cancelar</Button>
            <Button onClick={handleGuardarCategoria} disabled={savingCategoria} className="rounded-xl h-11 px-8 gap-2 shadow-md">
              {savingCategoria ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {savingCategoria ? 'Guardando...' : 'Crear categoría'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Contenido principal */}
      <div className="admin-header relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Panel de Inventario</h1>
          <p className="text-muted-foreground mt-1 text-[15px]">Administra y controla tu inventario en tiempo real</p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(true); }} className="rounded-xl h-11 px-6 gap-2 shadow-md font-semibold text-[15px]">
          <Plus size={18} strokeWidth={2.5} /> Nuevo Producto
        </Button>
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AuroraStatCard icon={Package}       label="Total Productos"      value={productos.length}   sub="en catálogo"       glow="cyan"    delay={80} />
        <AuroraStatCard icon={Archive}       label="Unidades en Stock"    value={stats.totalStock}   sub="unidades totales"  glow="emerald" delay={160} />
        <AuroraStatCard icon={DollarSign}    label="Valor del Inventario" value={stats.totalValue}   prefix="$" decimals={2} sub="precio × stock" glow="violet" delay={240} />
        <AuroraStatCard icon={AlertTriangle} label="Stock Bajo"           value={stats.lowStock}     sub="≤ 5 unidades"      glow="amber"   delay={320} />
      </div>

      <div className="content-area relative z-10">
        <Card className="border-muted/40 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-muted/40 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..." className="pl-9 pr-9 h-10 rounded-xl bg-background" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-sm font-medium text-muted-foreground">{filteredProducts.length} resultado{filteredProducts.length !== 1 ? 's' : ''}</span>
              <div className="flex bg-muted/40 p-1 rounded-lg border border-border/50">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><LayoutGrid size={16} /></button>
                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}><List size={16} /></button>
              </div>
            </div>
          </div>

          <div className="p-6 bg-background">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => <div key={i}><Skeleton className="h-[140px] w-full rounded-2xl" /></div>)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4"><Package size={32} className="text-muted-foreground/50" /></div>
                <h3 className="text-lg font-bold text-foreground mb-1">{searchQuery ? 'Sin resultados' : 'Catálogo vacío'}</h3>
                <p className="text-muted-foreground">{searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'Empieza agregando tu primer producto al inventario.'}</p>
                {!searchQuery && <Button onClick={() => { cancelForm(); setShowForm(true); }} className="mt-6 rounded-xl gap-2"><Plus size={16} /> Agregar Producto</Button>}
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}>
                {filteredProducts.map((prod) => (
                  <motion.div key={prod.id} layout variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }} className="group relative">
                    <Card className="h-full border-muted/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">
                      <CardContent className="p-5 flex flex-col h-full">
                        {prod.imagenUrl && <div className="mb-3 -mx-5 -mt-5 h-36 overflow-hidden"><img src={prod.imagenUrl} alt={prod.nombre} className="h-full w-full object-cover" /></div>}
                        <div className="flex justify-between items-start gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground truncate text-base">{prod.nombre}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{prod.descripcion || 'Sin descripción'}</p>
                            {(prod.sku || prod.categoriaNombre) && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {prod.sku && <span className="text-[10px] font-mono bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">{prod.sku}</span>}
                                {prod.categoriaNombre && <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded">{prod.categoriaNombre}</span>}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(prod)}><Pencil size={14} /></Button>
                            <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200" onClick={() => setDeleteTarget(prod)}><Trash2 size={14} /></Button>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 flex justify-between items-center">
                          <span className="font-bold text-lg text-emerald-600 dark:text-emerald-500">${prod.precio?.toFixed(2)}</span>
                          <div className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 ${prod.stock <= 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                            <Archive size={12} />{prod.stock} uds
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
                      <TableHead className="font-semibold text-foreground">Categoría / SKU</TableHead>
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
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            {prod.categoriaNombre && <span className="text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded w-fit">{prod.categoriaNombre}</span>}
                            {prod.sku ? <span className="text-xs font-mono text-muted-foreground">{prod.sku}</span> : <span className="text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-emerald-600 font-semibold text-right">${prod.precio?.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${prod.stock <= (prod.stockMinimo || 5) ? 'bg-red-100 text-red-700' : 'bg-muted text-muted-foreground'}`}>{prod.stock}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium">${((prod.precio || 0) * (prod.stock || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(prod)}><Pencil size={14} className="text-muted-foreground" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600" onClick={() => setDeleteTarget(prod)}><Trash2 size={14} /></Button>
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
  );
}
