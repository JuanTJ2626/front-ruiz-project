import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Settings, Building2, Shield, User, Save, Check, Loader2,
  Moon, Layers, Upload, Users, Plus, Trash2, KeyRound, UserCheck, UserX } from 'lucide-react'
import { PageLayout } from './PageLayout'
import { AuroraCard, AuroraStatCard } from './ui/aurora-card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { getNegociosUsuario, actualizarNegocio, crearNegocio } from '../services/negocioService'
import { getUsername, getRol, getNegocioId } from '../services/config'
import { getUsuarios, crearEmpleado, cambiarRol, cambiarEstadoUsuario, eliminarUsuario } from '../services/usuarioService'
import { subirLogoNegocio } from '../services/uploadService'
import { useRol } from '../hooks/useRol'
import { useApp } from '../context/AppContext'

const ConfiguracionDashboard = () => {
  const { isAdmin } = useRol()
  const { cambiarNegocio, handleCrearNegocio, recargar } = useApp()
  const username = getUsername() || 'Usuario'
  const rol      = getRol()      || 'ADMIN'

  const [saving, setSaving]               = useState(false)
  const [negocios, setNegocios]           = useState([])
  const [negocioActivo, setNegocioAct]    = useState(Number(getNegocioId()) || null)
  const [negocioForm, setNegocioForm]     = useState({ nombre: '', giro: '', logoUrl: '' })
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Crear nuevo negocio
  const [showFormNegocio, setShowFormNegocio] = useState(false)
  const [savingNegocio, setSavingNegocio]     = useState(false)
  const [formNegocio, setFormNegocio]         = useState({ nombre: '', giro: '' })

  // Usuarios — solo ADMIN
  const [usuarios, setUsuarios]           = useState([])
  const [showFormUser, setShowFormUser]   = useState(false)
  const [savingUser, setSavingUser]       = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [formUser, setFormUser]           = useState({ username: '', email: '', password: '', nombre: '', rol: 'EMPLEADO' })

  const cargar = useCallback(async () => {
    try {
      const data = await getNegociosUsuario()
      const arr = Array.isArray(data) ? data : []
      setNegocios(arr)
      const activo = arr.find(n => n.id === negocioActivo) || arr[0]
      if (activo) setNegocioForm({ nombre: activo.nombre || '', giro: activo.giro || '', logoUrl: activo.logoUrl || '' })
    } catch { /* sin negocios aún */ }
    if (isAdmin) {
      try {
        const data = await getUsuarios()
        setUsuarios(Array.isArray(data) ? data : [])
      } catch { /* silencioso */ }
    }
  }, [negocioActivo, isAdmin])

  useEffect(() => { cargar() }, [cargar])

  const handleGuardarNegocio = async () => {
    if (!negocioActivo) return toast.error('Selecciona un negocio primero')
    setSaving(true)
    try {
      await actualizarNegocio(negocioActivo, negocioForm)
      toast.success('Datos del negocio actualizados')
    } catch (err) { toast.error(err.message || 'Error al guardar') }
    finally { setSaving(false) }
  }

  const handleSeleccionarNegocio = (negocio) => {
    setNegocioAct(negocio.id)
    cambiarNegocio(negocio.id) // cambia el negocio activo en toda la app y recarga datos
    setNegocioForm({ nombre: negocio.nombre || '', giro: negocio.giro || '', logoUrl: negocio.logoUrl || '' })
  }

  const handleSubirLogo = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setUploadingLogo(true)
    try {
      const { url } = await subirLogoNegocio(archivo)
      setNegocioForm(f => ({ ...f, logoUrl: url }))
      toast.success('Logo subido correctamente')
    } catch (err) { toast.error(err.message || 'Error al subir logo') }
    finally { setUploadingLogo(false) }
  }

  const handleCrearEmpleado = async (e) => {
    e.preventDefault(); setSavingUser(true)
    try {
      await crearEmpleado({ ...formUser, negocioId: Number(getNegocioId()) })
      toast.success(`Usuario "${formUser.username}" creado como ${formUser.rol}`)
      setFormUser({ username: '', email: '', password: '', nombre: '', rol: 'EMPLEADO' })
      setShowFormUser(false); cargar()
    } catch (err) { toast.error(err.message || 'Error al crear usuario') }
    finally { setSavingUser(false) }
  }

  const handleCambiarRol = async (usuario) => {
    const nuevoRol = usuario.rol === 'ADMIN' ? 'EMPLEADO' : 'ADMIN'
    try {
      await cambiarRol(usuario.id, nuevoRol)
      toast.success(`Rol de ${usuario.username} → ${nuevoRol}`)
      cargar()
    } catch (err) { toast.error(err.message || 'Error al cambiar rol') }
  }

  const handleToggleEstado = async (usuario) => {
    try {
      await cambiarEstadoUsuario(usuario.id, !usuario.activo)
      toast.success(`Usuario ${usuario.activo ? 'desactivado' : 'activado'}`)
      cargar()
    } catch (err) { toast.error(err.message || 'Error al cambiar estado') }
  }

  const handleEliminarUsuario = async () => {
    if (!deleteTarget) return
    try {
      await eliminarUsuario(deleteTarget.id)
      toast.success('Usuario eliminado')
      setDeleteTarget(null); cargar()
    } catch (err) { toast.error(err.message || 'Error al eliminar') }
  }

  const handleCrearNegocioLocal = async (e) => {
    e.preventDefault(); setSavingNegocio(true)
    try {
      const nuevo = await handleCrearNegocio(formNegocio)
      toast.success(`Negocio "${formNegocio.nombre}" creado`)
      setFormNegocio({ nombre: '', giro: '' })
      setShowFormNegocio(false)
      cargar()
      // activar el nuevo negocio automáticamente
      if (nuevo?.id) cambiarNegocio(nuevo.id)
    } catch (err) { toast.error(err.message || 'Error al crear negocio') }
    finally { setSavingNegocio(false) }
  }

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <>
    <PageLayout title="Configuración" subtitle="Administra tu negocio, usuarios y preferencias." badge="Ajustes"
      actions={
        <Button onClick={handleGuardarNegocio} disabled={saving} className="gap-2 rounded-xl shadow-md">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AuroraStatCard icon={Shield}    label="Rol Actual" value={rol}              sub="nivel de acceso" glow="violet" delay={160} />
        <AuroraStatCard icon={User}      label="Usuario"    value={username}         sub="sesión activa"   glow="cyan"   delay={80} />
        {isAdmin && <AuroraStatCard icon={Users} label="Usuarios" value={usuarios.length} sub="en el negocio" glow="emerald" delay={240} />}
        {isAdmin && <AuroraStatCard icon={Building2} label="Negocios" value={negocios.length} sub="vinculados" glow="amber" delay={320} />}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Perfil */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <AuroraCard glow="cyan" className="h-full">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><User size={18} /></div>
                <div><h2 className="font-heading text-lg font-bold text-foreground">Perfil</h2><p className="text-xs text-muted-foreground">Tu cuenta</p></div>
              </div>
              <div className="mb-5 flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-cyan-500/30">
                  <AvatarFallback className="bg-cyan-500/10 text-lg font-bold text-cyan-400">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-heading font-bold text-foreground">{username}</p>
                  <Badge variant="outline" className="mt-1 border-violet-500/30 bg-violet-500/10 text-violet-400">{rol}</Badge>
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs text-muted-foreground">El perfil se gestiona desde el backend. Contacta al administrador para cambios.</p>
              </div>
            </div>
          </AuroraCard>
        </motion.div>

        {/* Negocio */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <AuroraCard glow="emerald" className="h-full">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><Building2 size={18} /></div>
                <div><h2 className="font-heading text-lg font-bold text-foreground">Datos del Negocio</h2><p className="text-xs text-muted-foreground">Negocio activo</p></div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="space-y-2"><Label>Nombre</Label>
                  <Input value={negocioForm.nombre} onChange={e => setNegocioForm(f=>({...f,nombre:e.target.value}))} className="h-10 rounded-xl" placeholder="Mi Negocio" /></div>
                <div className="space-y-2"><Label>Giro comercial</Label>
                  <Input value={negocioForm.giro} onChange={e => setNegocioForm(f=>({...f,giro:e.target.value}))} className="h-10 rounded-xl" placeholder="Ferretería..." /></div>
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    {negocioForm.logoUrl && <img src={negocioForm.logoUrl} alt="logo" className="h-10 w-10 rounded-lg object-cover border border-white/10" />}
                    <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:bg-white/10 ${uploadingLogo ? 'opacity-60' : ''}`}>
                      {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadingLogo ? 'Subiendo...' : 'Subir logo'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleSubirLogo} disabled={uploadingLogo} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </AuroraCard>
        </motion.div>

      </div>

      {/* ── GESTIÓN DE USUARIOS — solo ADMIN ── */}
      {isAdmin && (
        <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <AuroraCard glow="violet">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><Users size={18} /></div>
                  <div><h2 className="font-heading text-lg font-bold text-foreground">Gestión de Usuarios</h2>
                    <p className="text-sm text-muted-foreground">Crea empleados y gestiona roles</p></div>
                </div>
                <Button onClick={() => setShowFormUser(true)} className="gap-2 rounded-xl" size="sm">
                  <Plus size={14} /> Nuevo usuario
                </Button>
              </div>

              {usuarios.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Users size={32} className="mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {usuarios.map((u) => (
                    <div key={u.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarFallback className="bg-muted text-sm font-bold">{(u.username || u.nombre || '?').slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{u.username || u.nombre}</span>
                          <Badge variant="outline" className={cn('text-[10px] font-bold',
                            u.rol === 'ADMIN' ? 'border-violet-500/30 bg-violet-500/10 text-violet-400' : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400'
                          )}>{u.rol}</Badge>
                          {u.activo === false && <Badge variant="outline" className="text-[10px] border-red-500/30 bg-red-500/10 text-red-400">Inactivo</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {/* Cambiar rol */}
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" title={`Cambiar a ${u.rol === 'ADMIN' ? 'EMPLEADO' : 'ADMIN'}`}
                          onClick={() => handleCambiarRol(u)}>
                          <KeyRound size={14} />
                        </Button>
                        {/* Activar / desactivar */}
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" title={u.activo === false ? 'Activar' : 'Desactivar'}
                          onClick={() => handleToggleEstado(u)}>
                          {u.activo === false ? <UserCheck size={14} className="text-emerald-400" /> : <UserX size={14} className="text-amber-400" />}
                        </Button>
                        {/* Eliminar */}
                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => setDeleteTarget(u)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AuroraCard>
        </motion.div>
      )}

      {/* Multi-negocio */}
      {(negocios.length > 0 || isAdmin) && (
        <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <AuroraCard glow="blue">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><Layers size={18} /></div>
                  <div><h2 className="font-heading text-lg font-bold text-foreground">Mis Negocios</h2>
                    <p className="text-sm text-muted-foreground">Selecciona el negocio activo</p></div>
                </div>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">{negocios.length} negocio{negocios.length !== 1 ? 's' : ''}</Badge>
              </div>
              {/* Botón nuevo negocio */}
              <div className="mb-4 flex justify-end">
                <Button size="sm" onClick={() => setShowFormNegocio(true)} className="gap-2 rounded-xl">
                  <Plus size={14} /> Nuevo negocio
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {negocios.map(n => (
                  <button key={n.id} type="button" onClick={() => handleSeleccionarNegocio(n)}
                    className={cn('flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                      negocioActivo === n.id
                        ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]'
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]')}>
                    <div className="flex w-full items-center justify-between">
                      <Building2 size={18} className={negocioActivo === n.id ? 'text-cyan-400' : 'text-muted-foreground'} />
                      {negocioActivo === n.id && <Badge className="border-0 bg-cyan-500/20 text-cyan-300"><Check size={10} className="mr-1" /> Activo</Badge>}
                    </div>
                    <p className="font-heading text-sm font-bold text-foreground">{n.nombre}</p>
                    {n.giro && <p className="text-xs text-muted-foreground">{n.giro}</p>}
                  </button>
                ))}
              </div>
            </div>
          </AuroraCard>
        </motion.div>
      )}

    </PageLayout>

    {/* Sheet: crear negocio */}
    <Sheet open={showFormNegocio} onOpenChange={setShowFormNegocio}>
      <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">Nuevo Negocio</SheetTitle>
          <SheetDescription>Crea un nuevo negocio asociado a tu cuenta.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleCrearNegocioLocal} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          <div className="space-y-2">
            <Label>Nombre del negocio *</Label>
            <Input value={formNegocio.nombre} onChange={e => setFormNegocio(f => ({...f, nombre: e.target.value}))} required className="h-11 rounded-xl" placeholder="Ferretería El Clavo" autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Giro comercial</Label>
            <Input value={formNegocio.giro} onChange={e => setFormNegocio(f => ({...f, giro: e.target.value}))} className="h-11 rounded-xl" placeholder="Ferretería, Abarrotes..." />
          </div>
        </form>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={() => setShowFormNegocio(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={handleCrearNegocioLocal} disabled={savingNegocio} className="gap-2 rounded-xl">
            {savingNegocio ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {savingNegocio ? 'Creando...' : 'Crear negocio'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    {/* Sheet: crear usuario */}
    <Sheet open={showFormUser} onOpenChange={setShowFormUser}>
      <SheetContent side="right" className="flex w-[440px] max-w-full flex-col gap-0 border-l p-0">
        <SheetHeader className="shrink-0 border-b bg-muted/20 px-8 py-6">
          <SheetTitle className="text-xl font-bold">Nuevo Usuario</SheetTitle>
          <SheetDescription>Crea un empleado o administrador para tu negocio.</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleCrearEmpleado} className="flex flex-1 flex-col gap-5 overflow-y-auto px-8 py-6">
          <div className="space-y-2"><Label>Usuario *</Label>
            <Input value={formUser.username} onChange={e=>setFormUser(f=>({...f,username:e.target.value}))} required className="h-11 rounded-xl" placeholder="empleado1" /></div>
          <div className="space-y-2"><Label>Correo *</Label>
            <Input type="email" value={formUser.email} onChange={e=>setFormUser(f=>({...f,email:e.target.value}))} required className="h-11 rounded-xl" placeholder="empleado@mail.com" /></div>
          <div className="space-y-2"><Label>Contraseña *</Label>
            <Input type="password" value={formUser.password} onChange={e=>setFormUser(f=>({...f,password:e.target.value}))} required className="h-11 rounded-xl" placeholder="••••••••" /></div>
          <div className="space-y-2"><Label>Nombre completo</Label>
            <Input value={formUser.nombre} onChange={e=>setFormUser(f=>({...f,nombre:e.target.value}))} className="h-11 rounded-xl" placeholder="Carlos López" /></div>
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
          <Button variant="outline" onClick={()=>setShowFormUser(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={handleCrearEmpleado} disabled={savingUser} className="gap-2 rounded-xl">
            {savingUser ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {savingUser ? 'Creando...' : 'Crear usuario'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>

    {/* Dialog: confirmar eliminación */}
    <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
      <DialogContent className="max-w-sm rounded-[24px] p-6">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Trash2 size={28} className="text-red-600" />
          </div>
          <DialogTitle className="text-center text-xl">¿Eliminar usuario?</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Se eliminará <span className="font-semibold text-foreground">"{deleteTarget?.username}"</span> permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 mt-4">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={()=>setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleEliminarUsuario}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default ConfiguracionDashboard
