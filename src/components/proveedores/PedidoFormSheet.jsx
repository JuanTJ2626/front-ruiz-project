import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Separator } from '#/components/ui/separator'
import { Switch } from '#/components/ui/switch'
import { FieldInput, FieldSelect, FieldError } from '#/components/ui/field-error'
import { Loader2, Check, Lock, Send, AlertTriangle, Info } from 'lucide-react'

export const PedidoFormSheet = ({
  open,
  onOpenChange,
  editandoPedido,
  formPed,
  setFormPed,
  proveedores,
  productos,
  saving,
  onGuardar,
  onCerrar,
  valPed
}) => {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onCerrar()}>
      <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">
            {editandoPedido ? 'Editar Pedido' : 'Nuevo Pedido'}
          </SheetTitle>
          <SheetDescription>
            {editandoPedido ? 'Modifica los datos del pedido.' : 'Crea un pedido a un proveedor.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onGuardar} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          {/* Proveedor */}
          <div className="space-y-2">
            <Label>Proveedor *</Label>
            <Select
              value={formPed.proveedorId}
              onValueChange={v => { setFormPed({...formPed, proveedorId: v}); valPed.touchField('proveedorId', v); }}
              disabled={!!editandoPedido}
            >
              <FieldSelect className="h-11 rounded-xl" error={valPed.errors.proveedorId}>
                <SelectValue placeholder="Selecciona un proveedor..." />
              </FieldSelect>
              <SelectContent>
                {proveedores.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError error={valPed.errors.proveedorId} />
            {editandoPedido && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock size={11} /> El proveedor no se puede cambiar una vez creado el pedido
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label>Descripción *</Label>
            <FieldInput
              value={formPed.descripcion}
              onChange={e => { setFormPed({...formPed, descripcion: e.target.value}); valPed.touchField('descripcion', e.target.value); }}
              error={valPed.errors.descripcion}
              className="h-11 rounded-xl"
              placeholder="Ej. Martillos de acero 500g"
              disabled={editandoPedido?.estado === 'ENVIADO'}
            />
            <FieldError error={valPed.errors.descripcion} />
          </div>

          {/* Producto del inventario */}
          <div className="space-y-2">
            <Label>Producto del inventario <span className="text-muted-foreground">(opcional)</span></Label>
            <Select
              value={formPed.productoId}
              onValueChange={v => setFormPed({...formPed, productoId: v})}
              disabled={editandoPedido?.estado === 'ENVIADO'}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Sin vincular a producto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin vincular a producto</SelectItem>
                {productos?.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nombre} — Stock: {p.stock}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Si lo vinculas, al marcar el pedido como <strong>Recibido</strong> el stock sube automáticamente.</p>
          </div>

          <Separator className="opacity-30" />

          {/* Cantidad y precio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cantidad *</Label>
              <FieldInput
                type="number" min="1"
                value={formPed.cantidad}
                onChange={e => { setFormPed({...formPed, cantidad: e.target.value}); valPed.touchField('cantidad', e.target.value); }}
                error={valPed.errors.cantidad}
                className="h-11 rounded-xl" placeholder="0"
                disabled={editandoPedido?.estado === 'ENVIADO'}
              />
              <FieldError error={valPed.errors.cantidad} />
            </div>
            <div className="space-y-2">
              <Label>Precio unitario</Label>
              <Input
                type="number" step="0.01" min="0"
                value={formPed.precioUnitario}
                onChange={e => setFormPed({...formPed, precioUnitario: e.target.value})}
                className="h-11 rounded-xl" placeholder="0.00"
                disabled={editandoPedido?.estado === 'ENVIADO'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fecha esperada</Label>
            <Input type="date" value={formPed.fechaEsperada}
              onChange={e => setFormPed({...formPed, fechaEsperada: e.target.value})}
              className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Notas</Label>
            <Input value={formPed.notas}
              onChange={e => setFormPed({...formPed, notas: e.target.value})}
              className="h-11 rounded-xl" placeholder="Instrucciones adicionales..." />
          </div>

          {!editandoPedido && (
            <>
              <Separator className="opacity-30" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">Notificar al proveedor</Label>
                  <Switch checked={formPed.enviarEmail} onCheckedChange={(checked) => setFormPed({...formPed, enviarEmail: checked})} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formPed.enviarEmail
                    ? <span className="flex items-center gap-1 text-emerald-400"><Send size={11} /> Se enviará un email automático al proveedor con los detalles del pedido</span>
                    : <span className="flex items-center gap-1 text-amber-400"><AlertTriangle size={11} /> Solo se registrará el pedido sin notificación</span>}
                </p>
              </div>
            </>
          )}

          {editandoPedido?.estado === 'ENVIADO' && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="flex items-center gap-1.5 text-xs text-amber-400">
                <Info size={13} /> Este pedido ya fue enviado. Solo puedes modificar la fecha esperada y las notas.
              </p>
            </div>
          )}
        </form>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={onCerrar} className="rounded-xl">Cancelar</Button>
          <Button onClick={onGuardar} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Guardando...' : editandoPedido ? 'Actualizar' : 'Crear Pedido'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
