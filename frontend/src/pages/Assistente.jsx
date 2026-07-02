import { useState, useRef, useEffect } from 'react';
import api from '../api/client.js';
import { Sparkles, Send } from 'lucide-react';

const sugestoes = [
  'Como está o faturamento deste mês?',
  'Qual a taxa de faltas?',
  'Quais pacientes estão inativos?',
  'Ranking de profissionais',
  'Qual a previsão de faturamento?',
];

export default function Assistente() {
  const [mensagens, setMensagens] = useState([
    { autor: 'ai', texto: 'Olá! Sou o assistente da clínica. Posso analisar faturamento, faltas, pacientes inativos, desempenho de profissionais e previsões. O que você quer saber?' },
  ]);
  const [input, setInput] = useState('');
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => { fimRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mensagens]);

  async function enviar(texto) {
    const msg = texto || input;
    if (!msg.trim()) return;
    setMensagens(m => [...m, { autor: 'user', texto: msg }]);
    setInput('');
    setCarregando(true);
    const { data } = await api.post('/assistente/query', { message: msg });
    setMensagens(m => [...m, { autor: 'ai', texto: data.resposta }]);
    setCarregando(false);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Inteligência artificial</div>
          <h1 className="page-title">Assistente IA</h1>
          <p className="page-sub">Automatize respostas e antecipe decisões com insights gerados a partir dos dados reais da clínica.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div className="chat-window">
          {mensagens.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.autor}`}>{m.texto}</div>
          ))}
          {carregando && <div className="chat-bubble ai loading-dot">digitando…</div>}
          <div ref={fimRef} />
        </div>

        <div className="chat-suggestions">
          {sugestoes.map(s => (
            <button key={s} className="btn btn-secondary btn-sm" onClick={() => enviar(s)}>
              <Sparkles size={12} /> {s}
            </button>
          ))}
        </div>

        <form className="chat-input-row" onSubmit={e => { e.preventDefault(); enviar(); }}>
          <input placeholder="Pergunte algo sobre a clínica…" value={input} onChange={e => setInput(e.target.value)} />
          <button className="btn btn-primary" type="submit"><Send size={16} /></button>
        </form>
      </div>
    </div>
  );
}
