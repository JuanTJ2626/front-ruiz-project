import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { FieldInput, FieldError } from '#/components/ui/field-error'
import { Loader2, Check } from 'lucide-react'

export const CrearNegocioSheet = ({
  open,
  onOpenChange,
  formNuevoNegocio,
  setFormNuevoNegocio,
  saving,
  onSubmit,
  onCancel,
  errNegocio,
  touchNegocio,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">Nuevo Negocio</SheetTitle>
          <SheetDescription>Crea un nuevo negocio asociado a tu cuenta.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          <div className="space-y-2">
            <Label>Nombre del negocio *</Label>
            <FieldInput value={formNuevoNegocio.nombre}
              onChange={e => { setFormNuevoNegocio(f => ({...f, nombre: e.target.value})); touchNegocio('nombre', e.target.value); }}
              error={errNegocio.nombre} className="h-11 rounded-xl" placeholder="Ferretería El Clavo" autoFocus />
            <FieldError error={errNegocio.nombre} />
          </div>
          <div className="space-y-2">
            <Label>Giro comercial</Label>
            <Input value={formNuevoNegocio.giro} onChange={e => setFormNuevoNegocio(f => ({...f, giro: e.target.value}))} className="h-11 rounded-xl" placeholder="Ferretería, Abarrotes..." />
          </div>
        </form>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancelar</Button>
          <Button onClick={onSubmit} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Creando...' : 'Crear negocio'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
