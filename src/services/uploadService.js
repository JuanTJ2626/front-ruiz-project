import { API_BASE_URL, getToken } from './config';

/* ── Upload de imágenes ───────────────────────────────────── */

/**
 * Sube una imagen usando FormData (multipart/form-data).
 * Devuelve { url, mensaje }
 */
const uploadArchivo = async (endpoint, archivo) => {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      // NO incluir Content-Type — el browser lo pone con boundary automáticamente
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 403) throw new Error('No tienes permiso para subir imágenes');
    let err;
    try { err = await response.json(); } catch { err = {}; }
    throw new Error(err.mensaje || `Error ${response.status}`);
  }

  return response.json(); // { url, mensaje }
};

/** Sube imagen de un producto — devuelve { url } */
export const subirImagenProducto = (archivo) =>
  uploadArchivo('/upload/producto', archivo);

/** Sube logo del negocio — devuelve { url } */
export const subirLogoNegocio = (archivo) =>
  uploadArchivo('/upload/negocio', archivo);

/** Elimina imagen de producto por nombre de archivo */
export const eliminarImagenProducto = async (nombre) => {
  const response = await fetch(`${API_BASE_URL}/upload/producto/${encodeURIComponent(nombre)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('No tienes permiso para eliminar imágenes');
    throw new Error(`Error ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
};
