// src/services/config.js

// Vite expone las variables de entorno usando import.meta.env
// Si no existe, usamos localhost por defecto para evitar errores
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Utilidad básica para hacer peticiones si quisieras agregar tokens en el futuro.
 */
export const fetchApi = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Aquí puedes interceptar peticiones para añadir tokens de autorización
    // const token = localStorage.getItem('token');
    // if (token) {
    //   options.headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    // }

    const response = await fetch(url, options);
    
    // Manejo de errores básicos (se omite para DELETE con 204 No Content)
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: 'Ocurrió un error en el servidor' };
        }
        throw new Error(errorData.message || 'Error en la petición');
    }
    
    if (response.status === 204) return null;
    return response.json();
};
