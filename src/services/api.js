const API_URL = 'http://localhost:8080/api/productos';

export const getProductos = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener productos');
    return response.json();
};

export const crearProducto = async (producto) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return response.json();
};

export const actualizarProducto = async (id, producto) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto),
    });
    if (!response.ok) throw new Error('Error al actualizar producto');
    return response.json();
};

export const eliminarProducto = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
};
