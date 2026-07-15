import { useState } from 'react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Textarea } from '#/components/ui/textarea'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { FieldInput, FieldError } from '#/components/ui/field-error'
import { Loader2, Check, Plus, ImagePlus, X, Tag } from 'lucide-react'
import { subirImagenProducto } from '#/services/uploadService'

export const ProductoFormSheet = ({
  open,
  onOpenChange,
  editingId,
  formData,
  setFormData,
  handleInputChange,
  saving,
  onSubmit,
  onCancel,
  errProd,
  touchProd,
  categorias,
  onOpenCategoriaForm,
}) => {
  const [uploadingImg, setUploadingImg] = useState(false)

  const handleImageUpload = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (archivo.size > 5 * 1024 * 1024) { toast.error('La imagen no puede superar 5MB'); return }
    setUploadingImg(true)
    try {
      const { url } = await subirImagenProducto(archivo)
      setFormData(f => ({ ...f, imagenUrl: url }))
      toast.success('Imagen subida')
    } catch (err) {
      toast.error(err.message || 'Error al subir imagen')
    } finally {
      setUploadingImg(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px] max-w-full flex flex-col p-0 gap-0 border-l">
        <SheetHeader className="px-8 py-6 border-b shrink-0 bg-muted/20">
          <SheetTitle className="text-xl font-bold">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</SheetTitle>
          <SheetDescription>{editingId ? 'Actualiza la información del producto.' : 'Agrega un nuevo producto al catálogo.'}</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6">
          <div className="space-y-2">
            <Label htmlFor="sh-nombre" className="text-sm font-semibold">Nombre del producto</Label>
            <FieldInput id="sh-nombre" name="nombre" value={formData.nombre}
              onChange={e => { handleInputChange(e); touchProd('nombre', e.target.value); }}
              error={errProd.nombre} autoFocus className="h-11 rounded-xl" placeholder="Ej. Laptop Gaming Pro" />
            <FieldError error={errProd.nombre} />
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
                  onChange={handleImageUpload} />
              </label>
              {formData.imagenUrl && <button type="button" onClick={() => setFormData(f => ({...f, imagenUrl: ''}))} className="text-xs text-muted-foreground hover:text-destructive"><X size={14} /></button>}
            </div>
            <p className="text-[11px] text-muted-foreground">JPG, PNG, GIF o WebP · Máx 5MB</p>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="sh-precio" className="text-sm font-semibold">Precio ($)</Label>
              <FieldInput id="sh-precio" type="number" name="precio" value={formData.precio}
                onChange={e => { handleInputChange(e); touchProd('precio', e.target.value); }}
                error={errProd.precio} min="0.01" step="0.01" className="h-11 rounded-xl" placeholder="0.00" />
              <FieldError error={errProd.precio} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sh-stock" className="text-sm font-semibold">Stock Inicial</Label>
              <FieldInput id="sh-stock" type="number" name="stock" value={formData.stock}
                onChange={e => { handleInputChange(e); touchProd('stock', e.target.value); }}
                error={errProd.stock} min="0" className="h-11 rounded-xl" placeholder="0" />
              <FieldError error={errProd.stock} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="sh-sku" className="text-sm font-semibold">SKU <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <FieldInput id="sh-sku" name="sku" value={formData.sku}
                onChange={e => { handleInputChange(e); touchProd('sku', e.target.value); }}
                error={errProd.sku} className="h-11 rounded-xl" placeholder="Ej. PROD-001" />
              <FieldError error={errProd.sku} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sh-stockmin" className="text-sm font-semibold">Stock Mínimo</Label>
              <FieldInput id="sh-stockmin" type="number" name="stockMinimo" value={formData.stockMinimo}
                onChange={e => { handleInputChange(e); touchProd('stockMinimo', e.target.value); }}
                error={errProd.stockMinimo} min="0" className="h-11 rounded-xl" placeholder="5" />
              <FieldError error={errProd.stockMinimo} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Categoría <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <button type="button" onClick={onOpenCategoriaForm} className="flex items-center gap-1 text-xs text-cyan-500 hover:text-cyan-600 transition-colors">
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
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl h-11 px-6">Cancelar</Button>
          <Button onClick={onSubmit} disabled={saving} className="rounded-xl h-11 px-8 gap-2 shadow-md">
            {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Check size={16} /> : <Plus size={16} />}
            {saving ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
