import { fetchApi, getNegocioId } from './config';

/* ── Usuarios ─────────────────────────────────────────────── */

/** Listar usuarios del negocio — solo ADMIN */
export const getUsuarios = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/usuarios/negocio/${negocioId}`);
};

/** Ver un usuario */
export const getUsuario = (id) => fetchApi(`/usuarios/${id}`);

/** Editar perfil */
export const actualizarUsuario = (id, datos) =>
  fetchApi(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) });

/** Cambiar rol — solo ADMIN */
export const cambiarRol = (id, rol) =>
  fetchApi(`/usuarios/${id}/rol?rol=${rol}`, { method: 'PUT' });

/** Activar / desactivar usuario — solo ADMIN */
export const cambiarEstadoUsuario = (id, activo) =>
  fetchApi(`/usuarios/${id}/estado?activo=${activo}`, { method: 'PUT' });

/** Eliminar usuario — solo ADMIN */
export const eliminarUsuario = (id) =>
  fetchApi(`/usuarios/${id}`, { method: 'DELETE' });

/** Crear empleado (usa /auth/register con negocioId y rol) — solo ADMIN */
export const crearEmpleado = (datos) =>
  fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(datos) });

/** Asignar negocio a un usuario — solo ADMIN */
export const asignarNegocio = (usuarioId, negocioId) =>
  fetchApi(`/usuarios/${usuarioId}/negocio?negocioId=${negocioId}`, { method: 'PUT' });


