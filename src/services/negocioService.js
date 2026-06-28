import { fetchApi, getUsuarioId } from './config';

/* ── Negocios ─────────────────────────────────────────────── */

export const getNegociosUsuario = () => {
  const usuarioId = getUsuarioId();
  return fetchApi(`/negocios/usuario/${usuarioId}`);
};

export const getNegocio = (id) => fetchApi(`/negocios/${id}`);

export const crearNegocio = (negocio) => {
  const usuarioId = getUsuarioId();
  return fetchApi(`/negocios/usuario/${usuarioId}`, {
    method: 'POST',
    body: JSON.stringify(negocio),
  });
};

export const actualizarNegocio = (id, negocio) =>
  fetchApi(`/negocios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(negocio),
  });

export const eliminarNegocio = (id) =>
  fetchApi(`/negocios/${id}`, { method: 'DELETE' });
