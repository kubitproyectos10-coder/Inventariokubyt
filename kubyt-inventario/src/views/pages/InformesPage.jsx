/** VISTA · Informes del mes y del negocio completo. */
import { fmtMoney, fmtNum, fmtPct, fmtQty, nombreMes } from '../../models';
import { useInformesController } from '../../controllers';
import { Bars, Columns, EmptyState, Icon, PageHead, Paginado, Stat } from '../components';

function Row({ label, value, strong, neg, sub }) {
  return (
    <li className={`${strong ? 'strong' : ''} ${neg ? 'neg' : ''}`}>
      <span>{label}{sub && <small>{sub}</small>}</span>
      <b>{value}</b>
    </li>
  );
}

export default function InformesPage() {
  const c = useInformesController();
  const s = c.resumen;
  const sinDatos = !s.ventas.length && !s.producciones.length && !s.admin.total;

  return (
    <div className="page">
      <PageHead eyebrow="Informes" title={`Resultado de ${nombreMes(c.mes).toLowerCase()}`} description="Utilidad = ingresos − material − mano de obra − envíos − gastos administrativos del mes.">
        <input type="month" className="month" value={c.mes} onChange={(e) => e.target.value && c.setMes(e.target.value)} aria-label="Mes" />
        <button className="icon-btn" onClick={c.exportarResumen} title="Descargar resultado (CSV)"><Icon name="download" /></button>
      </PageHead>

      <div className="kpis">
        <Stat label="Ingresos" value={fmtMoney(s.ingresos)} hint={`${fmtNum(s.unidadesVendidas)} unidades vendidas`} tone="dark" />
        <Stat label="Utilidad" value={fmtMoney(s.utilidad)} hint={`Margen ${fmtPct(s.margen)}`} tone={s.utilidad < 0 ? 'alert' : 'violet'} />
        <Stat label="Producidas" value={fmtNum(s.unidadesProducidas)} hint={`${fmtNum(s.fallidas)} fallidas`} />
        <Stat label="Administrativo real / und" value={fmtMoney(s.adminPorUnidad)} hint="Gastos del mes ÷ unidades producidas" />
      </div>

      <div className="report-grid">
        <section className="card">
          <h3>Estado del mes</h3>
          <ul className="ledger">
            <Row label="Ingresos por ventas" value={fmtMoney(s.ingresos)} strong />
            <Row label="Material" value={`− ${fmtMoney(s.material)}`} />
            <Row label="Mano de obra" value={`− ${fmtMoney(s.manoObra)}`} />
            <Row label="Envíos y comisiones" value={`− ${fmtMoney(s.envios)}`} />
            <Row label="Gastos administrativos" sub="internet, software, luz, publicidad…" value={`− ${fmtMoney(s.admin.gastosAdmin)}`} />
            <Row label="Cuotas de máquinas" sub="precio ÷ meses de vida útil" value={`− ${fmtMoney(s.admin.cuotas)}`} />
            <Row label="Utilidad" value={fmtMoney(s.utilidad)} strong neg={s.utilidad < 0} />
          </ul>
        </section>
        <section className="card">
          <h3>Últimos 6 meses</h3>
          <Columns rows={c.serie} format={fmtMoney} label={(r) => nombreMes(r.mes, true)} active={c.mes} />
        </section>
      </div>

      <section className="card">
        <div className="card-head">
          <h3>Rentabilidad por producto</h3>
          {c.productos.length > 0 && <button className="icon-btn" onClick={c.exportarProductos} title="Descargar (CSV)"><Icon name="download" /></button>}
        </div>
        {c.productos.length ? (
          <Paginado rows={c.productos} resetKey={c.mes}>
            {(filas) => (
            <div className="table-wrap flat">
              <table className="table">
                <thead><tr><th>Producto</th><th className="num">Unidades</th><th className="num">Ingresos</th><th className="num">Costo</th><th className="num">Utilidad</th><th className="num">Margen</th></tr></thead>
                <tbody>
                  {filas.map((p) => (
                    <tr key={p.productoId}>
                      <td><b>{p.nombre}</b></td>
                      <td className="num">{fmtNum(p.unidades)}</td>
                      <td className="num">{fmtMoney(p.ingresos)}</td>
                      <td className="num">{fmtMoney(p.costo)}</td>
                      <td className="num"><b className={p.utilidad >= 0 ? 'pos' : 'neg'}>{fmtMoney(p.utilidad)}</b></td>
                      <td className="num">{fmtPct(p.margen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="note">El gasto administrativo del mes se reparte entre las unidades vendidas.</p>
            </div>
            )}
          </Paginado>
        ) : (
          <p className="muted">No hay ventas en este mes.</p>
        )}
      </section>

      <div className="report-grid">
        <section className="card">
          <h3>Ventas por canal</h3>
          {c.canales.length ? <Bars rows={c.canales} format={fmtMoney} /> : <p className="muted">Sin ventas este mes.</p>}
        </section>
        <section className="card">
          <h3>Consumo de filamento</h3>
          {c.filamento.length ? <Bars rows={c.filamento} format={(g) => fmtQty(g, 'g')} color="var(--ink2)" /> : <p className="muted">Sin producción este mes.</p>}
        </section>
      </div>

      <div className="report-grid">
        <section className="card">
          <h3>Inversión y recuperación</h3>
          <p className="muted small">Todo el historial del negocio.</p>
          <div className="progress">
            <div className="progress-track"><i style={{ width: `${Math.min(c.inv.recuperacion, 1) * 100}%` }} /></div>
            <span><b>{fmtPct(c.inv.recuperacion)}</b> recuperado</span>
          </div>
          <ul className="ledger">
            <Row label="Equipos (máquinas, herramientas)" value={fmtMoney(c.inv.equipos)} />
            <Row label="Gastos administrativos" value={fmtMoney(c.inv.administrativos)} />
            <Row label="Compras de materia prima" value={fmtMoney(c.inv.insumos)} />
            <Row label="Total invertido" value={fmtMoney(c.inv.totalGastado)} strong />
            <Row label="Ventas netas de envíos" value={fmtMoney(c.inv.ingresos)} />
            <Row label={c.inv.balance >= 0 ? 'Ganancia acumulada' : 'Falta por recuperar'} value={fmtMoney(Math.abs(c.inv.balance))} strong neg={c.inv.balance < 0} />
          </ul>
        </section>
        <section className="card">
          <h3>Stock bajo</h3>
          {c.bajos.length ? (
            <ul className="alerts">
              {c.bajos.map((i) => (
                <li key={i.id}><Icon name="alert" size={16} /><span><b>{i.nombre}{i.color ? ` · ${i.color}` : ''}</b> quedan {fmtQty(i.stock, i.unidad)} (mín. {fmtQty(i.stockMinimo, i.unidad)})</span></li>
              ))}
            </ul>
          ) : (
            <p className="muted">Todo en orden: ningún material está en su nivel mínimo.</p>
          )}
        </section>
      </div>

      {sinDatos && <EmptyState title="Este mes aún no tiene movimientos" text="Los informes se llenan solos al registrar ventas, producción y gastos." />}
    </div>
  );
}
