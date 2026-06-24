import { fetchApi } from './config';

export const getProductos = async () => {
    return fetchApi('/productos');
};

export const crearProducto = async (producto) => {
    return fetchApi('/productos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
    });
};

export const actualizarProducto = async (id, producto) => {
    return fetchApi(`/productos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
    });
};

export const eliminarProducto = async (id) => {
    return fetchApi(`/productos/${id}`, {
        method: 'DELETE',
    });
};
