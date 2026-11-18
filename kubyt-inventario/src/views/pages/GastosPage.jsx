/** VISTA · Gastos administrativos e inversiones (máquinas, herramientas). */
import { CATEGORIAS_GASTO, cuotaMensual, fmtDate, fmtMoney, fmtPct, labelOf } from '../../models';
import { useAutoOpen, useGastosController } from '../../controllers';
import { Button, EmptyState, Field, Icon, Modal, PageHead, Paginado, RowActions, Stat, Toolbar } from '../components';

export default function GastosPage({ action, navigate }) {
  const c = useGastosController();
  const { gasto } = c;
  const g = gasto.values;
  useAutoOpen(action, () => gasto.openNew(), navigate, 'gastos');

  return (
    <div className="page">
      <PageHead eyebrow="Dinero que sale" title="Gastos e inversión" description="Gastos administrativos del mes y la inversión en máquinas y herramientas.">
        <Button icon="+" onClick={() => gasto.openNew()}>Registrar gasto</Button>
      </PageHead>

      <div className="kpis">
        <Stat label="Administrativos este mes" value={fmtMoney(c.adminMes.total)} hint={`${fmtMoney(c.adminMes.cuotas)} son cuotas de máquinas`} tone="dark" />
        <Stat label="Invertido en equipos" value={fmtMoney(c.inv.equipos)} hint="Máquinas y herramientas" />
        <Stat label="Total invertido" value={fmtMoney(c.inv.totalGastado)} hint="Equipos + gastos + materia prima" />
        <Stat label="Recuperado" value={fmtPct(c.inv.recuperacion)} hint={`${fmtMoney(c.inv.ingresos)} en ventas`} tone="violet" />
      </div>

      <Toolbar search={c.search} placeholder="Buscar por concepto" filterOptions={CATEGORIAS_GASTO} filterLabel="Todas las categorías">
        <button className="icon-btn" onClick={c.exportar} title="Descargar Excel (CSV)"><Icon name="download" /></button>
      </Toolbar>
      {c.search.result.length ? (
        <Paginado rows={c.search.result} resetKey={c.search.q + c.search.filter}>
          {(filas) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Tipo</th><th className="num">Monto</th><th /></tr></thead>
              <tbody>
                {filas.map((x) => (
                  <tr key={x.id}>
                    <td>{fmtDate(x.fecha)}</td>
                    <td><b>{x.concepto}</b>{x.nota && <span className="sub">{x.nota}</span>}</td>
                    <td>{labelOf(CATEGORIAS_GASTO, x.categoria)}</td>
                    <td>
                      {x.esInversion ? <span className="pill pill-violet">Inversión</span> : <span className="pill">Administrativo</span>}
                      {cuotaMensual(x) > 0 && <span className="sub">{fmtMoney(cuotaMensual(x))}/mes × {x.vidaUtilMeses}</span>}
                    </td>
                    <td className="num">{fmtMoney(x.monto)}</td>
                    <td><RowActions onEdit={() => gasto.openEdit(x)} onDelete={() => c.borrar(x)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Paginado>
      ) : (
        <EmptyState title="Sin gastos registrados" text="Registra internet, software, luz, publicidad y la compra de tus impresoras." />
      )}

      <Modal open={gasto.open} onClose={gasto.close} onSubmit={gasto.submit} saving={gasto.saving} error={gasto.error}
        eyebrow="Gasto" title={gasto.isEdit ? 'Editar gasto' : 'Registrar gasto'}>
        <p className="note span-2">¿Compraste filamento, cajas o bolsas? Eso no va aquí: regístralo en <b>Materia prima → + Compra</b>, así sube tu stock y no se cobra dos veces en el precio.</p>
        <Field label="Concepto" id="g-conc" value={g.concepto} onChange={gasto.bind('concepto')} placeholder="Internet noviembre" autoFocus className="span-2" />
        <Field as="select" label="Categoría" id="g-cat" value={g.categoria} onChange={(e) => c.elegirCategoria(e.target.value)} options={CATEGORIAS_GASTO} />
        <Field label="Monto" id="g-monto" type="number" min="0" prefix="$" value={g.monto} onChange={gasto.bind('monto')} />
        <Field label="Fecha" id="g-fecha" type="date" value={g.fecha} onChange={gasto.bind('fecha')} />
        <div className="seg span-2" role="radiogroup" aria-label="Tipo de gasto">
          <button type="button" className={!g.esInversion ? 'on' : ''} onClick={() => gasto.set('esInversion', false)}>
            <b>Administrativo</b><small>Se paga cada mes: internet, software, luz…</small>
          </button>
          <button type="button" className={g.esInversion ? 'on' : ''} onClick={() => gasto.set('esInversion', true)}>
            <b>Inversión</b><small>Compra que dura: impresoras, herramientas</small>
          </button>
        </div>
        {g.esInversion && (
          <Field label="Vida útil" id="g-vida" type="number" min="0" suffix="meses" value={g.vidaUtilMeses} onChange={gasto.bind('vidaUtilMeses')}
            hint={Number(g.vidaUtilMeses) > 0 ? `Suma ${fmtMoney((Number(g.monto) || 0) / Number(g.vidaUtilMeses))} al mes a los gastos administrativos` : '0 = no se reparte por mes'} />
        )}
        <Field label="Nota" id="g-nota" value={g.nota} onChange={gasto.bind('nota')} placeholder="Opcional" />
      </Modal>

    </div>
  );
}
