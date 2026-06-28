import { fetchApi, getNegocioId } from './config';

/* ── Productos ────────────────────────────────────────────── */

/** Todos los productos del negocio actual */
export const getProductos = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/productos/negocio/${negocioId}`);
};

/** Productos con stock crítico del negocio actual */
export const getProductosBajoStock = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/productos/bajo-stock/${negocioId}`);
};

/** Productos por categoría */
export const getProductosPorCategoria = (catId) => {
  const negocioId = getNegocioId();
  return fetchApi(`/productos/categoria/${catId}/negocio/${negocioId}`);
};

/** Buscar productos por nombre en el negocio */
export const buscarProductos = (nombre) => {
  const negocioId = getNegocioId();
  return fetchApi(`/productos/buscar/negocio/${negocioId}?nombre=${encodeURIComponent(nombre)}`);
};

/** Un producto por ID */
export const getProducto = (id) => fetchApi(`/productos/${id}`);

/** Crear producto — negocioId se agrega automáticamente */
export const crearProducto = (producto) => {
  const negocioId = getNegocioId();
  return fetchApi('/productos', {
    method: 'POST',
    body: JSON.stringify({ ...producto, negocioId: Number(negocioId) }),
  });
};

/** Actualizar producto */
export const actualizarProducto = (id, producto) => {
  const negocioId = getNegocioId();
  return fetchApi(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...producto, negocioId: Number(negocioId) }),
  });
};

/** Eliminar producto */
export const eliminarProducto = (id) =>
  fetchApi(`/productos/${id}`, { method: 'DELETE' });
