import { fetchApi } from './config';

/* ── Usuarios ─────────────────────────────────────────────── */

/**
 * Listar TODOS los usuarios — solo ADMIN
 * GET /api/usuarios
 * Devuelve: [{ id, username, email, nombre, rol, activo, negocioId, negocioNombre }]
 */
export const getUsuarios = () => fetchApi('/usuarios');

/** Ver un usuario por ID */
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

/**
 * Crear usuario (empleado o admin) — solo ADMIN
 * POST /api/auth/register
 * Body: { username, password, email?, nombre?, rol, negocioId }
 */
export const crearUsuario = (datos) =>
  fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(datos) });

/**
 * Asignar negocio a un usuario — solo ADMIN
 * PUT /api/usuarios/{id}/negocio?negocioId=1
 */
export const asignarNegocio = (usuarioId, negocioId) =>
  fetchApi(`/usuarios/${usuarioId}/negocio?negocioId=${negocioId}`, { method: 'PUT' });

/**
 * Quitar negocio de un usuario — solo ADMIN
 * DELETE /api/usuarios/{id}/negocio
 */
export const quitarNegocio = (usuarioId) =>
  fetchApi(`/usuarios/${usuarioId}/negocio`, { method: 'DELETE' });
