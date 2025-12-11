// Configuração da API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper para fazer fetch com autenticação
export function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}

// Helper para upload de arquivos (FormData)
export function apiUpload(endpoint, formData, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    ...options,
    headers,
    body: formData,
  });
}
