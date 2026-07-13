import axios from 'axios';

/**
 * Instância axios centralizada.
 * Adiciona automaticamente o token JWT no header Authorization em toda requisição.
 * Redireciona para /login se o token expirar (401/403).
 */
const api = axios.create({
  baseURL: `http://${window.location.hostname}:3001/api`,
});

// Interceptor de request: injeta o Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: redireciona ao login se token inválido/expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
