import { useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Pencil, Trash2, Package, Archive, Search, Plus, DollarSign,
  LayoutGrid, List, AlertTriangle, X, Check, Loader2, ImagePlus, Tag,
  TrendingUp, TrendingDown, BoxIcon
} from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AuroraStatCard } from '../components/ui/aurora-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Separator } from '../components/ui/separator';
import { crearProducto, eliminarProducto, actualizarProducto } from '../services/productoService';
import { crearCategoria } from '../services/categoriaService';
import { subirImagenProducto } from '../services/uploadService';
import { useApp } from '../context/AppContext';
import { useStockStats } from '../hooks/useStockStats';
import { useErrorHandler } from '../hooks/useErrorHandler';

const FORM_DEFAULT = { nombre: '', descripcion: '', precio: '', stock: '', imagenUrl: '', sku: '', stockMinimo: '5', categoriaId: '' };

export default function ProductosPage() {
  const { productos, categorias, loading, recargar } = useApp();
  const stats = useStockStats(productos); // Hook compartido para estadísticas
  const { handleError } = useErrorHandler(); // Hook compartido para manejo de errores
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

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productos;
    const q = searchQuery.toLowerCase();
    return productos.filter(p => p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q));
  }, [productos, searchQuery]);

  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const cancelForm = () => {
    setEditingId(null);
    setFormData(FORM_DEFAULT);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    // Validación antes de enviar
    if (!formData.nombre?.trim()) return toast.error('El nombre del producto es obligatorio');
    if (!formData.precio || parseFloat(formData.precio) <= 0) return toast.error('Ingresa un precio válido mayor a cero');
    if (formData.stock === '' || parseInt(formData.stock) < 0) return toast.error('El stock no puede ser negativo');
    try {
      setSaving(true);
      const payload = {
        nombre:      formData.nombre.trim(),
        descripcion: formData.descripcion || undefined,
        precio:      parseFloat(formData.precio),
        stock:       parseInt(formData.stock),
        sku:         formData.sku         || undefined,
        stockMinimo: formData.stockMinimo ? parseInt(formData.stockMinimo) : 5,
        categoriaId: formData.categoriaId ? parseInt(formData.categoriaId) : undefined,
        imagenUrl:   formData.imagenUrl   || undefined,
      };
      if (editingId) { 
        await actualizarProducto(editingId, payload); 
        toast.success('Producto actualizado correctamente'); 
      }
      else { 
        await crearProducto(payload); 
        toast.success('Producto creado correctamente'); 
      }
      cancelForm();
      recargar();
    } catch (err) {
      handleError(err, {
        operation: editingId ? 'actualizar el producto' : 'crear el producto',
        conflictMsg: 'Ya existe un producto con ese nombre o SKU',
        validationMsg: 'Verifica los datos ingresados e intenta de nuevo',
        forbiddenMsg: 'No tienes permiso para realizar esta acción',
      });
    }
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
    try {
      await eliminarProducto(deleteTarget.id);
      toast.success(`"${deleteTarget.nombre}" eliminado del catálogo`);
      recargar();
    } catch (err) {
      handleError(err, {
        operation: 'eliminar el producto',
        conflictMsg: 'No se puede eliminar porque el producto tiene movimientos de stock asociados',
        forbiddenMsg: 'No tienes permiso para eliminar este producto',
      });
    }
    finally { setDeleteTarget(null); }
  };

  const handleGuardarCategoria = async (e) => {
    e?.preventDefault();
    if (!formCategoria.nombre?.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }
    setSavingCategoria(true);
    try {
      await crearCategoria({ ...formCategoria, nombre: formCategoria.nombre.trim() });
      toast.success(`Categoría "${formCategoria.nombre.trim()}" creada`);
      setFormCategoria({ nombre: '', descripcion: '' });
      setShowFormCategoria(false);
      recargar();
    } catch (err) {
      handleError(err, {
        operation: 'crear la categoría',
        conflictMsg: 'Ya existe una categoría con ese nombre',
      });
    }
    finally { setSavingCategoria(false); }
  };

  return (
    <TooltipProvider>
    <PageLayout
      title="Panel de Inventario"
      subtitle="Administra y controla tu inventario en tiempo real"

      actions={
        <Button onClick={() => { cancelForm(); setShowForm(true); }} className="gap-2 rounded-xl shadow-md">
          <Plus size={16} /> Nuevo Producto
        </Button>
      }
    >
      <div ref={mainRef}>
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
              <Select
                value={formData.categoriaId ? String(formData.categoriaId) : ''}
                onValueChange={v => setFormData(prev => ({ ...prev, categoriaId: v === '__none__' ? '' : v }))}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Sin categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoría</SelectItem>
                  {categorias.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AuroraStatCard icon={Package}       label="Total Productos"      value={stats.totalProductos}          sub="en catálogo"       glow="cyan"    delay={80} />
        <AuroraStatCard icon={Archive}       label="Unidades en Stock"    value={stats.totalStock}               sub="unidades totales"  glow="emerald" delay={160} />
        <AuroraStatCard icon={DollarSign}    label="Valor del Inventario" value={stats.valorTotalInventario}     prefix="$" decimals={2} sub="precio × stock" glow="violet" delay={240} />
        <AuroraStatCard icon={AlertTriangle} label="Stock Bajo"           value={stats.productosStockCritico}    sub="≤ 5 unidades"      glow="amber"   delay={320} />
      </div>

      {/* Contenido principal */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border-muted/50">
                    <Skeleton className="h-44 w-full rounded-none" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                      <Skeleton className="h-3 w-1/2 rounded-lg" />
                      <Skeleton className="h-3 w-full rounded-lg" />
                      <Skeleton className="h-1.5 w-full rounded-full" />
                    </CardContent>
                    <CardFooter className="px-4 py-3">
                      <Skeleton className="h-4 w-16 rounded-lg" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4"><Package size={32} className="text-muted-foreground/50" /></div>
                <h3 className="text-lg font-bold text-foreground mb-1">{searchQuery ? 'Sin resultados' : 'Catálogo vacío'}</h3>
                <p className="text-muted-foreground">{searchQuery ? `No se encontraron productos para "${searchQuery}"` : 'Empieza agregando tu primer producto al inventario.'}</p>
                {!searchQuery && <Button onClick={() => { cancelForm(); setShowForm(true); }} className="mt-6 rounded-xl gap-2"><Plus size={16} /> Agregar Producto</Button>}
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}>
                {filteredProducts.map((prod) => {
                  const isCritical = prod.stock <= (prod.stockMinimo || 5);
                  const stockPct   = prod.stockMinimo
                    ? Math.min(Math.round((prod.stock / (prod.stockMinimo * 4)) * 100), 100)
                    : null;

                  return (
                    <motion.div
                      key={prod.id} layout
                      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                      className="group"
                    >
                      <Card className={`
                        h-full flex flex-col overflow-hidden transition-all duration-200
                        hover:shadow-lg hover:-translate-y-0.5
                        ${isCritical
                          ? 'border-red-500/30 shadow-[0_0_0_1px_rgba(239,68,68,0.15)]'
                          : 'border-muted/50'}
                      `}>

                        {/* ── Imagen / placeholder ── */}
                        {prod.imagenUrl ? (
                          <div className="relative h-44 overflow-hidden bg-muted/30 shrink-0">
                            <img
                              src={prod.imagenUrl}
                              alt={prod.nombre}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Badge stock crítico sobre la imagen */}
                            {isCritical && (
                              <div className="absolute top-2.5 left-2.5">
                                <Badge className="gap-1 border-0 bg-red-500/90 text-white text-[10px] font-bold shadow-md backdrop-blur-sm">
                                  <AlertTriangle size={9} /> Stock crítico
                                </Badge>
                              </div>
                            )}
                            {/* Categoría sobre la imagen */}
                            {prod.categoriaNombre && (
                              <div className="absolute top-2.5 right-2.5">
                                <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
                                  {prod.categoriaNombre}
                                </Badge>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`relative h-28 shrink-0 flex items-center justify-center
                            ${isCritical ? 'bg-red-500/5' : 'bg-muted/20'}`}>
                            <BoxIcon size={36} className={isCritical ? 'text-red-400/40' : 'text-muted-foreground/20'} />
                            {isCritical && (
                              <div className="absolute top-2.5 left-2.5">
                                <Badge className="gap-1 border-0 bg-red-500/90 text-white text-[10px] font-bold">
                                  <AlertTriangle size={9} /> Stock crítico
                                </Badge>
                              </div>
                            )}
                            {prod.categoriaNombre && (
                              <div className="absolute top-2.5 right-2.5">
                                <Badge variant="secondary" className="text-[10px]">
                                  {prod.categoriaNombre}
                                </Badge>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ── Cuerpo ── */}
                        <CardContent className="flex flex-col flex-1 gap-3 p-4">
                          {/* Nombre + SKU */}
                          <div>
                            <h3 className="font-bold text-foreground text-[15px] leading-snug line-clamp-1">
                              {prod.nombre}
                            </h3>
                            {prod.sku && (
                              <span className="text-[11px] font-mono text-muted-foreground/70">
                                {prod.sku}
                              </span>
                            )}
                          </div>

                          {/* Descripción */}
                          {prod.descripcion && (
                            <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-2">
                              {prod.descripcion}
                            </p>
                          )}

                          {/* Stock con barra visual */}
                          <div className="mt-auto space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-medium flex items-center gap-1">
                                <Archive size={11} /> Stock
                              </span>
                              <span className={`font-bold tabular-nums ${isCritical ? 'text-red-500' : 'text-foreground'}`}>
                                {prod.stock} uds
                                {prod.stockMinimo ? (
                                  <span className="text-muted-foreground font-normal"> / mín {prod.stockMinimo}</span>
                                ) : null}
                              </span>
                            </div>
                            {stockPct !== null && (
                              <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCritical ? 'bg-red-500' : stockPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${stockPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </CardContent>

                        {/* ── Footer ── */}
                        <CardFooter className="px-4 py-3 flex items-center justify-between gap-2">
                          <span className="font-bold text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
                            ${prod.precio?.toFixed(2)}
                          </span>

                          <Separator orientation="vertical" className="h-4 opacity-30" />

                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            Valor: ${((prod.precio || 0) * (prod.stock || 0)).toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>

                          <div className="flex items-center gap-1.5 ml-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-8 w-8 rounded-lg hover:bg-muted"
                                  onClick={() => handleEdit(prod)}
                                >
                                  <Pencil size={13} className="text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar producto</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                                  onClick={() => setDeleteTarget(prod)}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar producto</TooltipContent>
                            </Tooltip>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  );
                })}
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleEdit(prod)}><Pencil size={14} className="text-muted-foreground" /></Button>
                              </TooltipTrigger>
                              <TooltipContent>Editar</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-600" onClick={() => setDeleteTarget(prod)}><Trash2 size={14} /></Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar</TooltipContent>
                            </Tooltip>
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
    </PageLayout>
    </TooltipProvider>
  );
}
