import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { Building2, Shield, User, Save, Check, Loader2,
  Layers, Upload, Users, Plus, Trash2, KeyRound, Store } from 'lucide-react'
import { PageLayout } from '../components/PageLayout'
import { AuroraCard, AuroraStatCard } from '../components/ui/aurora-card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Separator } from '../components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog'
import { Switch } from '../components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip'
import { toast } from 'sonner'
import { cn } from '#/lib/utils'
import { getNegociosUsuario } from '../services/negocioService'
import { getUsername, getRol, getNegocioId } from '../services/config'
import { useRol } from '../hooks/useRol'
import { useApp } from '../context/AppContext'
import { useUsuariosGestion } from '../hooks/useUsuariosGestion'
import { useNegocioForm } from '../hooks/useNegocioForm'

const ConfiguracionDashboard = () => {
  const { isAdmin } = useRol()
  const { cambiarNegocio, handleCrearNegocio, negocioActivo: negocioActivoGlobal } = useApp()
  const username = getUsername() || 'Usuario'
  const rol      = getRol()      || 'ADMIN'

  // Hook de gestión de usuarios
  const {
    usuarios,
    loadingUsuarios,
    savingUser,
    handleCrearUsuario,
    handleCambiarRol,
    handleToggleActivo,
    handleEliminarUsuario,
    handleAsignarNegocio: asignarNegocioUsuario,
  } = useUsuariosGestion()

  const [negocios, setNegocios]           = useState([])
  const [negocioActivo, setNegocioAct]    = useState(Number(getNegocioId()) || null)
  const negocioSeleccionado = negocios.find(n => n.id === negocioActivo)
  
  // Hook del formulario de negocio
  const {
    formNegocio,
    savingNegocio,
    uploadingLogo,
    cargarDatosNegocio,
    updateField,
    handleGuardarNegocio: guardarNegocio,
    handleSubirLogo,
  } = useNegocioForm(negocioSeleccionado, () => cargar())

  const [showFormNegocio, setShowFormNegocio] = useState(false)
  const [formNuevoNegocio, setFormNuevoNegocio] = useState({ nombre: '', giro: '' })
  const [savingNuevoNegocio, setSavingNuevoNegocio] = useState(false)

  const [showFormUser, setShowFormUser]   = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [formUser, setFormUser]           = useState({ username: '', email: '', password: '', nombre: '', rol: 'EMPLEADO' })

  const [assignTarget, setAssignTarget]   = useState(null)
  const [assignNegocioId, setAssignNegocioId] = useState('')
  const [savingAssign, setSavingAssign]   = useState(false)

  useEffect(() => {
    if (negocioActivoGlobal) setNegocioAct(negocioActivoGlobal)
  }, [negocioActivoGlobal])

  const cargar = useCallback(async () => {
    try {
      const data = await getNegociosUsuario()
      const arr = Array.isArray(data) ? data : []
      setNegocios(arr)
      const activo = arr.find(n => n.id === negocioActivo) || arr[0]
      if (activo) cargarDatosNegocio(activo)
    } catch { /* sin negocios aún */ }
  }, [negocioActivo, cargarDatosNegocio])

  useEffect(() => { cargar() }, [cargar])

  const handleSeleccionarNegocio = (negocio) => {
    setNegocioAct(negocio.id)
    cambiarNegocio(negocio.id)
    cargarDatosNegocio(negocio)
  }

  const handleCrearEmpleado = async (e) => {
    e.preventDefault()
    const success = await handleCrearUsuario(formUser)
    if (success) {
      setFormUser({ username: '', email: '', password: '', nombre: '', rol: 'EMPLEADO' })
      setShowFormUser(false)
    }
  }

  const handleCambiarRolLocal = async (usuario) => {
    const nuevoRol = usuario.rol === 'ADMIN' ? 'EMPLEADO' : 'ADMIN'
    await handleCambiarRol(usuario, nuevoRol)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    const success = await handleEliminarUsuario(deleteTarget)
    if (success) setDeleteTarget(null)
  }

  const handleAsignarNegocio = async (e) => {
    e?.preventDefault()
    if (!assignTarget || !assignNegocioId) return
    setSavingAssign(true)
    const success = await asignarNegocioUsuario(Number(assignTarget.id), Number(assignNegocioId), assignTarget.username)
    if (success) {
      setAssignTarget(null)
      setAssignNegocioId('')
    }
    setSavingAssign(false)
  }

  const handleCrearNegocioLocal = async (e) => {
    e.preventDefault()
    if (!formNuevoNegocio.nombre?.trim()) {
      return toast.error('El nombre del negocio es obligatorio')
    }
    setSavingNuevoNegocio(true)
    try {
      const nuevo = await handleCrearNegocio({ ...formNuevoNegocio, nombre: formNuevoNegocio.nombre.trim() })
      toast.success(`Negocio "${formNuevoNegocio.nombre.trim()}" creado`)
      setFormNuevoNegocio({ nombre: '', giro: '' })
      setShowFormNegocio(false)
      await cargar()
      if (nuevo?.id) cambiarNegocio(nuevo.id)
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) toast.error('Ya existe un negocio con ese nombre')
      else if (status === 403) toast.error('No tienes permiso para crear negocios')
      else toast.error('No se pudo crear el negocio. Intenta de nuevo')
    }
    finally { setSavingNuevoNegocio(false) }
  }

  const initials = username.slice(0, 2).toUpperCase()

  return (
    <TooltipProvider>
    <PageLayout title="Configuración" subtitle="Administra tu negocio, usuarios y preferencias." badge="Ajustes"
      actions={
        <Button onClick={guardarNegocio} disabled={savingNegocio} className="gap-2 rounded-xl shadow-md">
          {savingNegocio ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {savingNegocio ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      }
    >
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AuroraStatCard icon={Shield}    label="Rol Actual" value={rol}              sub="nivel de acceso" glow="violet" delay={160} />
        <AuroraStatCard icon={User}      label="Usuario"    value={username}         sub="sesión activa"   glow="cyan"   delay={80} />
        {isAdmin && <AuroraStatCard icon={Users}     label="Usuarios"  value={usuarios.length} sub="en el negocio" glow="emerald" delay={240} />}
        {isAdmin && <AuroraStatCard icon={Building2} label="Negocios"  value={negocios.length} sub="vinculados"    glow="amber"   delay={320} />}
      </div>

      {/* ── TABS PRINCIPALES ── */}
      <Tabs defaultValue="negocio" className="w-full">
        <TabsList className="mb-6 h-10 rounded-xl bg-muted/40 p-1">
          <TabsTrigger value="negocio"  className="rounded-lg px-5 text-sm font-semibold">Negocio</TabsTrigger>
          <TabsTrigger value="perfil"   className="rounded-lg px-5 text-sm font-semibold">Perfil</TabsTrigger>
          {isAdmin && <TabsTrigger value="usuarios" className="rounded-lg px-5 text-sm font-semibold">Usuarios</TabsTrigger>}
        </TabsList>

        {/* ── TAB NEGOCIO ── */}
        <TabsContent value="negocio" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AuroraCard glow="emerald" className="h-full">
                <div className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><Building2 size={18} /></div>
                    <div><h2 className="font-heading text-lg font-bold text-foreground">Datos del Negocio</h2><p className="text-xs text-muted-foreground">Negocio activo</p></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input value={formNegocio.nombre} onChange={e => updateField('nombre', e.target.value)} className="h-10 rounded-xl" placeholder="Mi Negocio" />
                    </div>
                    <div className="space-y-2">
                      <Label>Giro comercial</Label>
                      <Input value={formNegocio.direccion || ''} onChange={e => updateField('direccion', e.target.value)} className="h-10 rounded-xl" placeholder="Ferretería, Abarrotes..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      <div className="flex items-center gap-3">
                        {formNegocio.logoUrl && <img src={formNegocio.logoUrl} alt="logo" className="h-10 w-10 rounded-lg object-cover border border-white/10" />}
                        <label className={`flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:bg-white/10 ${uploadingLogo ? 'opacity-60' : ''}`}>
                          {uploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          {uploadingLogo ? 'Subiendo...' : formNegocio.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                          <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={e => handleSubirLogo(e.target.files?.[0])} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </AuroraCard>
            </motion.div>

            {/* Mis negocios */}
            {(negocios.length > 0 || isAdmin) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <AuroraCard glow="blue" className="h-full">
                  <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><Layers size={18} /></div>
                        <div><h2 className="font-heading text-lg font-bold text-foreground">Mis Negocios</h2><p className="text-sm text-muted-foreground">Selecciona el activo</p></div>
                      </div>
                      <Button size="sm" onClick={() => setShowFormNegocio(true)} className="gap-2 rounded-xl">
                        <Plus size={14} /> Nuevo
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {negocios.map(n => (
                        <button key={n.id} type="button" onClick={() => handleSeleccionarNegocio(n)}
                          className={cn('flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                            negocioActivo === n.id
                              ? 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]'
                              : 'border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]')}>
                          <div className="flex w-full items-center justify-between">
                            <Building2 size={16} className={negocioActivo === n.id ? 'text-cyan-400' : 'text-muted-foreground'} />
                            {negocioActivo === n.id && <Badge className="border-0 bg-cyan-500/20 text-cyan-300 text-[10px]"><Check size={9} className="mr-1" />Activo</Badge>}
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
          </div>
        </TabsContent>

        {/* ── TAB PERFIL ── */}
        <TabsContent value="perfil">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <AuroraCard glow="cyan" className="max-w-md">
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
        </TabsContent>

        {/* ── TAB USUARIOS (solo ADMIN) ── */}
        {isAdmin && (
          <TabsContent value="usuarios">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AuroraCard glow="violet">
                <div className="p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="aurora-icon-ring flex h-10 w-10 items-center justify-center rounded-xl"><Users size={18} /></div>
                      <div>
                        <h2 className="font-heading text-lg font-bold text-foreground">Gestión de Usuarios</h2>
                        <p className="text-sm text-muted-foreground">Crea empleados y gestiona roles</p>
                      </div>
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
                            </div>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            {/* Switch activar/desactivar */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5">
                                  <Switch
                                    checked={u.activo !== false}
                                    onCheckedChange={() => handleToggleActivo(u)}
                                    className="data-[state=checked]:bg-emerald-500"
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>{u.activo !== false ? 'Desactivar usuario' : 'Activar usuario'}</TooltipContent>
                            </Tooltip>
                            <Separator orientation="vertical" className="h-5 opacity-30" />
                            {/* Asignar negocio */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"
                                  onClick={() => { setAssignTarget(u); setAssignNegocioId('') }}>
                                  <Store size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Asignar negocio</TooltipContent>
                            </Tooltip>
                            {/* Cambiar rol */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg"
                                  onClick={() => handleCambiarRolLocal(u)}>
                                  <KeyRound size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Cambiar a {u.rol === 'ADMIN' ? 'EMPLEADO' : 'ADMIN'}</TooltipContent>
                            </Tooltip>
                            {/* Eliminar */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-red-500/10 hover:text-red-500"
                                  onClick={() => setDeleteTarget(u)}>
                                  <Trash2 size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Eliminar usuario</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AuroraCard>
            </motion.div>
          </TabsContent>
        )}
      </Tabs>
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
            <Input value={formNuevoNegocio.nombre} onChange={e => setFormNuevoNegocio(f => ({...f, nombre: e.target.value}))} required className="h-11 rounded-xl" placeholder="Ferretería El Clavo" autoFocus />
          </div>
          <div className="space-y-2">
            <Label>Giro comercial</Label>
            <Input value={formNuevoNegocio.giro} onChange={e => setFormNuevoNegocio(f => ({...f, giro: e.target.value}))} className="h-11 rounded-xl" placeholder="Ferretería, Abarrotes..." />
          </div>
        </form>
        <div className="flex shrink-0 justify-end gap-3 border-t bg-muted/20 px-8 py-5">
          <Button variant="outline" onClick={() => setShowFormNegocio(false)} className="rounded-xl">Cancelar</Button>
          <Button onClick={handleCrearNegocioLocal} disabled={savingNuevoNegocio} className="gap-2 rounded-xl">
            {savingNuevoNegocio ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {savingNuevoNegocio ? 'Creando...' : 'Crear negocio'}
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

    {/* Sheet: asignar negocio */}
    <Sheet open={!!assignTarget} onOpenChange={open => !open && setAssignTarget(null)}>
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
          <Button variant="outline" onClick={() => setAssignTarget(null)} className="rounded-xl">Cancelar</Button>
          <Button onClick={handleAsignarNegocio} disabled={savingAssign || !assignNegocioId} className="gap-2 rounded-xl">
            {savingAssign ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {savingAssign ? 'Asignando...' : 'Asignar'}
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
          <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleDeleteConfirm}>Eliminar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  )
}

export default ConfiguracionDashboard
