import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/app');
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          <div className="sidebar-brand-mark" style={{ background: '#017A5B', color: '#fff' }}>HG</div>
          <strong>Hub Gestão Integrada</strong>
        </Link>
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-sub">Acesse o painel da sua clínica.</p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@suaclinica.com.br" />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" required value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
          {erro && <div className="auth-error">{erro}</div>}
          <button className="btn btn-primary" type="submit" disabled={carregando} style={{ justifyContent: 'center' }}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-footer">
          Ainda não tem conta? <Link to="/criar-conta">Criar conta grátis</Link>
        </p>
        <p className="auth-hint">
          Conta de teste: <strong>jonathan@clinicavitoria.com.br</strong> / senha <strong>clinica123</strong>
        </p>
      </div>
    </div>
  );
}
