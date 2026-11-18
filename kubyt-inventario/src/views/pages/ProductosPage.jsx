/** VISTA · Productos: catálogo, receta y costos en vivo. */
import { etiquetaInsumo, fmtMoney, fmtNum, fmtPct, horasImpresionUnidad, infoCategoria } from '../../models';
import { useAutoOpen, useProductosController } from '../../controllers';
import { Button, EmptyState, Field, Icon, Modal, PageHead, Paginado, RowActions, Toolbar } from '../components';

const n = (v) => Number(v) || 0;

/** 2.5 → "2 h 30 min" */
const fmtHoras = (h) => {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return hh ? `${hh} h${mm ? ` ${mm} min` : ''}` : `${mm} min`;
};

function CostBreakdown({ c, ajustes }) {
  const parts = [
    ['Material', c.material, 'var(--violet)'],
    ['Impresión (luz + desgaste)', c.impresion, '#B79CFF'],
    ['Piezas fallidas', c.fallos, '#FF8A84'],
    ['Empaque', c.empaque, '#6FCF97'],
    ['Mano de obra', c.manoObra, 'var(--ink2)'],
    ['Administrativo', c.admin, '#A7A6B1'],
  ].filter(([k, val]) => !['Piezas fallidas', 'Empaque'].includes(k) || val > 0);
  return (
    <div className="breakdown">
      <div className="eyebrow">Costo por unidad</div>
      <b className="big">{fmtMoney(c.total)}</b>
      {c.total <= 0 && <p className="breakdown-hint">Llena la receta y el tiempo de impresión: aquí verás cuánto te cuesta hacer una unidad.</p>}
      <div className="stack-bar">
        {parts.map(([k, val, col]) => (
          <i key={k} style={{ flex: c.total > 0 ? val / c.total : 0, background: col }} />
        ))}
      </div>
      <ul>
        {parts.map(([k, val, col]) => (
          <li key={k}><span><i style={{ background: col }} />{k}</span><b>{fmtMoney(val)}</b></li>
        ))}
      </ul>
      {c.admin > 0 && (
        <p className="breakdown-note">Administrativo = {fmtMoney(ajustes.gastosAdminEstimadosMes)} al mes ÷ {ajustes.unidadesEstimadasMes} piezas al mes (se ajusta en Ajustes).</p>
      )}
      <div className="divider" />
      <ul>
        <li><span>Precio de venta</span><b>{fmtMoney(c.precio)}</b></li>
        <li className={c.utilidad >= 0 ? 'pos' : 'neg'}><span>Utilidad</span><b>{fmtMoney(c.utilidad)} · {fmtPct(c.margen)}</b></li>
      </ul>
    </div>
  );
}

