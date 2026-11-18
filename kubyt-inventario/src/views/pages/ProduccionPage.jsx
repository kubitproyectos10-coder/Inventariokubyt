/** VISTA · Producción: cada tanda impresa suma producto y descuenta insumos. */
import { etiquetaInsumo, fmtDate, fmtMoney, fmtQty } from '../../models';
import { useAutoOpen, useProduccionController } from '../../controllers';
import { Button, EmptyState, Field, Modal, PageHead, Paginado, RowActions, Toolbar } from '../components';

export default function ProduccionPage({ action, navigate }) {
  const c = useProduccionController();
  const { form } = c;
  const v = form.values;
  useAutoOpen(action, () => c.abrir(navigate), navigate, 'produccion');

  return (
    <div className="page">
      <PageHead eyebrow="Taller" title="Producción" description="Registra cada tanda: el stock del producto sube y la materia prima se descuenta según la receta.">
        <Button icon="+" onClick={() => c.abrir(navigate)}>Registrar producción</Button>
      </PageHead>

      <Toolbar search={c.search} placeholder="Buscar por producto o nota" />
      {c.search.result.length ? (
        <Paginado rows={c.search.result} resetKey={c.search.q}>
          {(filas) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Producto</th><th className="num">Buenas</th><th className="num">Fallidas</th><th>Consumo</th><th className="num">Material / und</th><th /></tr></thead>
              <tbody>
                {filas.map((p) => (
                  <tr key={p.id}>
                    <td>{fmtDate(p.fecha)}</td>
                    <td><b>{p.productoNombre}</b>{p.nota && <span className="sub">{p.nota}</span>}</td>
                    <td className="num">{p.cantidadOk}</td>
                    <td className="num">{p.cantidadFallida ? <span className="stock low">{p.cantidadFallida}</span> : '0'}</td>
                    <td className="consumo">
                      {(p.consumos || []).map((k) => {
                        const ins = c.data.insumosById[k.insumoId];
                        return <span key={k.insumoId} className="pill">{ins ? etiquetaInsumo(ins) : 'Material'} · {fmtQty(k.cantidad, ins?.unidad)}</span>;
                      })}
                    </td>
                    <td className="num">{fmtMoney(p.costoMaterialUnidad)}</td>
                    <td><RowActions onDelete={() => c.anular(p)} deleteLabel="Anular" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Paginado>
      ) : (
        <EmptyState title="Sin producciones" text="Cuando termines una tanda de impresión, regístrala aquí con las piezas buenas y las fallidas." />
      )}

      <Modal open={form.open} onClose={form.close} onSubmit={form.submit} saving={form.saving} error={form.error}
        eyebrow="Producción" title="Registrar tanda" submitLabel="Registrar producción">
        <Field as="select" label="Producto" id="pr-prod" value={v.productoId} onChange={form.bind('productoId')} className="span-2" autoFocus
          options={[{ value: '', label: 'Elige un producto…' }, ...c.data.productos.map((p) => ({ value: p.id, label: `${p.nombre} (stock ${p.stock || 0})` }))]} />
        <Field label="Piezas buenas" id="pr-ok" type="number" min="0" suffix="und" value={v.cantidadOk} onChange={form.bind('cantidadOk')} />
        <Field label="Piezas fallidas" id="pr-fail" type="number" min="0" suffix="und" value={v.cantidadFallida} onChange={form.bind('cantidadFallida')} hint="También gastan material" />
        <Field label="Fecha" id="pr-fecha" type="date" value={v.fecha} onChange={form.bind('fecha')} />
        <Field label="Nota" id="pr-nota" value={v.nota} onChange={form.bind('nota')} placeholder="Opcional" />

        {c.producto && (
          <div className="preview span-2">
            <b>Se descontará de la materia prima</b>
            {!c.consumo.length ? (
              <p className="note">Este producto no tiene receta: no se descontará materia prima.</p>
            ) : (
              <ul>
                {c.consumo.map((k) => (
                  <li key={k.insumoId}>
                    <span>{etiquetaInsumo(k.insumo)}</span>
                    <b>{fmtQty(k.cantidad, k.insumo?.unidad)}</b>
                    <small>quedan {fmtQty((Number(k.insumo?.stock) || 0) - k.cantidad, k.insumo?.unidad)}</small>
                  </li>
                ))}
              </ul>
            )}
            {c.falta.length > 0 && (
              <div className="alert alert-error">
                No alcanza: {c.falta.map((f) => `${f.nombre} (faltan ${fmtQty(f.falta, f.unidad)})`).join(', ')}. Registra una compra primero.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
