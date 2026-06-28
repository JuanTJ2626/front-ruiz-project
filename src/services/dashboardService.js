import { fetchApi, getNegocioId, API_BASE_URL, getToken } from './config';

/* ── Dashboard ────────────────────────────────────────────── */

/** Métricas del inventario */
export const getDashboard = () => {
  const negocioId = getNegocioId();
  return fetchApi(`/dashboard/negocio/${negocioId}`);
};

/** Descargar reporte CSV */
export const exportarCSV = () => {
  const negocioId = getNegocioId();
  const token = getToken();
  const url = `${API_BASE_URL}/dashboard/negocio/${negocioId}/exportar/csv`;
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('Authorization', `Bearer ${token}`);
  // Mejor con fetch para incluir el header del token:
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'inventario.csv';
      link.click();
    });
};

/** Descargar reporte PDF */
export const exportarPDF = () => {
  const negocioId = getNegocioId();
  const token = getToken();
  const url = `${API_BASE_URL}/dashboard/negocio/${negocioId}/exportar/pdf`;
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then(r => r.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'inventario.pdf';
      link.click();
    });
};
