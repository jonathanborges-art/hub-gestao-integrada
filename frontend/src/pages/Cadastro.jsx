import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Cadastro() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [nomeClinica, setNomeClinica] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await register(nome, email, senha, nomeClinica);
      navigate('/app');
    } catch (err) {
      setErro(err.response?.data?.error || 'Não foi possível criar a conta. Tente novamente.');
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
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-sub">Cada conta cria uma clínica nova, com dados totalmente separados das demais.</p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label>Nome da clínica</label>
            <input required value={nomeClinica} onChange={e => setNomeClinica(e.target.value)} placeholder="Ex: Clínica Vida Plena" />
          </div>
          <div className="field">
            <label>Seu nome completo</label>
            <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@suaclinica.com.br" />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" required minLength={6} value={senha} onChange={e => setSenha(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          {erro && <div className="auth-error">{erro}</div>}
          <button className="btn btn-primary" type="submit" disabled={carregando} style={{ justifyContent: 'center' }}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
