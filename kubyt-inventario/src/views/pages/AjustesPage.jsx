/** VISTA · Ajustes: parámetros que usan las fórmulas de costo. */
import { fmtMoney } from '../../models';
import { useAjustesController } from '../../controllers';
import { Button, Field, PageHead } from '../components';

export default function AjustesPage({ navigate }) {
  const c = useAjustesController();
  const v = c.values;
  return (
    <div className="page">
      <PageHead eyebrow="Configuración" title="Ajustes" description="Estos valores alimentan el costo de cada producto. Puedes cambiarlos cuando quieras." />
      <form className="settings" onSubmit={c.save}>
        <section className="card">
          <h3>Mano de obra</h3>
          <p className="muted">Lo que vale una hora de <b>tu</b> trabajo: preparar la impresión, quitar soportes, lijar, armar, empacar. El tiempo que la impresora trabaja sola no cuenta aquí.</p>
          <div className="form-grid">
            <Field label="Valor de la hora" id="s-hora" type="number" min="0" prefix="$" value={v.valorHoraManoObra} onChange={c.bind('valorHoraManoObra')} hint={`= ${fmtMoney((Number(v.valorHoraManoObra) || 0) / 60)} por minuto. Idea: lo que le pagarías por hora a alguien para hacerlo`} />
          </div>
        </section>
        <section className="card">
          <h3>Impresión 3D</h3>
          <p className="muted">Lo que cuesta cada hora de impresora encendida. Se multiplica por el tiempo de impresión de cada producto.</p>
          <div className="form-grid">
            <Field label="Consumo de la impresora" id="s-w" type="number" min="0" suffix="W" value={v.potenciaImpresoraW} onChange={c.bind('potenciaImpresoraW')} placeholder="150" hint="Busca el modelo de tu impresora: Bambu A1 ≈ 95 W, P1S ≈ 110 W, X1C ≈ 150 W. Si no sabes, deja 150" />
            <Field label="Precio del kWh" id="s-kwh" type="number" min="0" prefix="$" value={v.precioKwh} onChange={c.bind('precioKwh')} placeholder="900" hint="En tu recibo de luz: el valor de cada kWh (no el consumo del mes). Si no aparece: total de energía ÷ kWh consumidos" />
            <Field label="Desgaste y repuestos por hora" id="s-desg" type="number" min="0" prefix="$" value={v.desgasteHora} onChange={c.bind('desgasteHora')} placeholder="300" hint="Lo que gastas en repuestos ÷ horas que duran. Ej.: boquilla $40.000 ÷ 500 h = $80. Si no sabes, pon 100" />
            <Field label="Piezas que salen mal" id="s-fallos" type="number" min="0" max="90" suffix="%" value={v.porcentajeFallos} onChange={c.bind('porcentajeFallos')} placeholder="5" hint="De cada 100 piezas, ¿cuántas se dañan? Si no llevas la cuenta, pon 5" />
          </div>
          <div className="note-row">
            <span>Cada hora de impresión cuesta: <b>{fmtMoney(c.costoHora)}</b></span>
            <span className="muted small">La compra de la impresora va en Gastos e inversión (no la pongas aquí)</span>
          </div>
        </section>
        <section className="card">
          <h3>Gastos administrativos por unidad</h3>
          <p className="muted">Los gastos fijos del negocio se reparten entre todo lo que produces. Si gastas $200.000 al mes y haces 100 piezas, cada pieza carga $2.000.</p>
          <div className="form-grid">
            <div className="field">
              <label>Gastos administrativos al mes</label>
              <div className="readout">
                <b>{fmtMoney(c.adminMes)}</b>
                <button type="button" className="link" onClick={() => navigate('gastos')}>Ver en Gastos</button>
              </div>
              <small>
                {c.adminInfo.meses.length
                  ? `Se calcula solo con lo que registras en Gastos e inversión (promedio de ${c.adminInfo.meses.length === 1 ? 'el último mes' : `los últimos ${c.adminInfo.meses.length} meses`}, incluye la cuota mensual de las máquinas).`
                  : 'Aún no registras gastos. Ve a Gastos e inversión y anota internet, suscripciones, publicidad, la compra de la impresora…'}
                {c.adminInfo.luzExcluida && ' La luz no se cuenta aquí porque ya se cobra por hora de impresión.'}
              </small>
            </div>
            <Field label="Unidades que producen al mes" id="s-und" type="number" min="0" suffix="und" value={v.unidadesEstimadasMes} onChange={c.bind('unidadesEstimadasMes')} hint="Cuántas piezas haces en un mes normal, sumando todos tus productos. Si lo dejas en 0, los gastos no se reparten" />
          </div>
          {c.adminInfo.detalle.length > 0 && (
            <details className="admin-detail">
              <summary>¿De dónde salen los {fmtMoney(c.adminMes)}? Ver gastos incluidos</summary>
              <ul>
                {c.adminInfo.detalle.map((d) => (
                  <li key={d.id}>
                    <span>{d.concepto}<small>{d.esInversion ? 'cuota mensual de inversión' : 'administrativo'}</small></span>
                    <b>{fmtMoney(d.valor)}</b>
                  </li>
                ))}
              </ul>
              <p className="note">Si ves una compra grande que no se repite cada mes (impresora, herramientas, un lote de material), edítala en Gastos y márcala como <b>Inversión</b> con su vida útil en meses: así se reparte en cuotas y no infla el costo de un solo mes.</p>
            </details>
          )}
          <div className="note-row">
            <span>Administrativo por unidad: <b>{fmtMoney(c.adminUnidad)}</b>{Number(v.unidadesEstimadasMes) > 0 && <span className="muted"> = {fmtMoney(c.adminMes)} ÷ {v.unidadesEstimadasMes} piezas</span>}</span>
            {c.unidadesProm > 0 && (
              <button type="button" className="link" onClick={c.usarPromedios}>
                Usar lo que produces en realidad: {Math.round(c.unidadesProm)} und/mes
              </button>
            )}
          </div>
        </section>
        <section className="card">
          <h3>Ganancia por defecto</h3>
          <p className="muted">Porcentaje del precio que quieres que te quede de ganancia. Cada producto nuevo empieza con este valor y luego puedes cambiarlo en el producto.</p>
          <div className="form-grid">
            <Field label="Ganancia que quieres" id="s-margen" type="number" min="0" max="95" suffix="%" value={v.margenObjetivo} onChange={c.bind('margenObjetivo')} />
          </div>
        </section>
        <div className="settings-foot">
          <Button type="submit" loading={c.saving} disabled={!c.dirty}>Guardar ajustes</Button>
          {c.dirty && <span className="muted small">Tienes cambios sin guardar</span>}
        </div>
      </form>
    </div>
  );
}
