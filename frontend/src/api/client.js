import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('hg_token');
      localStorage.removeItem('hg_master_token');
      localStorage.removeItem('hg_impersonating_clinic');
      if (window.location.pathname.startsWith('/app') || window.location.pathname.startsWith('/master')) {
        window.location.href = '/entrar';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
