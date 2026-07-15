import { useState, useEffect } from 'react'
import { Building2, Shield, User, Save, Loader2, Trash2, Users } from 'lucide-react'
import { PageLayout } from '../components/PageLayout'
import { AuroraStatCard } from '../components/ui/aurora-card'
import { Button } from '../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { TooltipProvider } from '../components/ui/tooltip'
import { ConfirmarEliminarDialog } from '../components/ui/ConfirmarEliminarDialog'
import { toast } from 'sonner'
import { eliminarNegocio } from '../services/negocioService'
import { getUsername, getRol, getNegocioId } from '../services/config'
import { useRol } from '../hooks/useRol'
import { useApp } from '../context/AppContext'
import { useUsuariosGestion } from '../hooks/useUsuariosGestion'
import { useNegocioForm } from '../hooks/useNegocioForm'
import { useFormValidation, schemas } from '../hooks/useFormValidation'

// Tabs extraídos
import { TabNegocio }  from '../components/configuracion/TabNegocio'
import { TabPerfil }   from '../components/configuracion/TabPerfil'
import { TabUsuarios } from '../components/configuracion/TabUsuarios'

// Sheets
import { CrearUsuarioSheet }  from '../components/configuracion/CrearUsuarioSheet'
import { CrearNegocioSheet }  from '../components/configuracion/CrearNegocioSheet'
import { AsignarNegocioSheet } from '../components/configuracion/AsignarNegocioSheet'

