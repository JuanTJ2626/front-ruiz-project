import { fetchApi, getNegocioId, API_BASE_URL, getToken } from './config';

/* ── Dashboard ────────────────────────────────────────────── */

/** Métricas del inventario */
export const getDashboard = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/dashboard/negocio/${negocioId}`);
};

/** Helper interno para descargas con token */
const descargarArchivo = (url, filename) => {
  const token = getToken();
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => {
      if (!r.ok) throw new Error('No tienes permiso para descargar este archivo');
      return r.blob();
    })
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    });
};

/** Descargar reporte CSV */
export const exportarCSV = () => {
  const negocioId = getNegocioId();
  descargarArchivo(`${API_BASE_URL}/dashboard/negocio/${negocioId}/exportar/csv`, 'inventario.csv');
};

/** Descargar reporte PDF */
export const exportarPDF = () => {
  const negocioId = getNegocioId();
  descargarArchivo(`${API_BASE_URL}/dashboard/negocio/${negocioId}/exportar/pdf`, 'inventario.pdf');
};

/** Descargar reporte Excel (.xlsx) */
export const exportarExcel = () => {
  const negocioId = getNegocioId();
  descargarArchivo(`${API_BASE_URL}/dashboard/negocio/${negocioId}/exportar/excel`, 'inventario.xlsx');
};
