import { fetchApi, getNegocioId } from './config';

/* ── Proveedores ──────────────────────────────────────────── */

export const getProveedores = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/proveedores/negocio/${negocioId}`);
};

export const getProveedor = (id) => fetchApi(`/proveedores/${id}`);

export const crearProveedor = (proveedor) => {
  const negocioId = getNegocioId();
  return fetchApi('/proveedores', {
    method: 'POST',
    body: JSON.stringify({ ...proveedor, negocioId: Number(negocioId) }),
  });
};

export const actualizarProveedor = (id, proveedor) =>
  fetchApi(`/proveedores/${id}`, {
    method: 'PUT',
    body: JSON.stringify(proveedor),
  });

export const eliminarProveedor = (id) =>
  fetchApi(`/proveedores/${id}`, { method: 'DELETE' });

export const vincularProducto = (provId, prodId) =>
  fetchApi(`/proveedores/${provId}/producto/${prodId}`, { method: 'POST' });

export const desvincularProducto = (provId, prodId) =>
  fetchApi(`/proveedores/${provId}/producto/${prodId}`, { method: 'DELETE' });
