/** VISTA · Inicio: solo lo esencial del mes. El análisis completo está en Informes. */
import { fmtDate, fmtMoney, fmtNum, fmtQty } from '../../models';
import { useAuth, useDashboardController } from '../../controllers';
import { Button, Icon, Stat } from '../components';

const pasos = [
  ['ajustes', 'Configura el valor de la hora y la impresora'],
  ['insumos', 'Registra tu materia prima: filamentos, cajas y bolsas'],
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
  const alertas = d.bajos.length + d.sinStock.length;

  return (
    <div className="page home">
      <header className="page-head">
        <div>
          <h1>{greet}, <span className="v">{name}</span>.</h1>
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

      <div className="kpis kpis-3">
        <Stat label="Vendiste este mes" value={fmtMoney(d.mesVentas.ingresos)} hint={`${fmtNum(d.mesVentas.ventas)} venta${d.mesVentas.ventas === 1 ? '' : 's'}`} tone="dark" />
        <Stat label="Te dejaron de ganancia" value={fmtMoney(d.mesVentas.ganancia)} hint="Precio − costo de cada pieza" />
        <Stat label="Piezas vendidas" value={fmtNum(d.mesVentas.unidades)} hint="Este mes" />
      </div>

      {alertas > 0 && (
        <button type="button" className="home-alert" onClick={() => navigate(d.bajos.length ? 'insumos' : 'produccion')}>
          <Icon name="alert" size={18} />
          <span>
            {d.bajos.length > 0 && <><b>{d.bajos.length}</b> material{d.bajos.length === 1 ? '' : 'es'} por acabarse ({d.bajos.slice(0, 2).map((i) => `${i.nombre} · quedan ${fmtQty(i.stock, i.unidad)}`).join(', ')}{d.bajos.length > 2 ? '…' : ''})</>}
            {d.bajos.length > 0 && d.sinStock.length > 0 && ' · '}
            {d.sinStock.length > 0 && <><b>{d.sinStock.length}</b> producto{d.sinStock.length === 1 ? '' : 's'} sin stock</>}
          </span>
          <span className="home-alert-go">Revisar →</span>
        </button>
      )}

      <section className="card">
        <div className="card-head"><h3>Últimas ventas</h3><button className="link" onClick={() => navigate('ventas')}>Ver todas →</button></div>
        {d.ultimasVentas.length ? (
          <ul className="feed">
            {d.ultimasVentas.map((v) => (
              <li key={v.id}>
                <span><b>{v.cantidad} × {v.productoNombre}</b><small>{fmtDate(v.fecha)}</small></span>
                <b>{fmtMoney(v.cantidad * v.precioUnitario)}</b>
              </li>
            ))}
          </ul>
        ) : <p className="muted">Aún no hay ventas. Cuando registres la primera aparecerá aquí.</p>}
      </section>

      <p className="home-more muted">¿Quieres ver la utilidad real del mes con todos los gastos, gráficas y productos más rentables? <button type="button" className="link" onClick={() => navigate('informes')}>Ir a Informes →</button></p>
    </div>
  );
}
