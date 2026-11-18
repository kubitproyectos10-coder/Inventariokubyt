/**
 * VISTA · Gráficos simples hechos con CSS (sin librerías).
 *   <Bars rows={[{key,label,valor}]} format={fmt} />          barras horizontales
 *   <Columns rows={[{mes, ingresos, utilidad}]} format={fmt} /> columnas por mes
 */
export function Bars({ rows, format = String, color = 'var(--violet)' }) {
  const max = Math.max(...rows.map((r) => r.valor), 1);
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={r.key}>
          <span className="bar-label" title={r.label}>{r.label}</span>
          <span className="bar-track"><i style={{ width: `${(r.valor / max) * 100}%`, background: color }} /></span>
          <b className="bar-value">{format(r.valor)}</b>
        </div>
      ))}
    </div>
  );
}

export function Columns({ rows, format = String, label = (r) => r.mes, active }) {
  const max = Math.max(...rows.flatMap((r) => [r.ingresos, Math.abs(r.utilidad)]), 1);
  return (
    <div className="cols">
      <div className="cols-plot">
        {rows.map((r) => (
          <div className={`col ${active === r.mes ? 'on' : ''}`} key={r.mes} title={`Ingresos ${format(r.ingresos)} · Utilidad ${format(r.utilidad)}`}>
            <div className="col-bars">
              <i className="c-ing" style={{ height: `${(r.ingresos / max) * 100}%` }} />
              <i className={`c-util ${r.utilidad < 0 ? 'neg' : ''}`} style={{ height: `${(Math.abs(r.utilidad) / max) * 100}%` }} />
            </div>
            <span>{label(r)}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i className="c-ing" /> Ingresos</span>
        <span><i className="c-util" /> Utilidad</span>
        <span><i className="c-util neg" /> Pérdida</span>
      </div>
    </div>
  );
}
