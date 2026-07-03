import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Se veio de um redirecionamento externo (ex: site institucional) com ?token=...,
    // usa esse token e limpa a URL.
    const params = new URLSearchParams(window.location.search);
    const incomingToken = params.get('token');
    if (incomingToken) {
      localStorage.setItem('hg_token', incomingToken);
      params.delete('token');
      const cleanUrl = window.location.pathname + (params.toString() ? `?${params}` : '');
      window.history.replaceState({}, '', cleanUrl);
    }

    const token = localStorage.getItem('hg_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => { localStorage.removeItem('hg_token'); })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, senha) {
    const { data } = await api.post('/auth/login', { email, senha });
    localStorage.setItem('hg_token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(nome, email, senha) {
    const { data } = await api.post('/auth/register', { nome, email, senha });
    localStorage.setItem('hg_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('hg_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
