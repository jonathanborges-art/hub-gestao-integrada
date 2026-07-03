import { Link } from 'react-router-dom';
import {
  CalendarClock, Users, Wallet, Sparkles, ShieldCheck, TrendingUp, ArrowRight, Check,
} from 'lucide-react';

const beneficios = [
  { icon: CalendarClock, titulo: 'Reduza faltas e aproveite melhor a agenda', texto: 'Confirmação automática, lista de espera e controle de status em tempo real.' },
  { icon: Users, titulo: 'Transforme contatos em pacientes fidelizados', texto: 'CRM completo com histórico clínico, financeiro e etiquetas de relacionamento.' },
  { icon: Wallet, titulo: 'Tenha previsibilidade financeira', texto: 'Fluxo de caixa, contas a pagar/receber e comissões, tudo em um só lugar.' },
  { icon: Sparkles, titulo: 'Decisões mais rápidas com IA', texto: 'Pergunte sobre faturamento, faltas e pacientes inativos e receba respostas na hora.' },
  { icon: ShieldCheck, titulo: 'Dados organizados e seguros', texto: 'Controle de permissões por perfil de usuário e termos de LGPD por paciente.' },
  { icon: TrendingUp, titulo: 'Cresça com o que já está acontecendo', texto: 'Rankings de profissionais e procedimentos mostram onde focar.' },
];

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="auth-brand" style={{ marginBottom: 0 }}>
            <div className="sidebar-brand-mark" style={{ background: '#017A5B', color: '#fff' }}>HG</div>
            <strong>Hub Gestão Integrada</strong>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/entrar" className="btn btn-secondary">Entrar</Link>
            <Link to="/criar-conta" className="btn btn-primary">Criar conta grátis</Link>
          </div>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-eyebrow">Gestão de clínicas, unificada</div>
        <h1>O painel completo para sua clínica crescer com organização</h1>
        <p>CRM de pacientes, agenda inteligente, financeiro e um assistente de IA — tudo em um único sistema, pensado para clínicas médicas, odontológicas, estéticas, psicológicas e multiprofissionais.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/criar-conta" className="btn btn-primary" style={{ padding: '12px 22px', fontSize: 14.5 }}>
            Criar conta grátis <ArrowRight size={16} />
          </Link>
          <Link to="/entrar" className="btn btn-secondary" style={{ padding: '12px 22px', fontSize: 14.5 }}>
            Já tenho conta
          </Link>
        </div>
        <img src="/dashboard-preview.png" alt="Prévia do Dashboard do Hub Gestão Integrada" className="landing-hero-img" />
      </section>

      <section className="landing-section">
        <h2 className="landing-section-title">Feito para o dia a dia da clínica</h2>
        <div className="landing-grid">
          {beneficios.map(b => (
            <div key={b.titulo} className="landing-card">
              <div className="landing-card-icon"><b.icon size={19} /></div>
              <div className="landing-card-title">{b.titulo}</div>
              <div className="landing-card-text">{b.texto}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-cta">
        <h2 className="landing-section-title">Pronto para organizar sua clínica?</h2>
        <p style={{ color: 'var(--tinta-500)', marginBottom: 18 }}>Crie sua conta gratuitamente, sem cartão de crédito.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          {['Sem instalação', 'Seus dados, sua clínica', 'Pronto em 1 minuto'].map(t => (
            <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--tinta-700)' }}>
              <Check size={15} color="#017A5B" />{t}
            </span>
          ))}
        </div>
        <Link to="/criar-conta" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14.5 }}>
          Criar conta grátis <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Hub Gestão Integrada — Clínica Vitória Saúde Integrada, Vitória/ES
      </footer>
    </div>
  );
}
