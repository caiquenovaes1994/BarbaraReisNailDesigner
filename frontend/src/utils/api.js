import axios from 'axios';

/**
 * Instância axios centralizada.
 * Envia o cookie HTTP-Only em toda requisição com withCredentials.
 * Redireciona para /login se a sessão expirar (401/403).
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : `http://${window.location.hostname}:3001/api`,
  withCredentials: true,
});

// Interceptor de response: redireciona ao login se token inválido/expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Ignora o redirecionamento se estivermos na rota de login e o erro for de credenciais
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
