// File: src/utils/api.js

export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('gymSaaS_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const config = {
        cache: 'no-store',
        ...options,
        headers,
    };

    // Replace API URL endpoint prefix dynamically if needed, 
    // assuming default localhost:3001 for dev
    const baseUrl = 'http://localhost:3001';

    try {
        const response = await fetch(`${baseUrl}${endpoint}`, config);

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('gymSaaS_token');
                localStorage.removeItem('gymSaaS_info');
                window.location.href = '/login';
            }
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (err) {
        throw err;
    }
};
