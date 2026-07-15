import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '#/components/ui/sheet'
import { Label } from '#/components/ui/label'
import { Button } from '#/components/ui/button'
import { FieldInput, FieldError } from '#/components/ui/field-error'
import { Loader2, Check, Shield, User } from 'lucide-react'
import { cn } from '#/lib/utils'

export const CrearUsuarioSheet = ({
  open,
  onOpenChange,
  formUser,
  setFormUser,
  saving,
  onSubmit,
  onCancel,
  errUser,
  touchUser,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">Nuevo Usuario</SheetTitle>
          <SheetDescription>Crea un empleado o administrador para tu negocio.</SheetDescription>
        </SheetHeader>
        <form onSubmit={onSubmit} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          <div className="space-y-2">
            <Label>Correo electrónico *</Label>
            <FieldInput
              type="email"
              value={formUser.email}
              onChange={e => {
                const val = e.target.value
                setFormUser(f => ({ ...f, email: val, username: val }))
                touchUser('email', val)
              }}
              error={errUser.email}
              className="h-11 rounded-xl"
              placeholder="empleado@mail.com"
              autoFocus
            />
            <FieldError error={errUser.email} />
          </div>
          <div className="space-y-2">
            <Label>Contraseña *</Label>
            <FieldInput type="password" value={formUser.password}
              onChange={e => { setFormUser(f=>({...f,password:e.target.value})); touchUser('password', e.target.value); }}
              error={errUser.password} className="h-11 rounded-xl" placeholder="••••••••" />
            <FieldError error={errUser.password} />
          </div>
          <div className="space-y-2">
            <Label>Nombre completo *</Label>
            <FieldInput value={formUser.nombre}
              onChange={e => { setFormUser(f=>({...f,nombre:e.target.value})); touchUser('nombre', e.target.value); }}
              error={errUser.nombre} className="h-11 rounded-xl" placeholder="Carlos López" />
            <FieldError error={errUser.nombre} />
          </div>
          <div className="space-y-2">
            <Label>Rol</Label>
            <div className="grid grid-cols-2 gap-3">
              {['EMPLEADO','ADMIN'].map(r => (
                <button key={r} type="button" onClick={()=>setFormUser(f=>({...f,rol:r}))}
                  className={cn('flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition-all',
                    formUser.rol === r ? 'border-violet-500/40 bg-violet-500/15 text-violet-400' : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:border-white/20')}>
                  {r === 'ADMIN' ? <Shield size={15} /> : <User size={15} />} {r}
                </button>
              ))}
            </div>
          </div>
        </form>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancelar</Button>
          <Button onClick={onSubmit} disabled={saving} className="gap-2 rounded-xl">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Creando...' : 'Crear usuario'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
