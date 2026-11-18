/** VISTA · Materia prima (filamentos, cajas, empaques, accesorios) y su historial de compras. */
import { TIPOS_INSUMO, UNIDADES, etiquetaInsumo, fmtDate, fmtMoney, fmtNum, fmtQty, fmtUnitCost, labelOf } from '../../models';
import { useAutoOpen, useInsumosController } from '../../controllers';
import { Button, EmptyState, Field, Icon, Modal, PageHead, Paginado, RowActions, Stat, Tabs, Toolbar } from '../components';

const n = (v) => Number(v) || 0;

export default function InsumosPage({ action, navigate }) {
  const c = useInsumosController();
  const { form, compra } = c;
  const v = form.values;
  // Desde "+ Registrar": si aún no hay materiales, primero hay que crear uno.
  useAutoOpen(action, () => (c.data.insumos.length ? compra.openNew() : form.openNew()), navigate, 'insumos');
  // Desde Productos ("Crear materia prima"): abre directo el formulario del material.
  useAutoOpen(action, () => form.openNew(), navigate, 'insumos', true, 'nuevo-material');

  return (
    <div className="page">
      <PageHead eyebrow="Inventario" title="Materia prima" description="Todo lo que usas para fabricar tus productos: filamentos, cajas, empaques y accesorios.">
        <Button icon="+" onClick={() => form.openNew()}>Nueva materia prima</Button>
      </PageHead>

      <div className="kpis kpis-3">
        <Stat label="Materiales registrados" value={c.data.insumos.length} hint="Materiales distintos" />
        <Stat label="Valor en bodega" value={fmtMoney(c.valorTotal)} hint="Stock × costo promedio" />
        <Stat label="Stock bajo" value={c.bajos} hint="Al nivel mínimo o menos" tone={c.bajos ? 'alert' : undefined} />
      </div>

      <Tabs value={c.tab} onChange={c.setTab} options={[
        { value: 'insumos', label: 'Materiales', count: c.data.insumos.length },
        { value: 'compras', label: 'Historial de compras', count: c.data.compras.length },
      ]} />

      {c.tab === 'insumos' ? (
        <>
          <Toolbar search={c.search} placeholder="Buscar por nombre, color o proveedor" filterOptions={TIPOS_INSUMO} filterLabel="Todos los tipos">
            <button className="icon-btn" onClick={c.exportar} title="Descargar Excel (CSV)"><Icon name="download" /></button>
          </Toolbar>
          {c.search.result.length ? (
            <Paginado rows={c.search.result} resetKey={c.search.q + c.search.filter}>
              {(filas) => (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Material</th><th>Tipo</th><th className="num">Stock</th><th className="num">Costo</th><th className="num">Valor</th><th /></tr>
                  </thead>
                  <tbody>
                    {filas.map((i) => {
                      const low = n(i.stockMinimo) > 0 && n(i.stock) <= n(i.stockMinimo);
                      return (
                        <tr key={i.id}>
                          <td>
                            <b>{i.nombre}</b>
                            {i.color && <span className="sub">{i.color}</span>}
                          </td>
                          <td>{labelOf(TIPOS_INSUMO, i.tipo)}</td>
                          <td className="num">
                            <span className={`stock ${low ? 'low' : ''}`}>{fmtQty(i.stock, i.unidad)}</span>
                            {n(i.stockMinimo) > 0 && <span className="sub">mín. {fmtQty(i.stockMinimo, i.unidad)}</span>}
                          </td>
                          <td className="num">{fmtUnitCost(i.costoUnitario, i.unidad)}</td>
                          <td className="num">{fmtMoney(Math.max(n(i.stock), 0) * n(i.costoUnitario))}</td>
                          <td>
                            <div className="row-actions">
                              <button className="btn btn-ghost btn-sm" onClick={() => compra.openNew({ insumoId: i.id })} title="Registrar una compra de este material: suma stock">+ Compra</button>
                              <RowActions onEdit={() => form.openEdit(i)} onDelete={() => c.eliminar(i)} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              )}
            </Paginado>
          ) : (
            <EmptyState title={c.data.insumos.length ? 'Sin resultados' : 'Aún no tienes materia prima'} text={c.data.insumos.length ? 'Prueba con otra búsqueda.' : 'Empieza por tus filamentos: nombre, color, gramos y lo que te costó el rollo.'}>
              {!c.data.insumos.length && <Button icon="+" onClick={() => form.openNew()}>Agregar el primero</Button>}
            </EmptyState>
          )}
        </>
      ) : c.data.compras.length ? (
        <Paginado rows={c.data.compras} resetKey={''}>
          {(filas) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Fecha</th><th>Material</th><th className="num">Cantidad</th><th className="num">Costo total</th><th>Proveedor</th><th /></tr></thead>
              <tbody>
                {filas.map((k) => (
                  <tr key={k.id}>
                    <td>{fmtDate(k.fecha)}</td>
                    <td><b>{k.insumoNombre}</b>{k.nota && <span className="sub">{k.nota}</span>}</td>
                    <td className="num">{fmtQty(k.cantidad, k.unidad)}</td>
                    <td className="num">{fmtMoney(k.costoTotal)}</td>
                    <td>{k.proveedor || '—'}</td>
                    <td><RowActions onDelete={() => c.anular(k)} deleteLabel="Anular compra" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Paginado>
      ) : (
        <EmptyState title="Sin compras registradas" text="Cuando vuelvas a comprar un material, ve a la pestaña Materiales y toca «+ Compra» en su fila. Aquí quedará el historial." />
      )}

      {/* Formulario de materia prima */}
      <Modal open={form.open} onClose={form.close} onSubmit={form.submit} saving={form.saving} error={form.error}
        eyebrow="Materia prima" title={form.isEdit ? 'Editar materia prima' : 'Nueva materia prima'}>
        <Field label="Nombre" id="i-nombre" value={v.nombre} onChange={form.bind('nombre')} placeholder="PLA Bambu Basic" autoFocus className="span-2" />
        <Field as="select" label="Tipo" id="i-tipo" value={v.tipo} onChange={form.bind('tipo')} options={TIPOS_INSUMO} />
        <Field label="Color / variante" id="i-color" value={v.color} onChange={form.bind('color')} placeholder="Violeta" />
        <Field as="select" label="Se mide en" id="i-unidad" value={v.unidad} onChange={form.bind('unidad')} options={UNIDADES} />
        <Field label="Proveedor" id="i-prov" value={v.proveedor} onChange={form.bind('proveedor')} placeholder="Opcional" />

        {!form.isEdit && (
          <div className="calc span-2">
            <b>Calcular el costo por {v.unidad === 'g' ? 'gramo' : 'unidad'}</b>
            <div className="calc-row">
              <Field label="Precio del paquete" id="i-pp" type="number" min="0" prefix="$" value={v.precioPaquete} onChange={(e) => c.calcularCosto(e.target.value, v.cantidadPaquete)} placeholder="80000" />
              <span className="calc-op">÷</span>
              <Field label={`Contenido (${v.unidad})`} id="i-cp" type="number" min="0" value={v.cantidadPaquete} onChange={(e) => c.calcularCosto(v.precioPaquete, e.target.value)} placeholder={v.unidad === 'g' ? '1000' : '50'} />
            </div>
          </div>
        )}
        <Field label={`Costo por ${v.unidad}`} id="i-costo" type="number" min="0" step="0.01" prefix="$" value={v.costoUnitario} onChange={form.bind('costoUnitario')} hint={form.isEdit ? 'Se actualiza solo al registrar compras.' : undefined} />
        <Field label={form.isEdit ? 'Stock (ajuste manual)' : 'Cantidad que tienes hoy'} id="i-stock" type="number" min="0" suffix={v.unidad} value={v.stock} onChange={form.bind('stock')} hint={v.unidad === 'g' ? 'En gramos: 1 rollo de 1 kg = 1000' : undefined} />
        {c.pareceRollo && (
          <div className="alert alert-error span-2">
            <b>Ojo: {fmtMoney(v.costoUnitario)} por gramo es muchísimo.</b> Parece que pusiste el precio del rollo.
            Un rollo de 1 kg a {fmtMoney(v.costoUnitario)} = <b>{fmtUnitCost(n(v.costoUnitario) / 1000, 'g')}</b>
            {n(v.stock) > 0 && n(v.stock) < 50 && <>, y {fmtNum(v.stock)} rollo(s) = <b>{fmtNum(n(v.stock) * 1000)} g</b></>}.{' '}
            <button type="button" className="link" onClick={() => c.corregirRollo(1000)}>Corregir (rollos de 1 kg)</button>
          </div>
        )}
        <Field label="Avisar cuando queden" id="i-min" type="number" min="0" suffix={v.unidad} value={v.stockMinimo} onChange={form.bind('stockMinimo')} hint="Stock mínimo para la alerta" />
        {!form.isEdit && n(v.stock) > 0 && (
          <label className="check span-2">
            <input type="checkbox" checked={v.comoCompra} onChange={form.bind('comoCompra')} />
            Registrar esta cantidad como compra ({fmtMoney(n(v.stock) * n(v.costoUnitario))}), para que cuente en la inversión
          </label>
        )}
        <Field as="textarea" label="Notas" id="i-notas" value={v.notas} onChange={form.bind('notas')} className="span-2" />
      </Modal>

      {/* Formulario de compra */}
      <Modal open={compra.open} onClose={compra.close} onSubmit={compra.submit} saving={compra.saving} error={compra.error}
        eyebrow="Compra de materia prima" title="Registrar compra" submitLabel="Registrar compra">
        <p className="note span-2">Suma stock a un material que ya creaste y actualiza su costo promedio.</p>
        <Field as="select" label="Material" id="k-ins" value={compra.values.insumoId} onChange={compra.bind('insumoId')} className="span-2"
          options={[{ value: '', label: 'Elige un material…' }, ...c.data.insumos.map((i) => ({ value: i.id, label: etiquetaInsumo(i) }))]} />
        <Field label="Cantidad" id="k-cant" type="number" min="0" suffix={c.data.insumosById[compra.values.insumoId]?.unidad || ''} value={compra.values.cantidad} onChange={compra.bind('cantidad')} placeholder="1000" />
        <Field label="Costo total pagado" id="k-costo" type="number" min="0" prefix="$" value={compra.values.costoTotal} onChange={compra.bind('costoTotal')} placeholder="80000" />
        <Field label="Fecha" id="k-fecha" type="date" value={compra.values.fecha} onChange={compra.bind('fecha')} />
        <Field label="Proveedor" id="k-prov" value={compra.values.proveedor} onChange={compra.bind('proveedor')} placeholder="Opcional" />
        {c.compraEnRollos && (
          <div className="alert alert-error span-2">
            ¿Compraste solo {fmtNum(compra.values.cantidad)} g? Si son rollos de 1 kg, son <b>{fmtNum(n(compra.values.cantidad) * 1000)} g</b>.{' '}
            <button type="button" className="link" onClick={c.compraARollos}>Sí, son rollos</button>
          </div>
        )}
        {n(compra.values.cantidad) > 0 && n(compra.values.costoTotal) > 0 && (
          <p className="note span-2">Costo de esta compra: <b>{fmtUnitCost(n(compra.values.costoTotal) / n(compra.values.cantidad), c.data.insumosById[compra.values.insumoId]?.unidad)}</b>. El costo del material se promedia con el stock que ya tienes.</p>
        )}
      </Modal>
    </div>
  );
}
