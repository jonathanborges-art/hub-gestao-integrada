export default function KPICard({ label, value, hint, hintTone = 'neutral', icon: Icon, color = '#017A5B', bg = '#E4F5EF' }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: bg, color }}>
        {Icon && <Icon size={17} strokeWidth={2.2} />}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {hint && <div className={`kpi-hint ${hintTone}`}>{hint}</div>}
    </div>
  );
}
