/**
 * MODELO · Gastos administrativos, inversiones en equipos y aportes de socios
 *  - Gasto administrativo: internet, software, luz, publicidad… (esInversion = false)
 *  - Inversión: compra de máquinas o herramientas (esInversion = true). Si tiene vida útil,
 *    cada mes suma su cuota (monto ÷ meses) a los gastos administrativos.
 */
import { COL, create, remove, update } from './repository';

const n = (v) => Number(v) || 0;

export const GASTO_VACIO = { concepto: '', categoria: 'internet', monto: 0, fecha: '', esInversion: false, vidaUtilMeses: 0, nota: '' };
export const APORTE_VACIO = { socio: '', monto: 0, fecha: '', nota: '' };

export function validarGasto(d) {
  if (!d.concepto?.trim()) return 'Escribe el concepto.';
  if (n(d.monto) <= 0) return 'El monto debe ser mayor que cero.';
  if (!d.fecha) return 'Elige la fecha.';
  return null;
}
export function validarAporte(d) {
  if (!d.socio?.trim()) return 'Escribe quién hizo el aporte.';
  if (n(d.monto) <= 0) return 'El monto debe ser mayor que cero.';
  if (!d.fecha) return 'Elige la fecha.';
  return null;
}

const limpiarGasto = (d) => ({
  concepto: d.concepto.trim(),
  categoria: d.categoria,
  monto: n(d.monto),
  fecha: d.fecha,
  esInversion: !!d.esInversion,
  vidaUtilMeses: d.esInversion ? n(d.vidaUtilMeses) : 0,
  nota: (d.nota || '').trim(),
});
const limpiarAporte = (d) => ({ socio: d.socio.trim(), monto: n(d.monto), fecha: d.fecha, nota: (d.nota || '').trim() });

export const crearGasto = (d) => create(COL.gastos, limpiarGasto(d));
export const editarGasto = (id, d) => update(COL.gastos, id, limpiarGasto(d));
export const eliminarGasto = (id) => remove(COL.gastos, id);
export const crearAporte = (d) => create(COL.aportes, limpiarAporte(d));
export const editarAporte = (id, d) => update(COL.aportes, id, limpiarAporte(d));
export const eliminarAporte = (id) => remove(COL.aportes, id);

/** Cuota mensual de una inversión con vida útil. */
export const cuotaMensual = (g) => (g.esInversion && n(g.vidaUtilMeses) > 0 ? n(g.monto) / n(g.vidaUtilMeses) : 0);
