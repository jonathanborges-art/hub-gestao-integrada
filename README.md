# Hub Gestão Integrada

Sistema web de gestão para clínicas médicas, odontológicas, estéticas, psicológicas e multiprofissionais — CRM de pacientes, agenda inteligente, financeiro e assistente de IA em um único painel.

Projeto em **JavaScript puro** (React no front-end, Node.js/Express no back-end), sem dependências de compilação nativa — roda em qualquer máquina com Node instalado, sem precisar de Docker, PostgreSQL ou banco externo.

> Área interna (dashboard) apenas — login/senha não fazem parte deste projeto, conforme escopo definido.

## Capturas de tela

| Dashboard | Pacientes |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Pacientes](docs/screenshots/pacientes.png) |

| Agenda | Financeiro |
|---|---|
| ![Agenda](docs/screenshots/agenda.png) | ![Financeiro](docs/screenshots/financeiro.png) |

## Stack

- **Frontend:** React 19 + Vite, React Router, Recharts (gráficos), Lucide (ícones)
- **Backend:** Node.js + Express, API REST
- **Banco de dados:** arquivo JSON local via `lowdb` (zero configuração, zero build nativo — ideal para rodar em qualquer ambiente)
- **Dados de exemplo:** clínica fictícia em Vitória/ES, com pacientes, profissionais, agenda e financeiro pré-populados

## Estrutura

```
clinic-hub-app/
├── backend/
│   ├── server.js         # servidor Express e definição das rotas
│   ├── db.js              # camada de acesso ao banco (lowdb)
│   ├── seed.js             # gera dados de exemplo
│   ├── data/db.json       # "banco de dados" (JSON) - já vem populado
│   └── routes/
│       ├── crud.js         # CRUD genérico (pacientes, agenda, financeiro...)
│       ├── dashboard.js    # métricas agregadas do dashboard
│       └── assistant.js    # assistente de IA baseado em regras
├── frontend/
│   └── src/
│       ├── pages/          # Dashboard, Pacientes, Agenda, Financeiro, Assistente, Configurações
│       ├── components/     # Sidebar, KPICard
│       └── styles.css      # design system (cores, tipografia, componentes)
├── docs/screenshots/       # imagens usadas neste README
└── LICENSE
```

## Como rodar localmente

Abra dois terminais.

**Terminal 1 — Backend**
```bash
cd backend
npm install
npm run seed     # popula/reseta os dados de exemplo (já vem rodado, mas pode rodar de novo)
npm start          # http://localhost:3333
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Abra `http://localhost:5173` no navegador. O Vite já está configurado para redirecionar chamadas `/api/*` para o backend na porta 3333 (veja `frontend/vite.config.js`).

## Módulos implementados (primeira rodada)

- **Dashboard** — faturamento do mês, consultas de hoje, pacientes ativos/novos, ticket médio, taxa de faltas, contas a pagar/receber, fluxo de caixa (gráfico), ranking de profissionais e de procedimentos
- **CRM de Pacientes** — cadastro, busca, filtro por convênio, prontuário (evolução clínica) e histórico financeiro por paciente, termo LGPD
- **Agenda Inteligente** — visão diária navegável, filtro por profissional, atualização de status inline (agendado / confirmado / concluído / faltou / cancelado), novo agendamento
- **Hub Financeiro** — lançamentos de receita/despesa, fluxo de caixa mensal (gráfico), filtros por tipo/status, contas a pagar e a receber
- **Assistente IA** — chat que responde perguntas sobre faturamento, taxa de faltas, pacientes inativos, ranking de profissionais e previsão de faturamento, analisando os dados reais da clínica (sem depender de API externa)
- **Configurações** — dados da clínica, meta de faturamento, comissão por profissional, perfis de acesso da equipe

## Módulos sugeridos para uma próxima rodada

(mesmo escopo do brief original, não incluídos nesta primeira versão)

- Marketing Digital (pipeline de leads, campanhas, ROI/CAC/LTV) — a base de dados de leads já existe na API (`/api/leads`), falta a interface
- Estoque (produtos, insumos, validade, lote)
- Portal do Paciente (login próprio, agendamento online, receitas/exames)
- Gestão de Equipe mais completa (escalas, metas individuais, produtividade)
- Central de Integrações (WhatsApp Business API, Google Agenda/Meet, PIX, Mercado Pago, Stripe, N8N, Zapier)

## Personalizando

- **Cor da marca:** altere as variáveis `--verde-*` em `frontend/src/styles.css`
- **Dados da clínica:** edite pela tela de Configurações no app, ou diretamente em `backend/data/db.json`
- **Repopular dados de exemplo:** `cd backend && npm run seed` (isso **substitui** os dados atuais)

## Licença

Distribuído sob a licença MIT — veja [LICENSE](LICENSE).
