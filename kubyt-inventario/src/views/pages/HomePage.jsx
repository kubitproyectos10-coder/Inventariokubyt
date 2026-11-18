/** VISTA · Inicio: tablero con lo más importante del mes. */
import { fmtDate, fmtMoney, fmtPct, fmtQty, nombreMes } from '../../models';
import { useAuth, useDashboardController } from '../../controllers';
import { Button, Columns, Icon, Stat } from '../components';

const pasos = [
  ['ajustes', 'Configura el valor de la hora y los gastos administrativos'],
  ['insumos', 'Registra tu materia prima: filamentos, cajas y empaques'],
  ['productos', 'Crea tus productos con su receta'],
  ['produccion', 'Registra tu primera tanda de producción'],
  ['ventas', 'Registra tu primera venta'],
];

export default function HomePage({ navigate }) {
  const { profile, user } = useAuth();
  const d = useDashboardController();
  const name = profile?.nombre || user?.email?.split('@')[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const hechos = {
    ajustes: Number(d.data.ajustes.valorHoraManoObra) > 0,
    insumos: d.data.insumos.length > 0,
    productos: d.data.productos.length > 0,
    produccion: d.data.producciones.length > 0,
    ventas: d.data.ventas.length > 0,
  };
  const pendientes = pasos.filter(([k]) => !hechos[k]).length;

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">{nombreMes(d.mes)}</div>
          <h1>{greet}, <span className="v">{name}</span>.</h1>
          <p className="muted">Así va KUBYT este mes.</p>
        </div>
        <div className="page-actions">
          <Button variant="ghost" onClick={() => navigate('produccion', 'nuevo')}>+ Producción</Button>
          <Button onClick={() => navigate('ventas', 'nuevo')}>+ Venta</Button>
        </div>
      </header>

      {pendientes > 0 && (
        <section className="card onboarding">
          <div>
            <h3>Pon en marcha tu inventario</h3>
            <p className="muted">{5 - pendientes} de 5 pasos listos.</p>
          </div>
          <ol>
            {pasos.map(([k, t]) => (
              <li key={k} className={hechos[k] ? 'done' : ''}>
                <button onClick={() => navigate(k)}><i>{hechos[k] ? '✓' : ''}</i>{t}</button>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="kpis">
        <Stat label="Ventas del mes" value={fmtMoney(d.actual.ingresos)} delta={d.varIngresos} hint="vs. mes anterior" tone="dark" />
        <Stat label="Utilidad del mes" value={fmtMoney(d.actual.utilidad)} delta={d.varUtilidad} hint={`Margen ${fmtPct(d.actual.margen)}`} tone={d.actual.utilidad < 0 ? 'alert' : undefined} />
        <Stat label="Inversión recuperada" value={fmtPct(d.inv.recuperacion)} hint={`de ${fmtMoney(d.inv.totalGastado)} invertidos`} tone="violet" />
        <Stat label="Materia prima con stock bajo" value={d.bajos.length} hint={d.bajos.length ? 'Revisa y compra' : 'Todo en orden'} tone={d.bajos.length ? 'alert' : undefined} />
      </div>

      <div className="report-grid">
        <section className="card">
          <div className="card-head"><h3>Ingresos y utilidad</h3><button className="link" onClick={() => navigate('informes')}>Ver informes →</button></div>
          <Columns rows={d.serie} format={fmtMoney} label={(r) => nombreMes(r.mes, true)} active={d.mes} />
        </section>
        <section className="card">
          <h3>Más rentables del mes</h3>
          {d.top.length ? (
            <ol className="top">
              {d.top.map((p, i) => (
                <li key={p.productoId}><span className="rank">{i + 1}</span><span><b>{p.nombre}</b><small>{p.unidades} und · {fmtPct(p.margen)}</small></span><b className={p.utilidad >= 0 ? 'pos' : 'neg'}>{fmtMoney(p.utilidad)}</b></li>
              ))}
            </ol>
          ) : (
            <p className="muted">Aparecerán cuando registres ventas este mes.</p>
          )}
        </section>
      </div>

      <div className="report-grid">
        <section className="card">
          <div className="card-head"><h3>Últimas ventas</h3><button className="link" onClick={() => navigate('ventas')}>Ver todas →</button></div>
          {d.ultimasVentas.length ? (
            <ul className="feed">
              {d.ultimasVentas.map((v) => (
                <li key={v.id}><span><b>{v.cantidad} × {v.productoNombre}</b><small>{fmtDate(v.fecha)}</small></span><b>{fmtMoney(v.cantidad * v.precioUnitario)}</b></li>
              ))}
            </ul>
          ) : <p className="muted">Sin ventas todavía.</p>}
        </section>
        <section className="card">
          <h3>Alertas</h3>
          {d.bajos.length || d.sinStock.length ? (
            <ul className="alerts">
              {d.bajos.map((i) => (
                <li key={i.id}><Icon name="alert" size={16} /><span><b>{i.nombre}{i.color ? ` · ${i.color}` : ''}</b> quedan {fmtQty(i.stock, i.unidad)}</span></li>
              ))}
              {d.sinStock.map((p) => (
                <li key={p.id}><Icon name="alert" size={16} /><span><b>{p.nombre}</b> sin unidades en stock</span></li>
              ))}
            </ul>
          ) : <p className="muted">Nada pendiente. Todo en orden.</p>}
        </section>
      </div>
    </div>
  );
}