const ConfiguracionDashboard = () => {
  const { isAdmin } = useRol()
  const isSuperAdmin = getRol() === 'SUPER_ADMIN'
  const { cambiarNegocio, handleCrearNegocio, cargarNegocios, negocios: negociosCtx, negocioActivo: negocioActivoGlobal } = useApp()
  const username = getUsername() || 'Usuario'
  const rol      = getRol()      || 'ADMIN'

  // ── Usuarios ──────────────────────────────────────────────
  const {
    usuarios, loadingUsuarios, savingUser,
    handleCrearUsuario, handleCambiarRol, handleToggleActivo,
    handleEliminarUsuario,
    handleAsignarNegocio: asignarNegocioUsuario,
    handleQuitarNegocio:  quitarNegocioUsuario,
  } = useUsuariosGestion()

  // ── Negocio activo ────────────────────────────────────────
  const negocios = negociosCtx
  const [negocioActivo, setNegocioAct] = useState(Number(getNegocioId()) || null)
  const negocioSeleccionado = negocios.find(n => n.id === negocioActivo)

  const { formNegocio, savingNegocio, uploadingLogo, cargarDatosNegocio, updateField, handleGuardarNegocio: guardarNegocio, handleSubirLogo } =
    useNegocioForm(negocioSeleccionado, () => cargarNegocios())

  // ── Estado de formularios / modals ────────────────────────
  const [showFormNegocio,   setShowFormNegocio]   = useState(false)
  const [formNuevoNegocio,  setFormNuevoNegocio]  = useState({ nombre: '', giro: '' })
  const [savingNuevoNeg,    setSavingNuevoNeg]    = useState(false)

  const [showFormUser, setShowFormUser] = useState(false)
  const [formUser,     setFormUser]     = useState({ username: '', email: '', password: '', nombre: '', rol: 'EMPLEADO' })

  const [deleteTarget,       setDeleteTarget]       = useState(null)
  const [assignTarget,       setAssignTarget]       = useState(null)
  const [assignNegocioId,    setAssignNegocioId]    = useState('')
  const [savingAssign,       setSavingAssign]       = useState(false)
  const [deleteNegocioTarget, setDeleteNegocioTarget] = useState(null)
  const [deletingNegocio,    setDeletingNegocio]   = useState(false)

  // ── Validaciones ──────────────────────────────────────────
  const { errors: errUser,    validate: validateUser,    touchField: touchUser,    clearErrors: clearUser    } = useFormValidation(schemas.usuario)
  const { errors: errNegocio, validate: validateNegocio, touchField: touchNegocio, clearErrors: clearNegocio } = useFormValidation(schemas.negocio)

  // ── Effects ───────────────────────────────────────────────
  useEffect(() => {
    if (negocioActivoGlobal) setNegocioAct(negocioActivoGlobal)
  }, [negocioActivoGlobal])

  useEffect(() => {
    if (negocios.length === 0) return
    const activo = negocios.find(n => n.id === negocioActivo) || negocios[0]
    if (activo) {
      if (!negocioActivo || negocioActivo !== activo.id) setNegocioAct(activo.id)
      cargarDatosNegocio(activo)
    }
  }, [negocios]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────
  const handleSeleccionarNegocio = (negocio) => {
    setNegocioAct(negocio.id)
    cambiarNegocio(negocio.id)
    cargarDatosNegocio(negocio)
  }

  const handleCrearEmpleado = async (e) => {
    e.preventDefault()
    if (!validateUser(formUser)) return
    const ok = await handleCrearUsuario(formUser, negocioActivo)
    if (ok) {
      setFormUser({ username: '', email: '', password: '', nombre: '', rol: 'EMPLEADO' })
      clearUser()
      setShowFormUser(false)
    }
  }

  const handleCambiarRolLocal = async (usuario) => {
    if (usuario.rol === 'SUPER_ADMIN') {
      toast.error('🔒 No se puede cambiar el rol del SUPER_ADMIN')
      return
    }
    if (usuario.username === username && usuario.rol === 'ADMIN') {
      toast.error('⚠️ No puedes cambiar tu propio rol — perderías el acceso al panel')
      return
    }
    const nuevoRol = usuario.rol === 'EMPLEADO' ? 'ADMIN' : 'EMPLEADO'
    await handleCambiarRol(usuario, nuevoRol)
  }

  const handleDeleteUserConfirm = async () => {
    if (!deleteTarget) return
    const ok = await handleEliminarUsuario(deleteTarget)
    if (ok) setDeleteTarget(null)
  }

  const handleAsignarNegocio = async (e) => {
    e?.preventDefault()
    if (!assignTarget || !assignNegocioId) return
    setSavingAssign(true)
    const ok = await asignarNegocioUsuario(Number(assignTarget.id), Number(assignNegocioId), assignTarget.username)
    if (ok) { setAssignTarget(null); setAssignNegocioId('') }
    setSavingAssign(false)
  }

  const handleCrearNegocioLocal = async (e) => {
    e.preventDefault()
    if (!validateNegocio(formNuevoNegocio)) return
    setSavingNuevoNeg(true)
    try {
      const nuevo = await handleCrearNegocio({ ...formNuevoNegocio, nombre: formNuevoNegocio.nombre.trim() })
      toast.success(`Negocio "${formNuevoNegocio.nombre.trim()}" creado`)
      setFormNuevoNegocio({ nombre: '', giro: '' })
      clearNegocio()
      setShowFormNegocio(false)
      await cargarNegocios()
      if (nuevo?.id) cambiarNegocio(nuevo.id)
    } catch (err) {
      const status = err?.response?.status
      if (status === 409)      toast.error('Ya existe un negocio con ese nombre')
      else if (status === 403) toast.error('No tienes permiso para crear negocios')
      else                     toast.error('No se pudo crear el negocio. Intenta de nuevo')
    } finally {
      setSavingNuevoNeg(false)
    }
  }

  const handleEliminarNegocioConfirm = async () => {
    if (!deleteNegocioTarget) return
    setDeletingNegocio(true)
    try {
      await eliminarNegocio(deleteNegocioTarget.id)
      toast.success(`Negocio "${deleteNegocioTarget.nombre}" eliminado`)
      setDeleteNegocioTarget(null)
      await cargarNegocios()
    } catch (err) {
      const status = err?.status
      if (status === 409)      toast.error('No se puede eliminar: el negocio tiene productos o usuarios asociados')
      else if (status === 403) toast.error('No tienes permiso para eliminar negocios')
      else                     toast.error('No se pudo eliminar el negocio. Intenta de nuevo')
    } finally {
      setDeletingNegocio(false)
    }
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <PageLayout
        title="Configuración"
        subtitle="Administra tu negocio, usuarios y preferencias."
        actions={
          <Button onClick={guardarNegocio} disabled={savingNegocio} className="gap-2 rounded-xl shadow-md">
            {savingNegocio ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {savingNegocio ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        }
      >
        {/* KPIs */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          <AuroraStatCard icon={Shield}    label="Rol Actual" value={rol}            sub="nivel de acceso" glow="violet"  delay={80}  />
          <AuroraStatCard icon={User}      label="Usuario"    value={username}       sub="sesión activa"   glow="cyan"    delay={160} />
          {isAdmin && <AuroraStatCard icon={Users}     label="Usuarios"  value={usuarios.length} sub="en el negocio" glow="emerald" delay={240} />}
          {isAdmin && <AuroraStatCard icon={Building2} label="Negocios"  value={negocios.length} sub="vinculados"    glow="amber"   delay={320} />}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="negocio" className="w-full">
          <TabsList className="mb-6 flex h-auto flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
            <TabsTrigger value="negocio"  className="rounded-lg px-4 py-2 text-sm font-semibold">Negocio</TabsTrigger>
            <TabsTrigger value="perfil"   className="rounded-lg px-4 py-2 text-sm font-semibold">Perfil</TabsTrigger>
            {isAdmin && <TabsTrigger value="usuarios" className="rounded-lg px-4 py-2 text-sm font-semibold">Usuarios</TabsTrigger>}
          </TabsList>

          <TabsContent value="negocio" className="space-y-6">
            <TabNegocio
              formNegocio={formNegocio}
              updateField={updateField}
              uploadingLogo={uploadingLogo}
              handleSubirLogo={handleSubirLogo}
              negocios={negocios}
              negocioActivo={negocioActivo}
              isAdmin={isAdmin}
              isSuperAdmin={isSuperAdmin}
              onSeleccionarNegocio={handleSeleccionarNegocio}
              onNuevoNegocio={() => setShowFormNegocio(true)}
              onEliminarNegocio={setDeleteNegocioTarget}
            />
          </TabsContent>

          <TabsContent value="perfil">
            <TabPerfil username={username} rol={rol} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="usuarios">
              <TabUsuarios
                usuarios={usuarios}
                loadingUsuarios={loadingUsuarios}
                currentUsername={username}
                onNuevoUsuario={() => setShowFormUser(true)}
                onToggleActivo={handleToggleActivo}
                onCambiarRol={handleCambiarRolLocal}
                onEliminar={setDeleteTarget}
                onAsignarNegocio={user => { setAssignTarget(user); setAssignNegocioId('') }}
                onQuitarNegocio={quitarNegocioUsuario}
              />
            </TabsContent>
          )}
        </Tabs>
      </PageLayout>

      {/* ── Sheets ── */}
      <CrearNegocioSheet
        open={showFormNegocio}
        onOpenChange={setShowFormNegocio}
        formNuevoNegocio={formNuevoNegocio}
        setFormNuevoNegocio={setFormNuevoNegocio}
        saving={savingNuevoNeg}
        onSubmit={handleCrearNegocioLocal}
        onCancel={() => setShowFormNegocio(false)}
        errNegocio={errNegocio}
        touchNegocio={touchNegocio}
      />

      <CrearUsuarioSheet
        open={showFormUser}
        onOpenChange={setShowFormUser}
        formUser={formUser}
        setFormUser={setFormUser}
        saving={savingUser}
        onSubmit={handleCrearEmpleado}
        onCancel={() => { setShowFormUser(false); clearUser() }}
        errUser={errUser}
        touchUser={touchUser}
      />

      <AsignarNegocioSheet
        open={!!assignTarget}
        onOpenChange={open => !open && setAssignTarget(null)}
        assignTarget={assignTarget}
        assignNegocioId={assignNegocioId}
        setAssignNegocioId={setAssignNegocioId}
        negocios={negocios}
        saving={savingAssign}
        onSubmit={handleAsignarNegocio}
        onCancel={() => setAssignTarget(null)}
      />

      {/* ── Dialogs de confirmación ── */}
      <ConfirmarEliminarDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
        icon={<Trash2 size={28} className="text-red-600" />}
        title="¿Eliminar usuario?"
        description={<>Se eliminará <span className="font-semibold text-foreground">"{deleteTarget?.username}"</span> permanentemente.</>}
        onConfirm={handleDeleteUserConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmarEliminarDialog
        open={!!deleteNegocioTarget}
        onOpenChange={open => !open && setDeleteNegocioTarget(null)}
        icon={<Building2 size={28} className="text-red-600" />}
        title="¿Eliminar negocio?"
        description={<>Se eliminará <span className="font-semibold text-foreground">"{deleteNegocioTarget?.nombre}"</span> permanentemente. Esta acción no se puede deshacer.     Antes de eliminar este negocio, debes eliminar todos los productos, movimientos y proveedores asociados.</>}
        loading={deletingNegocio}
        onConfirm={handleEliminarNegocioConfirm}
        onCancel={() => setDeleteNegocioTarget(null)}
      />
    </TooltipProvider>
  )
}

export default ConfiguracionDashboard
