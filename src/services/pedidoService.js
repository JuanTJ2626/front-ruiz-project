import { fetchApi, getNegocioId } from './config';

/* ── Pedidos a proveedores ────────────────────────────────── */
// Estados: PENDIENTE → ENVIADO → RECIBIDO | CANCELADO

/** Todos los pedidos del negocio */
export const getPedidos = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/pedidos/negocio/${negocioId}`);
};

/** Solo pedidos pendientes */
export const getPedidosPendientes = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/pedidos/negocio/${negocioId}/pendientes`);
};

/** Filtrar por estado */
export const getPedidosPorEstado = (estado) => {
  const negocioId = getNegocioId();
  return fetchApi(`/pedidos/negocio/${negocioId}/estado/${estado}`);
};

/** Pedidos de un proveedor específico */
export const getPedidosProveedor = (proveedorId) =>
  fetchApi(`/pedidos/proveedor/${proveedorId}`);

/** Un pedido por ID */
export const getPedido = (id) => fetchApi(`/pedidos/${id}`);

/** Crear pedido — solo ADMIN */
export const crearPedido = (pedido) =>
  fetchApi('/pedidos', {
    method: 'POST',
    body: JSON.stringify(pedido),
  });

/** Actualizar pedido — solo ADMIN */
export const actualizarPedido = (id, pedido) =>
  fetchApi(`/pedidos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(pedido),
  });

/**
 * Cambiar estado del pedido — solo ADMIN
 * Si estado=RECIBIDO y tiene productoId, el backend sube el stock automáticamente
 * @param {number} id
 * @param {'PENDIENTE'|'ENVIADO'|'RECIBIDO'|'CANCELADO'} estado
 */
export const cambiarEstadoPedido = (id, estado) =>
  fetchApi(`/pedidos/${id}/estado?estado=${estado}`, {
    method: 'PATCH',
  });

/** Eliminar pedido — solo ADMIN */
export const eliminarPedido = (id) =>
  fetchApi(`/pedidos/${id}`, { method: 'DELETE' });
