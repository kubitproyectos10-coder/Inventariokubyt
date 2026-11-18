/** VISTA · Tarjeta de cifra. tone: 'dark' | 'violet' | undefined */
export default function Stat({ label, value, hint, tone, delta }) {
  return (
    <div className={`kpi ${tone ? `kpi-${tone}` : ''}`}>
      <span className="kpi-label">{label}</span>
      <b className="kpi-value">{value}</b>
      <span className="kpi-hint">
        {delta !== undefined && delta !== null && (
          <em className={delta >= 0 ? 'up' : 'down'}>{delta >= 0 ? '▲' : '▼'} {Math.abs(Math.round(delta * 100))}% </em>
        )}
        {hint}
      </span>
    </div>
  );
}
