import { fetchApi, getNegocioId } from './config';

/* ── Categorías ───────────────────────────────────────────── */

export const getCategorias = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/categorias/negocio/${negocioId}`);
};

export const crearCategoria = (categoria) => {
  const negocioId = getNegocioId();
  return fetchApi('/categorias', {
    method: 'POST',
    body: JSON.stringify({ ...categoria, negocioId: Number(negocioId) }),
  });
};

export const actualizarCategoria = (id, categoria) =>
  fetchApi(`/categorias/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoria),
  });

export const eliminarCategoria = (id) =>
  fetchApi(`/categorias/${id}`, { method: 'DELETE' });
