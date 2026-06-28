import { fetchApi } from './config';

/* ── Atributos personalizados de productos ────────────────── */

/** Ver todos los atributos de un producto */
export const getAtributos = (productoId) =>
  fetchApi(`/productos/${productoId}/atributos`);

/** Agregar o actualizar un atributo — solo ADMIN */
export const crearAtributo = (productoId, { clave, valor }) =>
  fetchApi(`/productos/${productoId}/atributos`, {
    method: 'POST',
    body: JSON.stringify({ clave, valor }),
  });

/** Guardar varios atributos a la vez — solo ADMIN */
export const crearAtributosLote = (productoId, atributos) =>
  // atributos = [{ clave, valor }, ...]
  fetchApi(`/productos/${productoId}/atributos/lote`, {
    method: 'POST',
    body: JSON.stringify(atributos),
  });

/** Eliminar un atributo por ID — solo ADMIN */
export const eliminarAtributo = (productoId, atributoId) =>
  fetchApi(`/productos/${productoId}/atributos/${atributoId}`, {
    method: 'DELETE',
  });

/** Eliminar todos los atributos de un producto — solo ADMIN */
export const eliminarTodosAtributos = (productoId) =>
  fetchApi(`/productos/${productoId}/atributos`, {
    method: 'DELETE',
  });
