import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hg_impersonating_clinic') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    // Se veio de um redirecionamento externo (ex: site institucional) com ?token=...,
    // usa esse token, limpa qualquer sessão de impersonation antiga e limpa a URL.
    const params = new URLSearchParams(window.location.search);
    const incomingToken = params.get('token');
    if (incomingToken) {
      localStorage.setItem('hg_token', incomingToken);
      localStorage.removeItem('hg_master_token');
      localStorage.removeItem('hg_impersonating_clinic');
      setImpersonating(null);
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

  async function register(nome, email, senha, nomeClinica) {
    const { data } = await api.post('/auth/register', { nome, email, senha, nomeClinica });
    localStorage.setItem('hg_token', data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('hg_token');
    localStorage.removeItem('hg_master_token');
    localStorage.removeItem('hg_impersonating_clinic');
    setUser(null);
    setImpersonating(null);
  }

  // Master "acessa como" uma clínica: guarda o token Master original,
  // troca o token ativo pelo de impersonation e navega para /app.
  async function startImpersonation(clinicId) {
    const masterToken = localStorage.getItem('hg_token');
    const { data } = await api.post(`/master/clinicas/${clinicId}/impersonate`);
    localStorage.setItem('hg_master_token', masterToken);
    localStorage.setItem('hg_token', data.token);
    localStorage.setItem('hg_impersonating_clinic', JSON.stringify(data.clinic));
    setImpersonating(data.clinic);
    return data.clinic;
  }

  // Volta para o token Master original, saindo do modo "acessar como clínica".
  function stopImpersonation() {
    const masterToken = localStorage.getItem('hg_master_token');
    if (masterToken) localStorage.setItem('hg_token', masterToken);
    localStorage.removeItem('hg_master_token');
    localStorage.removeItem('hg_impersonating_clinic');
    setImpersonating(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, impersonating, startImpersonation, stopImpersonation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
