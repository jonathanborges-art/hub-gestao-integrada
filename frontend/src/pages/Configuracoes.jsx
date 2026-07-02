import { useEffect, useState } from 'react';
import api from '../api/client.js';
import { Save } from 'lucide-react';

export default function Configuracoes() {
  const [clinica, setClinica] = useState(null);
  const [profissionais, setProfissionais] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    api.get('/clinica').then(res => setClinica(res.data));
    api.get('/profissionais').then(res => setProfissionais(res.data));
    api.get('/usuarios').then(res => setUsuarios(res.data));
  }, []);

  async function salvar(e) {
    e.preventDefault();
    await api.put('/clinica', clinica);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  }

  if (!clinica) return <div className="empty-state">Carregando configurações…</div>;

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Configurações</div>
          <h1 className="page-title">Configurações do sistema</h1>
          <p className="page-sub">Personalize a marca e controle os acessos da equipe.</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="card card-pad">
          <div className="section-title">Dados da clínica</div>
          <div className="section-sub">Essas informações aparecem em relatórios e no portal do paciente.</div>
          <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field"><label>Nome da clínica</label>
              <input value={clinica.nome} onChange={e => setClinica({ ...clinica, nome: e.target.value })} /></div>
            <div className="field-row">
              <div className="field"><label>CNPJ</label>
                <input value={clinica.cnpj} onChange={e => setClinica({ ...clinica, cnpj: e.target.value })} /></div>
              <div className="field"><label>Telefone</label>
                <input value={clinica.telefone} onChange={e => setClinica({ ...clinica, telefone: e.target.value })} /></div>
            </div>
            <div className="field"><label>Endereço</label>
              <input value={clinica.endereco} onChange={e => setClinica({ ...clinica, endereco: e.target.value })} /></div>
            <div className="field-row">
              <div className="field"><label>WhatsApp</label>
                <input value={clinica.whatsapp} onChange={e => setClinica({ ...clinica, whatsapp: e.target.value })} /></div>
              <div className="field"><label>Meta de faturamento mensal (R$)</label>
                <input type="number" value={clinica.metaFaturamentoMensal}
                  onChange={e => setClinica({ ...clinica, metaFaturamentoMensal: Number(e.target.value) })} /></div>
            </div>
            <div>
              <button className="btn btn-primary" type="submit"><Save size={15} /> Salvar alterações</button>
              {salvo && <span className="badge badge-green" style={{ marginLeft: 10 }}>Salvo!</span>}
            </div>
          </form>
        </div>

        <div className="card card-pad">
          <div className="section-title">Profissionais</div>
          <div className="section-sub">Comissão configurada por profissional.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profissionais.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                <div className="avatar" style={{ background: p.cor + '22', color: p.cor }}>{p.nome[4]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--tinta-500)' }}>{p.especialidade}</div>
                </div>
                <span className="badge badge-green">{p.comissaoPercentual}% comissão</span>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ marginTop: 22 }}>Perfis de acesso</div>
          <div className="section-sub">Controle de permissões por usuário.</div>
          <table className="data-table">
            <thead><tr><th>Usuário</th><th>Perfil</th><th>Status</th></tr></thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td><span className="badge badge-grey">{u.perfil}</span></td>
                  <td><span className="badge badge-green">Ativo</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
