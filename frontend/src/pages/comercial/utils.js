export function etapaLead(lead) {
  if (lead.fechou) return { label: 'Fechado', tone: 'badge-green' };
  if (lead.propos) return { label: 'Proposta enviada', tone: 'badge-amber' };
  if (lead.compareceu) return { label: 'Compareceu', tone: 'badge-green' };
  if (lead.agendou) return { label: 'Agendado', tone: 'badge-grey' };
  return { label: 'Novo lead', tone: 'badge-grey' };
}

export const canalIcon = {
  'Instagram Ads': '📷',
  'Google Ads': '🔍',
  'Meta Ads': '📘',
  'Indicação': '🤝',
  'WhatsApp': '💬',
  'Site': '🌐',
  'Orgânico': '🌱',
};

export const fmtBRL = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
