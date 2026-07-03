import { useEffect, useState } from 'react';
import api from '../../api/client.js';
import { Download } from 'lucide-react';
import { fmtBRL } from './utils.js';

function baixarCSV(nome, linhas) {
  const conteudo = linhas.map(l => l.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = nome; a.click();
  URL.revokeObjectURL(url);
}

export default function Relatorios() {
  const [data, setData] = useState(null);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    api.get('/comercial').then(res => setData(res.data));
    api.get('/leads').then(res => setLeads(res.data));
  }, []);

  if (!data) return <div className="empty-state">Carregando relatórios...</div>;

  function exportarLeads() {
    const linhas = [['Nome', 'Telefone', 'Canal', 'Criado em', 'Agendou', 'Compareceu', 'Proposta', 'Fechou', 'Valor']];
    leads.forEach(l => linhas.push([l.nome, l.telefone, l.origem, l.criadoEm, l.agendou ? 'Sim' : 'Não', l.compareceu ? 'Sim' : 'Não', l.propos ? 'Sim' : 'Não', l.fechou ? 'Sim' : 'Não', l.valorFechado]));
    baixarCSV('leads.csv', linhas);
  }

  function exportarResumo() {
    baixarCSV('resumo-comercial.csv', [
      ['Métrica', 'Valor'],
      ['Leads recebidos', data.leadsRecebidos],
      ['Agendamentos', data.agendamentos],
      ['Comparecimentos', data.comparecimentos],
      ['Propostas', data.propostas],
      ['Vendas fechadas', data.vendasFechadas],
      ['Valor total vendido', fmtBRL(data.valorVendas)],
      ['Taxa de conversão', `${data.taxaConversao}%`],
      ['Show rate', `${data.showRate}%`],
      ['CPL', fmtBRL(data.cpl)],
      ['CAC', fmtBRL(data.cac)],
      ['ROAS', `${data.roas}x`],
      ['Índice de eficiência', data.indiceEficiencia],
    ]);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Módulo comercial</div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-sub">Exporte os dados comerciais para planilha quando precisar.</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="card card-pad">
          <div className="section-title">Resumo comercial (últimos 30 dias)</div>
          <div className="section-sub">Principais métricas do funil, prontas para exportar.</div>
          <table className="data-table" style={{ marginBottom: 14 }}>
            <tbody>
              <tr><td>Leads recebidos</td><td style={{ fontWeight: 600 }}>{data.leadsRecebidos}</td></tr>
              <tr><td>Vendas fechadas</td><td style={{ fontWeight: 600 }}>{data.vendasFechadas}</td></tr>
              <tr><td>Valor total vendido</td><td style={{ fontWeight: 600 }}>{fmtBRL(data.valorVendas)}</td></tr>
              <tr><td>Taxa de conversão</td><td style={{ fontWeight: 600 }}>{data.taxaConversao}%</td></tr>
              <tr><td>ROAS</td><td style={{ fontWeight: 600 }}>{data.roas}x</td></tr>
            </tbody>
          </table>
          <button className="btn btn-secondary" onClick={exportarResumo}><Download size={15} /> Exportar resumo (CSV)</button>
        </div>

        <div className="card card-pad">
          <div className="section-title">Base completa de leads</div>
          <div className="section-sub">Todos os {leads.length} leads, com etapa e valores, em uma planilha.</div>
          <p style={{ fontSize: 13, color: 'var(--tinta-500)', marginBottom: 14 }}>
            Útil para importar em outra ferramenta, cruzar com campanhas ou compartilhar com a equipe comercial.
          </p>
          <button className="btn btn-secondary" onClick={exportarLeads}><Download size={15} /> Exportar leads (CSV)</button>
        </div>
      </div>
    </div>
  );
}
