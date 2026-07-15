import { useMemo, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Pencil, Trash2, Package, Archive, Search, Plus, DollarSign,
  LayoutGrid, List, AlertTriangle, X,
} from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { ConfirmarEliminarDialog } from '../components/ui/ConfirmarEliminarDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { AuroraStatCard } from '../components/ui/aurora-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { crearProducto, eliminarProducto, actualizarProducto } from '../services/productoService';
import { crearCategoria } from '../services/categoriaService';
import { useApp } from '../context/AppContext';
import { useStockStats } from '../hooks/useStockStats';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useRol } from '../hooks/useRol';
import { useFormValidation, schemas } from '../hooks/useFormValidation';

// Componentes extraídos
import { ProductoFormSheet } from '../components/productos/ProductoFormSheet';
import { CategoriaFormSheet } from '../components/productos/CategoriaFormSheet';
import { ProductoCard } from '../components/productos/ProductoCard';

const FORM_DEFAULT = { nombre: '', descripcion: '', precio: '', stock: '', imagenUrl: '', sku: '', stockMinimo: '5', categoriaId: '' };

export default function ProductosPage() {
  const { productos, categorias, loading, recargar } = useApp();
  const { isAdmin } = useRol();
  const stats = useStockStats(productos);
  const { handleError } = useErrorHandler();
  const { errors: errProd, validate: validateProd, touchField: touchProd, clearErrors: clearProd } = useFormValidation(schemas.producto);
  const { errors: errCat,  validate: validateCat,  touchField: touchCat                           } = useFormValidation(schemas.categoria);
  const [saving, setSaving]               = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [viewMode, setViewMode]           = useState('grid');
  const [showForm, setShowForm]           = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState(null);
  const [formData, setFormData]           = useState(FORM_DEFAULT);
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
    clearProd();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateProd(formData)) return;
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
    if (!validateCat(formCategoria)) return;
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
        isAdmin && (
          <Button onClick={() => { cancelForm(); setShowForm(true); }} className="gap-2 rounded-xl shadow-md">
            <Plus size={16} /> Nuevo Producto
          </Button>
        )
      }
    >
      <div ref={mainRef}>
        {/* Dialog: confirmar eliminar producto */}
        <ConfirmarEliminarDialog
          open={!!deleteTarget}
          onOpenChange={open => !open && setDeleteTarget(null)}
          icon={<AlertTriangle size={30} className="text-red-600" />}
          title="¿Eliminar producto?"
          description={<>Se eliminará <span className="font-semibold text-foreground">"{deleteTarget?.nombre}"</span> permanentemente.</>}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />

      {/* Sheet formulario producto */}
      <ProductoFormSheet
        open={showForm}
        onOpenChange={(open) => !open && cancelForm()}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={cancelForm}
        errProd={errProd}
        touchProd={touchProd}
        categorias={categorias}
        onOpenCategoriaForm={() => setShowFormCategoria(true)}
      />

      {/* Sheet nueva categoría */}
      <CategoriaFormSheet
        open={showFormCategoria}
        onOpenChange={setShowFormCategoria}
        formCategoria={formCategoria}
        setFormCategoria={setFormCategoria}
        saving={savingCategoria}
        onSubmit={handleGuardarCategoria}
        onCancel={() => setShowFormCategoria(false)}
        errCat={errCat}
        touchCat={touchCat}
      />

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
                {!searchQuery && isAdmin && <Button onClick={() => { cancelForm(); setShowForm(true); }} className="mt-6 rounded-xl gap-2"><Plus size={16} /> Agregar Producto</Button>}
              </div>
            ) : viewMode === 'grid' ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial="hidden" animate="visible"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } }}>
                {filteredProducts.map((prod) => (
                  <ProductoCard
                    key={prod.id}
                    prod={prod}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </motion.div>
            ) : (
              <div className="rounded-xl border border-muted/50 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="font-semibold text-foreground">Producto</TableHead>
                      <TableHead className="font-semibold text-foreground">Categoría / SKU</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Precio</TableHead>
                      <TableHead className="font-semibold text-foreground text-center">Stock</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Valor Total</TableHead>
                      {isAdmin && <TableHead className="font-semibold text-foreground text-right">Acciones</TableHead>}
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
                            {isAdmin && (<>
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
                            </>)}
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
