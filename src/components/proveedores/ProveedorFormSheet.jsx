import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { FieldInput, FieldError } from '#/components/ui/field-error'
import { Loader2, Check, MailCheck, MailX } from 'lucide-react'

export const ProveedorFormSheet = ({
  open,
  onOpenChange,
  editandoProveedor,
  formProv,
  setFormProv,
  saving,
  onGuardar,
  onCerrar,
  valProv
}) => {
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onCerrar()}>
      <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">
            {editandoProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </SheetTitle>
          <SheetDescription>
            {editandoProveedor ? 'Modifica los datos del proveedor.' : 'Registra un proveedor en el directorio.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={onGuardar} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          <div className="space-y-2">
            <Label>Nombre / Empresa *</Label>
            <FieldInput value={formProv.nombre}
              onChange={e => { setFormProv({...formProv, nombre: e.target.value}); valProv.touchField('nombre', e.target.value); }}
              error={valProv.errors.nombre} className="h-11 rounded-xl" placeholder="Distribuidora López" autoFocus />
            <FieldError error={valProv.errors.nombre} />
          </div>
          <div className="space-y-2">
            <Label>Persona de contacto</Label>
            <Input value={formProv.contacto} onChange={e => setFormProv({...formProv, contacto: e.target.value})} className="h-11 rounded-xl" placeholder="Juan López" />
          </div>
          <Separator className="opacity-30" />
          <div className="space-y-2">
            <Label>Correo electrónico</Label>
            <FieldInput type="email" value={formProv.email}
              onChange={e => { setFormProv({...formProv, email: e.target.value}); valProv.touchField('email', e.target.value); }}
              error={valProv.errors.email} className="h-11 rounded-xl" placeholder="contacto@proveedor.com" />
            <FieldError error={valProv.errors.email} />
            {!valProv.errors.email && (
              <p className="text-xs text-muted-foreground">
                {formProv.email?.trim()
                  ? <span className="flex items-center gap-1 text-emerald-400"><MailCheck size={11} /> Este proveedor podrá recibir notificaciones por email de sus pedidos</span>
                  : <span className="flex items-center gap-1 text-amber-400"><MailX size={11} /> Sin email configurado, no se podrán enviar notificaciones automáticas</span>}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <FieldInput value={formProv.telefono}
              onChange={e => { setFormProv({...formProv, telefono: e.target.value}); valProv.touchField('telefono', e.target.value); }}
              error={valProv.errors.telefono} className="h-11 rounded-xl" placeholder="+52 55 0000 0000" />
            <FieldError error={valProv.errors.telefono} />
          </div>
        </form>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={onCerrar} className="rounded-xl">Cancelar</Button>
          <Button onClick={onGuardar} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Guardando...' : editandoProveedor ? 'Actualizar' : 'Guardar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
