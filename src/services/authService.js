import { fetchApi } from './config';

/* ── Auth ─────────────────────────────────────────────────── */

export const loginUser = (credentials) =>
  fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });

export const registerUser = (userData) =>
  fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(userData) });

/* Guarda todos los datos de sesión tras login/register */
export const setAuthData = ({ token, username, rol, negocioId, id }) => {
  localStorage.setItem('token',     token);
  localStorage.setItem('username',  username);
  if (rol)       localStorage.setItem('rol',       rol);
  if (negocioId) localStorage.setItem('negocioId', String(negocioId));
  if (id)        localStorage.setItem('usuarioId', String(id));
};

export const clearAuthData = () => {
  ['token', 'username', 'rol', 'negocioId', 'usuarioId'].forEach(k =>
    localStorage.removeItem(k)
  );
};

export const isAuthenticated = () => !!localStorage.getItem('token');
