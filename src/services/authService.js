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
