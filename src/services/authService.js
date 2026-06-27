import { fetchApi } from './config';

export const loginUser = async (credentials) => {
    return fetchApi('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
};

export const registerUser = async (userData) => {
    return fetchApi('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
};

export const setAuthData = (token, username, rol, negocioId) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    if (rol) localStorage.setItem('rol', rol);
    if (negocioId) localStorage.setItem('negocioId', negocioId.toString());
};

export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('rol');
    localStorage.removeItem('negocioId');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};
