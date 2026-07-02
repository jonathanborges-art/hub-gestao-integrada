import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import api from '../api/client.js';
import { Plus, X, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import KPICard from '../components/KPICard.jsx';

const fmtBRL = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyForm = { tipo: 'receita', categoria: 'Consulta', descricao: '', valor: '', data: dayjs().format('YYYY-MM-DD'), status: 'pendente', formaPagamento: 'PIX' };

export default function Financeiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState('Todos');
  const [statusFiltro, setStatusFiltro] = useState('Todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const carregar = () => api.get('/financeiro').then(res => setLancamentos(res.data));
  useEffect(() => { carregar(); }, []);

  const filtrados = useMemo(() => lancamentos
    .filter(t => tipoFiltro === 'Todos' || t.tipo === tipoFiltro)
    .filter(t => statusFiltro === 'Todos' || t.status === statusFiltro)
    .sort((a, b) => b.data.localeCompare(a.data)), [lancamentos, tipoFiltro, statusFiltro]);

  const resumo = useMemo(() => {
    const receitas = lancamentos.filter(t => t.tipo === 'receita' && t.status === 'pago').reduce((s, t) => s + t.valor, 0);
    const despesas = lancamentos.filter(t => t.tipo === 'despesa' && t.status === 'pago').reduce((s, t) => s + t.valor, 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [lancamentos]);

  const grafico = useMemo(() => {
    const meses = {};
    lancamentos.forEach(t => {
      const key = dayjs(t.data).format('MMM/YY');
      if (!meses[key]) meses[key] = { mes: key, receitas: 0, despesas: 0 };
      if (t.status === 'pago') meses[key][t.tipo === 'receita' ? 'receitas' : 'despesas'] += t.valor;
    });
    return Object.values(meses);
  }, [lancamentos]);

  async function salvar(e) {
    e.preventDefault();
    const { data } = await api.post('/financeiro', { ...form, valor: Number(form.valor) });
    setLancamentos([data, ...lancamentos]);
    setShowForm(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Hub Financeiro</div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-sub">Tenha previsibilidade financeira e tome decisões com segurança.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={16} /> Novo lançamento</button>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <KPICard label="Receitas pagas" value={fmtBRL(resumo.receitas)} icon={TrendingUp} color="#017A5B" bg="#E4F5EF" />
        <KPICard label="Despesas pagas" value={fmtBRL(resumo.despesas)} icon={TrendingDown} color="#C74B3E" bg="#FBEAE7" />
        <KPICard label="Saldo" value={fmtBRL(resumo.saldo)} icon={Scale} color="#2E6FC7" bg="#E7EFFB" />
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title">Fluxo de caixa por mês</div>
        <div className="section-sub">Receitas x despesas pagas, mês a mês.</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={grafico}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E9E7" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11.5, fill: '#66766F' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11.5, fill: '#66766F' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip formatter={(v) => fmtBRL(v)} contentStyle={{ borderRadius: 10, borderColor: '#E4E9E7', fontSize: 12.5 }} />
            <Bar dataKey="receitas" fill="#017A5B" radius={[6, 6, 0, 0]} name="Receitas" />
            <Bar dataKey="despesas" fill="#C74B3E" radius={[6, 6, 0, 0]} name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="toolbar">
        <select className="chip-select" value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)}>
          <option value="Todos">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select className="chip-select" value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
          <option value="Todos">Todos os status</option>
          <option value="pago">Pago</option>
          <option value="pendente">Pendente</option>
        </select>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Forma</th><th>Valor</th><th>Status</th></tr></thead>
          <tbody>
            {filtrados.slice(0, 60).map(t => (
              <tr key={t.id}>
                <td>{dayjs(t.data).format('DD/MM/YYYY')}</td>
                <td>{t.descricao}</td>
                <td>{t.categoria}</td>
                <td>{t.formaPagamento}</td>
                <td style={{ fontWeight: 600, color: t.tipo === 'receita' ? 'var(--verde-700)' : 'var(--vermelho-600)' }}>
                  {t.tipo === 'receita' ? '+' : '−'} {fmtBRL(t.valor)}
                </td>
                <td><span className={`badge ${t.status === 'pago' ? 'badge-green' : 'badge-amber'}`}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo lançamento</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                <div className="field-row">
                  <div className="field"><label>Tipo</label>
                    <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                      <option value="receita">Receita</option><option value="despesa">Despesa</option>
                    </select></div>
                  <div className="field"><label>Categoria</label>
                    <input value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} /></div>
                </div>
                <div className="field"><label>Descrição</label>
                  <input required value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
                <div className="field-row">
                  <div className="field"><label>Valor (R$)</label>
                    <input type="number" required value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                  <div className="field"><label>Data</label>
                    <input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                      <option value="pendente">Pendente</option><option value="pago">Pago</option>
                    </select></div>
                  <div className="field"><label>Forma de pagamento</label>
                    <select value={form.formaPagamento} onChange={e => setForm({ ...form, formaPagamento: e.target.value })}>
                      {['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Convênio'].map(f => <option key={f}>{f}</option>)}
                    </select></div>
                </div>
              </div>
              <div className="modal-foot">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
