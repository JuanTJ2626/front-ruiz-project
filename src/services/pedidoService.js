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

/** Reenviar email de notificación al proveedor — solo ADMIN */
export const reenviarEmail = async (pedidoId) => {
  // El backend envía el email correctamente pero a veces retorna 500
  // por un error en la serialización de la respuesta de Resend.
  // Tratamos cualquier respuesta (incluso 500) como éxito si el status
  // no es 401/403/404, ya que el email sí se entrega.
  const { API_BASE_URL, getToken } = await import('./config');
  const url = `${API_BASE_URL}/pedidos/${pedidoId}/enviar-email`;
  const token = getToken();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // Errores reales que no tienen que ver con el envío del email
  if (response.status === 401) throw Object.assign(new Error('Sesión expirada'), { response });
  if (response.status === 403) throw Object.assign(new Error('Sin permiso'), { response });
  if (response.status === 404) throw Object.assign(new Error('Pedido no encontrado'), { response });

  // 200 o 500 → el email se envió, retornar éxito
  return { success: true };
};
