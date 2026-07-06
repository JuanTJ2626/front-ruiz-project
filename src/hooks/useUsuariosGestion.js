import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  getUsuarios,
  crearEmpleado,
  cambiarRol,
  cambiarEstadoUsuario,
  eliminarUsuario,
  asignarNegocio,
} from '../services/usuarioService';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook para gestionar usuarios en ConfiguracionDashboard.
 * Encapsula toda la lógica de estado y operaciones CRUD de usuarios.
 * 
 * @returns {Object} Estado y funciones de gestión de usuarios
 */
export function useUsuariosGestion() {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const { handleError } = useErrorHandler();

  // Carga inicial de usuarios
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

  // Crear nuevo usuario
  const handleCrearUsuario = useCallback(async (formData) => {
    if (!formData.username?.trim() || !formData.password?.trim()) {
      toast.error('Usuario y contraseña son obligatorios');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    setSavingUser(true);
    try {
      await crearEmpleado({
        username: formData.username.trim(),
        password: formData.password,
        email: formData.email || undefined,
        nombre: formData.nombre || undefined,
        rol: formData.rol || 'EMPLEADO',
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

  // Cambiar rol de usuario
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

  // Activar/Desactivar usuario
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

  // Eliminar usuario
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

  // Asignar negocio a usuario
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
  };
}
