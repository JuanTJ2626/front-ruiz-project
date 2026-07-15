import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { FieldInput, FieldError } from '#/components/ui/field-error'
import { Loader2, Check } from 'lucide-react'

export const CategoriaFormSheet = ({
  open,
  onOpenChange,
  formCategoria,
  setFormCategoria,
  saving,
  onSubmit,
  onCancel,
  errCat,
  touchCat,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] max-w-full flex flex-col p-0 gap-0 border-l">
        <SheetHeader className="px-8 py-6 border-b shrink-0 bg-muted/20">
          <SheetTitle className="text-xl font-bold">Nueva Categoría</SheetTitle>
          <SheetDescription>Organiza tus productos por categoría.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Nombre *</Label>
            <FieldInput value={formCategoria.nombre}
              onChange={e => { setFormCategoria(f => ({...f, nombre: e.target.value})); touchCat('nombre', e.target.value); }}
              error={errCat.nombre} className="h-11 rounded-xl" placeholder="Ej. Bebidas, Herramientas..." autoFocus />
            <FieldError error={errCat.nombre} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Descripción <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Input value={formCategoria.descripcion} onChange={e => setFormCategoria(f => ({...f, descripcion: e.target.value}))} className="h-11 rounded-xl" placeholder="Descripción de la categoría" />
          </div>
        </form>
        <div className="px-8 py-5 border-t flex justify-end gap-3 shrink-0 bg-muted/20">
          <Button variant="outline" onClick={onCancel} className="rounded-xl h-11 px-6">Cancelar</Button>
          <Button onClick={onSubmit} disabled={saving} className="rounded-xl h-11 px-8 gap-2 shadow-md">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Guardando...' : 'Crear categoría'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
