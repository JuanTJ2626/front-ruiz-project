import { fetchApi, getNegocioId } from './config';

/* ── Movimientos de Stock ─────────────────────────────────── */
// tipos: 'ENTRADA' | 'SALIDA' | 'AJUSTE'

/** Registrar un movimiento */
export const registrarMovimiento = ({ tipo, cantidad, motivo, productoId, usuarioId }) =>
  fetchApi('/movimientos', {
    method: 'POST',
    body: JSON.stringify({ tipo, cantidad, motivo, productoId, usuarioId }),
  });

/** Historial de movimientos de un producto */
export const getMovimientosProducto = (productoId) =>
  fetchApi(`/movimientos/producto/${productoId}`);

/** Últimos movimientos del negocio */
export const getMovimientosNegocio = (limite = 20) => {
  const negocioId = getNegocioId();
  return fetchApi(`/movimientos/negocio/${negocioId}?limite=${limite}`);
};

/** Un movimiento por ID */
export const getMovimiento = (id) => fetchApi(`/movimientos/${id}`);
