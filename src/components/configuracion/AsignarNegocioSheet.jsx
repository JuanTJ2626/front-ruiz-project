import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Button } from '#/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Loader2, Check } from 'lucide-react'

export const AsignarNegocioSheet = ({
  open,
  onOpenChange,
  assignTarget,
  assignNegocioId,
  setAssignNegocioId,
  negocios,
  saving,
  onSubmit,
  onCancel,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[400px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">Asignar Negocio</SheetTitle>
          <SheetDescription>Elige el negocio para <span className="font-semibold text-foreground">{assignTarget?.username}</span>.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-5 px-8 py-6">
          <div className="space-y-2">
            <Label>Negocio *</Label>
            <Select value={assignNegocioId} onValueChange={setAssignNegocioId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Selecciona un negocio..." />
              </SelectTrigger>
              <SelectContent>
                {negocios.map(n => (
                  <SelectItem key={n.id} value={String(n.id)}>{n.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancelar</Button>
          <Button onClick={onSubmit} disabled={saving || !assignNegocioId} className="gap-2 rounded-xl">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Asignando...' : 'Asignar'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
