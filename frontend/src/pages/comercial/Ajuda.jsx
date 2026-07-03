import { MessageCircle, Mail, BookOpen } from 'lucide-react';

const faq = [
  { p: 'Como faço para reduzir a taxa de faltas na agenda?', r: 'Ative confirmação automática por WhatsApp um dia antes da consulta e mantenha a lista de espera preenchida para reaproveitar horários cancelados.' },
  { p: 'De onde vêm os dados do Assistente IA?', r: 'O assistente analisa os dados reais já cadastrados na clínica (agenda, financeiro e pacientes) para responder suas perguntas — não depende de nenhuma informação externa.' },
  { p: 'Como altero a cor ou o nome da clínica?', r: 'Vá em Configurações → Dados da clínica. As mudanças refletem no cabeçalho e nos relatórios.' },
  { p: 'Os dados de exemplo podem ser apagados?', r: 'Sim. Um administrador pode rodar novamente o script de seed para resetar os dados de demonstração a qualquer momento.' },
];

export default function Ajuda() {
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Suporte</div>
          <h1 className="page-title">Ajuda / Suporte</h1>
          <p className="page-sub">Perguntas frequentes e formas de falar com a equipe.</p>
        </div>
      </div>

      <div className="content-grid" style={{ marginBottom: 16 }}>
        <div className="card card-pad">
          <div className="landing-card-icon" style={{ marginBottom: 12 }}><MessageCircle size={19} /></div>
          <div className="section-title">Fale pelo WhatsApp</div>
          <div className="section-sub">Resposta mais rápida para dúvidas do dia a dia.</div>
        </div>
        <div className="card card-pad">
          <div className="landing-card-icon" style={{ marginBottom: 12 }}><Mail size={19} /></div>
          <div className="section-title">Fale por e-mail</div>
          <div className="section-sub">suporte@clinicavitoria.com.br</div>
        </div>
        <div className="card card-pad">
          <div className="landing-card-icon" style={{ marginBottom: 12 }}><BookOpen size={19} /></div>
          <div className="section-title">Central de ajuda</div>
          <div className="section-sub">Guias de uso de cada módulo do sistema.</div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title">Perguntas frequentes</div>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {faq.map(f => (
            <div key={f.p}>
              <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{f.p}</div>
              <div style={{ fontSize: 13, color: 'var(--tinta-500)', lineHeight: 1.5 }}>{f.r}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