export default function ProductosPage({ action, navigate }) {
  const c = useProductosController();
  const { form } = c;
  const v = form.values;
  useAutoOpen(action, () => c.nuevo(), navigate, 'productos');
  const horasUnidad = horasImpresionUnidad(v);
  /** Cierra el formulario y lleva a otro módulo (ej. crear materia prima o configurar Ajustes). */
  const irA = (route, accion) => {
    form.close();
    navigate(route, accion);
  };

  return (
    <div className="page">
      <PageHead eyebrow="Catálogo" title="Productos" description="Lo que vendes, con su receta: el sistema calcula costo y utilidad por unidad.">
        <Button icon="+" onClick={c.nuevo}>Nuevo producto</Button>
      </PageHead>

      <Toolbar search={c.search} placeholder="Buscar por nombre o SKU" filterOptions={c.categorias} filterLabel="Todas las categorías">
        <button className="icon-btn" onClick={c.exportar} title="Descargar Excel (CSV)"><Icon name="download" /></button>
      </Toolbar>

      {c.search.result.length ? (
        <Paginado rows={c.search.result} resetKey={c.search.q + c.search.filter}>
          {(filas) => (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Producto</th><th>Categoría</th><th className="num">Stock</th><th className="num">Precio</th><th className="num">Costo</th><th className="num">Utilidad</th><th /></tr>
              </thead>
              <tbody>
                {filas.map((p) => (
                  <tr key={p.id}>
                    <td><b>{p.nombre}</b>{p.sku && <span className="sub">{p.sku}</span>}</td>
                    <td>{(() => { const cat = infoCategoria(p.linea, c.data.categoriasById); return <span className="line-chip" style={{ background: cat.bg, color: cat.fg }}>{cat.nombre}</span>; })()}</td>
                    <td className="num"><span className={`stock ${n(p.stock) <= 0 ? 'low' : ''}`}>{fmtNum(p.stock)}</span></td>
                    <td className="num">{fmtMoney(p.precioVenta)}</td>
                    <td className="num">{fmtMoney(p.costo.total)}{!(p.receta || []).length && <span className="sub warn">sin receta</span>}</td>
                    <td className="num"><b className={p.costo.utilidad >= 0 ? 'pos' : 'neg'}>{fmtMoney(p.costo.utilidad)}</b><span className="sub">{fmtPct(p.costo.margen)}</span></td>
                    <td><RowActions onEdit={() => c.editar(p)} onDelete={() => c.eliminar(p)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Paginado>
      ) : (
        <EmptyState title={c.data.productos.length ? 'Sin resultados' : 'Aún no hay productos'} text={c.data.productos.length ? 'Prueba con otra búsqueda.' : 'Crea tu primera figura armable con su receta: cuántos gramos de cada filamento y qué empaque usa.'}>
          {!c.data.productos.length && <Button icon="+" onClick={c.nuevo}>Crear producto</Button>}
        </EmptyState>
      )}

      <Modal open={form.open} onClose={form.close} onSubmit={form.submit} saving={form.saving} error={form.error} wide
        eyebrow="Producto" title={form.isEdit ? `Editar ${v.nombre || 'producto'}` : 'Nuevo producto'}
        aside={<CostBreakdown c={c.preview} ajustes={c.data.ajustes} />}>
        <Field label="Nombre" id="p-nombre" value={v.nombre} onChange={form.bind('nombre')} placeholder="Guardián Nova" autoFocus className="span-2" />
        <Field as="select" label="Categoría" id="p-linea" value={v.linea || ''} onChange={form.bind('linea')}
          options={[{ value: '', label: c.categorias.length ? 'Sin categoría' : 'Aún no tienes categorías' }, ...c.categorias]}
          hint={<button type="button" className="link" onClick={() => irA('categorias', 'nuevo')}>+ Crear categoría</button>} />
        <Field label="SKU / código" id="p-sku" value={v.sku} onChange={form.bind('sku')} placeholder="ARM-001" />

        <h4 className="form-step span-2"><span>1</span> ¿Cuánto cuesta hacerlo?</h4>
        <div className="calc span-2">
          <b>Tiempo de impresión · lo que dice tu laminador (slicer)</b>
          <div className="calc-row-3">
            <Field label="Horas" id="p-ih" type="number" min="0" suffix="h" value={v.impresionHoras} onChange={form.bind('impresionHoras')} placeholder="0" />
            <Field label="Minutos" id="p-im" type="number" min="0" max="59" suffix="min" value={v.impresionMinutos} onChange={form.bind('impresionMinutos')} placeholder="0" />
            <Field label="Unidades por placa" id="p-iu" type="number" min="1" suffix="und" value={v.unidadesPorImpresion} onChange={form.bind('unidadesPorImpresion')} placeholder="1" />
          </div>
          {horasUnidad > 0 && (
            <p className="note">Por unidad: <b>{fmtHoras(horasUnidad)}</b> de impresora · <b>{fmtMoney(c.preview.impresion)}</b> en luz y desgaste</p>
          )}
          {horasUnidad > 0 && !c.preview.impresion && (
            <p className="note">Aún no configuras cuánto cuesta la hora de impresión. <button type="button" className="link" onClick={() => irA('ajustes')}>Configurar en Ajustes</button></p>
          )}
        </div>

        <div className="recipe span-2">
          <div className="recipe-head">
            <b>Receta · lo que consume imprimir una unidad</b>
            {c.data.insumos.length > 0 && <button type="button" className="link" onClick={c.addLine}>+ Agregar material</button>}
          </div>
          {!c.data.insumos.length && (
            <p className="note">Aún no tienes materia prima para armar la receta. <button type="button" className="link" onClick={() => irA('insumos', 'nuevo-material')}>Crear materia prima</button></p>
          )}
          {c.receta.map((r, i) => {
            const ins = c.data.insumosById[r.insumoId];
            return (
              <div className="recipe-row" key={i}>
                <select value={r.insumoId} onChange={(e) => c.setLine(i, 'insumoId', e.target.value)} aria-label="Material">
                  <option value="">Elige un material…</option>
                  {c.data.insumos.map((x) => <option key={x.id} value={x.id}>{etiquetaInsumo(x)}</option>)}
                </select>
                <div className="field-box qty">
                  <input type="number" min="0" step="0.1" value={r.cantidad} onChange={(e) => c.setLine(i, 'cantidad', e.target.value)} aria-label="Cantidad" placeholder="0" />
                  <span className="affix">{ins?.unidad || ''}</span>
                </div>
                <span className="recipe-cost">{fmtMoney(n(r.cantidad) * n(ins?.costoUnitario))}</span>
                <button type="button" className="icon-btn danger" onClick={() => c.removeLine(i)} aria-label="Quitar"><Icon name="trash" size={16} /></button>
              </div>
            );
          })}
        </div>
        <p className="note span-2">La caja o bolsa no va en la receta: se descuenta al vender, según el empaque que elijas en cada venta.</p>
        <Field as="select" label="Empaque habitual" id="p-emp" value={v.empaqueId || ''} onChange={form.bind('empaqueId')} className="span-2"
          hint="Se usa para calcular el precio y viene elegido al vender (puedes cambiarlo en cada venta)"
          options={[{ value: '', label: 'Sin empaque' }, ...c.empaques.map((e) => ({ value: e.id, label: `${etiquetaInsumo(e)} · ${fmtMoney(e.costoUnitario)}` }))]} />
        <Field label="Mano de obra por unidad" id="p-min" type="number" min="0" suffix="min" value={v.minutosManoObra} onChange={form.bind('minutosManoObra')} hint="Preparar, retirar soportes, armar, empacar" className="span-2" />

        <h4 className="form-step span-2"><span>2</span> ¿A cuánto lo vendes?</h4>
        <div className="calc span-2">
          <label className="check">
            <input type="checkbox" checked={!!v.precioAuto} onChange={form.bind('precioAuto')} />
            Calcular el precio automáticamente según la ganancia que quiero
          </label>
          {v.precioAuto ? (
            <>
              <div className="calc-row-2">
                <Field label="Ganancia que quieres" id="p-margen" type="number" min="0" max="94" suffix="%" value={v.margen} onChange={form.bind('margen')} hint="De cada venta, este % te queda de ganancia" />
                <Field label="Precio de venta" id="p-precio" prefix="$" value={fmtNum(c.preview.precio)} readOnly hint="Se calcula solo y se redondea a los $100" />
              </div>
              {c.preview.total <= 0 && <p className="note">El precio aparecerá cuando llenes la receta o el tiempo de impresión.</p>}
            </>
          ) : (
            <div className="calc-row-2">
              <Field label="Precio de venta" id="p-precio" type="number" min="0" prefix="$" value={v.precioVenta} onChange={form.bind('precioVenta')} />
              {c.preview.total > 0 && (
                <p className="note">Con {fmtNum(v.margen)} % de ganancia sería <b>{fmtMoney(c.sugerido)}</b>. <button type="button" className="link" onClick={c.usarSugerido}>Usar este precio</button></p>
              )}
            </div>
          )}
        </div>

        <Field label="Stock actual" id="p-stock" type="number" min="0" suffix="und" value={v.stock} onChange={form.bind('stock')} hint="Normalmente lo actualiza Producción y Ventas" />
        <Field as="textarea" label="Notas" id="p-notas" value={v.notas} onChange={form.bind('notas')} />
      </Modal>
    </div>
  );
}
