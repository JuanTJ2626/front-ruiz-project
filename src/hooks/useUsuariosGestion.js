import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getUsuarios,
  crearUsuario,
  cambiarRol,
  cambiarEstadoUsuario,
  eliminarUsuario,
  asignarNegocio,
  quitarNegocio,
} from '../services/usuarioService';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook para gestionar usuarios en ConfiguracionDashboard.
 * Encapsula toda la lógica de estado y operaciones CRUD de usuarios.
 */
export function useUsuariosGestion() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const { handleError } = useErrorHandler();

  // Carga todos los usuarios (GET /api/usuarios)
  const cargarUsuarios = useCallback(async () => {
    try {
      setLoadingUsuarios(true);
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err, {
        operation: 'cargar los usuarios',
        forbiddenMsg: 'No tienes permiso para ver la lista de usuarios',
      });
      setUsuarios([]);
    } finally {
      setLoadingUsuarios(false);
    }
  }, [handleError]);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // Crear usuario con negocioId incluido en el body (POST /api/auth/register)
  const handleCrearUsuario = useCallback(async (formData, negocioId) => {
    if (!negocioId) {
      toast.error('No se pudo determinar el negocio activo');
      return false;
    }

    setSavingUser(true);
    try {
      // username = email (ya viene sincronizado desde el formulario)
      await crearUsuario({
        username:  formData.email.trim(),
        password:  formData.password,
        email:     formData.email.trim(),
        nombre:    formData.nombre  || undefined,
        rol:       formData.rol     || 'EMPLEADO',
        negocioId: Number(negocioId),
      });
      toast.success(`Usuario "${formData.username.trim()}" creado como ${formData.rol || 'EMPLEADO'}`);
      await cargarUsuarios();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'crear el usuario',
        conflictMsg: 'Ya existe un usuario con ese nombre o correo',
        validationMsg: 'Verifica que el nombre de usuario sea válido',
      });
      return false;
    } finally {
      setSavingUser(false);
    }
  }, [cargarUsuarios, handleError]);

  // Cambiar rol (PUT /api/usuarios/{id}/rol?rol=ADMIN)
  const handleCambiarRol = useCallback(async (usuario, nuevoRol) => {
    try {
      await cambiarRol(usuario.id, nuevoRol);
      toast.success(`Rol de ${usuario.username} actualizado a ${nuevoRol}`);
      await cargarUsuarios();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'cambiar el rol del usuario',
        forbiddenMsg: 'No tienes permiso para cambiar roles',
      });
      return false;
    }
  }, [cargarUsuarios, handleError]);

  // Activar/Desactivar (PUT /api/usuarios/{id}/estado?activo=true)
  const handleToggleActivo = useCallback(async (usuario) => {
    try {
      await cambiarEstadoUsuario(usuario.id, !usuario.activo);
      const estado = usuario.activo ? 'desactivado' : 'activado';
      toast.success(`Usuario ${usuario.username} ${estado}`);
      await cargarUsuarios();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'cambiar el estado del usuario',
        forbiddenMsg: 'No tienes permiso para activar/desactivar usuarios',
      });
      return false;
    }
  }, [cargarUsuarios, handleError]);

  // Eliminar (DELETE /api/usuarios/{id})
  const handleEliminarUsuario = useCallback(async (usuario) => {
    try {
      await eliminarUsuario(usuario.id);
      toast.success(`Usuario ${usuario.username} eliminado`);
      await cargarUsuarios();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'eliminar el usuario',
        conflictMsg: 'No se puede eliminar porque el usuario tiene registros asociados',
        forbiddenMsg: 'No tienes permiso para eliminar usuarios',
      });
      return false;
    }
  }, [cargarUsuarios, handleError]);

  // Asignar negocio (PUT /api/usuarios/{id}/negocio?negocioId=1)
  const handleAsignarNegocio = useCallback(async (usuarioId, negocioId, targetUsername) => {
    try {
      await asignarNegocio(usuarioId, negocioId);
      toast.success(`Negocio asignado a ${targetUsername}`);
      await cargarUsuarios();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'asignar el negocio',
        forbiddenMsg: 'No tienes permiso para asignar negocios',
        notFoundMsg: 'El usuario o negocio no existe',
      });
      return false;
    }
  }, [cargarUsuarios, handleError]);

  // Quitar negocio (DELETE /api/usuarios/{id}/negocio)
  const handleQuitarNegocio = useCallback(async (usuarioId, targetUsername) => {
    try {
      await quitarNegocio(usuarioId);
      toast.success(`Negocio quitado de ${targetUsername}`);
      await cargarUsuarios();
      return true;
    } catch (err) {
      handleError(err, {
        operation: 'quitar el negocio',
        forbiddenMsg: 'No tienes permiso para quitar negocios',
        notFoundMsg: 'El usuario no existe',
      });
      return false;
    }
  }, [cargarUsuarios, handleError]);

  return {
    usuarios,
    loadingUsuarios,
    savingUser,
    cargarUsuarios,
    handleCrearUsuario,
    handleCambiarRol,
    handleToggleActivo,
    handleEliminarUsuario,
    handleAsignarNegocio,
    handleQuitarNegocio,
  };
}
