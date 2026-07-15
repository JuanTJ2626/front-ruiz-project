import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '#/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { FieldInput, FieldError } from '#/components/ui/field-error'
import { PackagePlus, Link, Loader2, CheckCircle2 } from 'lucide-react'

export const RecepcionPedidoModal = ({
  open,
  pedido,
  productos,
  onConfirmar,
  onCancelar,
  valPRap
}) => {
  const [tabRecibido, setTabRecibido] = useState('asignar')
  const [productoAsignadoId, setProductoAsignadoId] = useState('')
  const [nuevoProducto, setNuevoProducto] = useState({ 
    nombre: pedido?.descripcion || '', 
    precio: '', 
    stock: String(pedido?.cantidad || ''), 
    stockMinimo: '5' 
  })
  const [guardando, setGuardando] = useState(false)

  const handleConfirmar = async () => {
    setGuardando(true)
    const success = await onConfirmar({
      tipo: tabRecibido,
      productoId: productoAsignadoId,
      nuevoProducto
    })
    setGuardando(false)
    if (success) {
      // Reset form if successful
      setProductoAsignadoId('')
      setNuevoProducto({ nombre: '', precio: '', stock: '', stockMinimo: '5' })
    }
  }

  // Update initial state when pedido changes
  if (pedido && nuevoProducto.nombre === '' && nuevoProducto.stock === '') {
    setNuevoProducto({
      nombre: pedido.descripcion || '',
      precio: '',
      stock: String(pedido.cantidad || ''),
      stockMinimo: '5'
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancelar()}>
      <DialogContent className="max-w-lg rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-amber-500/5">
          <DialogTitle className="flex items-center gap-2 text-amber-400">
            <PackagePlus size={20} />
            Pedido sin producto asignado
          </DialogTitle>
          <DialogDescription className="pt-1 text-sm">
            El pedido <span className="font-semibold text-foreground">"{pedido?.descripcion}"</span> no tiene
            un producto del catálogo vinculado. Asigna uno existente o crea uno nuevo para que el stock se actualice correctamente.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          <Tabs value={tabRecibido} onValueChange={setTabRecibido}>
            <TabsList className="w-full rounded-xl mb-5">
              <TabsTrigger value="asignar" className="flex-1 gap-2 rounded-lg">
                <Link size={14} /> Asignar existente
              </TabsTrigger>
              <TabsTrigger value="crear" className="flex-1 gap-2 rounded-lg">
                <PackagePlus size={14} /> Crear nuevo
              </TabsTrigger>
            </TabsList>

            {/* Tab: asignar producto existente */}
            <TabsContent value="asignar" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Producto del catálogo</Label>
                <Select value={productoAsignadoId} onValueChange={setProductoAsignadoId}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Selecciona un producto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productos?.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        <span className="flex items-center gap-2">
                          {p.nombre}
                          <span className="text-xs text-muted-foreground">— Stock actual: {p.stock}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Al confirmar, se sumarán <span className="font-semibold text-foreground">{pedido?.cantidad} unidades</span> al stock del producto seleccionado.
                </p>
              </div>
            </TabsContent>

            {/* Tab: crear producto nuevo */}
            <TabsContent value="crear" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nombre del producto *</Label>
                <FieldInput
                  value={nuevoProducto.nombre}
                  onChange={e => { setNuevoProducto(p => ({...p, nombre: e.target.value})); valPRap.touchField('nombre', e.target.value); }}
                  error={valPRap.errors.nombre}
                  className="h-11 rounded-xl"
                  placeholder="Ej. Aceite motor 5W-30"
                />
                <FieldError error={valPRap.errors.nombre} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Precio ($) *</Label>
                  <FieldInput
                    type="number" min="0.01" step="0.01"
                    value={nuevoProducto.precio}
                    onChange={e => { setNuevoProducto(p => ({...p, precio: e.target.value})); valPRap.touchField('precio', e.target.value); }}
                    error={valPRap.errors.precio}
                    className="h-11 rounded-xl"
                    placeholder="0.00"
                  />
                  <FieldError error={valPRap.errors.precio} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stock inicial</Label>
                  <FieldInput
                    type="number" min="0"
                    value={nuevoProducto.stock}
                    onChange={e => { setNuevoProducto(p => ({...p, stock: e.target.value})); valPRap.touchField('stock', e.target.value); }}
                    error={valPRap.errors.stock}
                    className="h-11 rounded-xl"
                    placeholder={String(pedido?.cantidad || 0)}
                  />
                  <FieldError error={valPRap.errors.stock} />
                  <p className="text-[11px] text-muted-foreground">Por defecto: cantidad del pedido ({pedido?.cantidad})</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Stock mínimo</Label>
                <Input
                  type="number" min="0"
                  value={nuevoProducto.stockMinimo}
                  onChange={e => setNuevoProducto(p => ({...p, stockMinimo: e.target.value}))}
                  className="h-11 rounded-xl"
                  placeholder="5"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 pb-6 gap-3">
          <Button variant="outline" onClick={onCancelar} className="rounded-xl" disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={guardando}
            className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {guardando
              ? <Loader2 size={15} className="animate-spin" />
              : <CheckCircle2 size={15} />}
            {guardando ? 'Procesando...' : 'Confirmar recibido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
