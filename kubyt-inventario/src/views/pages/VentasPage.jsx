/** VISTA · Ventas con utilidad por venta. */
import { CANALES, etiquetaInsumo, fmtDate, fmtMoney, fmtNum, labelOf } from '../../models';
import { useAutoOpen, useVentasController } from '../../controllers';
import { Button, EmptyState, Field, Icon, Modal, PageHead, Paginado, RowActions, Stat, Toolbar } from '../components';

export default function VentasPage({ action, navigate }) {
  const c = useVentasController();
  const { form } = c;
  const v = form.values;
  useAutoOpen(action, () => c.abrir(navigate), navigate, 'ventas');

  return (
    <div className="page">
      <PageHead eyebrow="Dinero que entra" title="Ventas" description="Cada venta descuenta stock y muestra cuánto te dejó: precio de venta menos costo.">
        <Button icon="+" onClick={() => c.abrir(navigate)}>Registrar venta</Button>
      </PageHead>

      <div className="kpis kpis-3">
        <Stat label="Ingresos" value={fmtMoney(c.totales.ingresos)} hint="De las ventas listadas" tone="dark" />
        <Stat label="Utilidad estimada" value={fmtMoney(c.totales.utilidad)} hint="Con el costo de cada venta" />
        <Stat label="Unidades vendidas" value={fmtNum(c.totales.unidades)} hint="De las ventas listadas" />
      </div>

      <Toolbar search={c.search} placeholder="Buscar por producto, cliente o nota" filterOptions={CANALES} filterLabel="Todos los canales">
        <button className="icon-btn" onClick={c.exportar} title="Descargar Excel (CSV)"><Icon name="download" /></button>
      </Toolbar>
      {c.search.result.length ? (
        <Paginado rows={c.search.result} resetKey={c.search.q + c.search.filter}>
          {(filas) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Producto</th><th className="num">Cant.</th><th className="num">Total</th><th>Canal</th><th className="num">Utilidad</th><th /></tr></thead>
              <tbody>
                {filas.map((s) => {
                  const u = c.utilidadVenta(s);
                  return (
                    <tr key={s.id}>
                      <td>{fmtDate(s.fecha)}</td>
                      <td><b>{s.productoNombre}</b><span className="sub">{[s.empaqueNombre && `en ${s.empaqueNombre}`, s.cliente].filter(Boolean).join(' · ')}</span></td>
                      <td className="num">{s.cantidad}</td>
                      <td className="num">{fmtMoney(s.cantidad * s.precioUnitario)}<span className="sub">{fmtMoney(s.precioUnitario)} c/u</span></td>
                      <td>{labelOf(CANALES, s.canal)}</td>
                      <td className="num"><b className={u >= 0 ? 'pos' : 'neg'}>{fmtMoney(u)}</b></td>
                      <td><RowActions onDelete={() => c.anular(s)} deleteLabel="Anular venta" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </Paginado>
      ) : (
        <EmptyState title="Aún no hay ventas" text="Registra la primera: elige el producto, la cantidad y el canal." />
      )}

      <Modal open={form.open} onClose={form.close} onSubmit={form.submit} saving={form.saving} error={form.error}
        eyebrow="Venta" title="Registrar venta" submitLabel="Registrar venta">
        <Field as="select" label="Producto" id="v-prod" value={v.productoId} onChange={(e) => c.elegirProducto(e.target.value)} className="span-2" autoFocus
          options={[{ value: '', label: 'Elige un producto…' }, ...c.data.productos.map((p) => ({ value: p.id, label: `${p.nombre} · stock ${p.stock || 0}`, disabled: !(Number(p.stock) > 0) }))]} />
        <Field as="select" label="Empaque" id="v-emp" value={v.empaqueId} onChange={form.bind('empaqueId')} className="span-2"
          hint={c.empaques.length ? 'Se descuenta 1 por unidad vendida de Materia prima' : 'Crea tus cajas y bolsas en Materia prima (tipo Caja o Bolsa / empaque)'}
          options={[{ value: '', label: 'Sin empaque' }, ...c.empaques.map((e) => ({ value: e.id, label: `${etiquetaInsumo(e)} · ${fmtMoney(e.costoUnitario)} · quedan ${fmtNum(e.stock)}`, disabled: !(Number(e.stock) > 0) }))]} />
        {c.faltaEmpaque && <p className="alert alert-error span-2">No hay suficientes empaques de ese tipo para {fmtNum(v.cantidad)} unidades. Registra una compra en Materia prima o elige otro.</p>}
        <Field label="Cantidad" id="v-cant" type="number" min="1" suffix="und" value={v.cantidad} onChange={form.bind('cantidad')} />
        <Field label="Precio por unidad" id="v-precio" type="number" min="0" prefix="$" value={v.precioUnitario} onChange={form.bind('precioUnitario')} />
        <Field as="select" label="Canal" id="v-canal" value={v.canal} onChange={form.bind('canal')} options={CANALES} />
        <Field label="Fecha" id="v-fecha" type="date" value={v.fecha} onChange={form.bind('fecha')} />
        <Field label="Cliente" id="v-cli" value={v.cliente} onChange={form.bind('cliente')} placeholder="Opcional" />
        <Field label="Envío o comisión que asumes" id="v-env" type="number" min="0" prefix="$" value={v.costoEnvio} onChange={form.bind('costoEnvio')} placeholder="0" />
        {c.preview && (
          <div className="preview totals span-2">
            <div><span>Total venta</span><b>{fmtMoney(c.preview.ingreso)}</b></div>
            <div><span>Costo</span><b>{fmtMoney(c.preview.costo)}</b></div>
            <div className={c.preview.utilidad >= 0 ? 'pos' : 'neg'}><span>Utilidad</span><b>{fmtMoney(c.preview.utilidad)}</b></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
