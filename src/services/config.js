export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/* Helpers para localStorage */
export const getToken    = () => localStorage.getItem('token');
export const getNegocioId = () => localStorage.getItem('negocioId');
export const getUsuarioId = () => localStorage.getItem('usuarioId');
export const getUsername  = () => localStorage.getItem('username');
export const getRol       = () => localStorage.getItem('rol');

/**
 * Cliente HTTP base — agrega Bearer token automáticamente.
 * Lanza un Error con el mensaje del backend en caso de fallo.
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = getToken();
  if (token) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  } else {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorData;
    try { errorData = await response.json(); } 
    catch { errorData = { mensaje: 'Error en el servidor' }; }
    throw new Error(errorData.mensaje || errorData.message || `Error ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
};
