/** MODELO · Formatos de presentación (moneda, números, fechas, CSV). */
const num = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 });
// useGrouping 'always': pone el punto de miles también en números de 4 cifras (es-CO lo omite: "5000").
const miles = (dec) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: dec, useGrouping: 'always' });
const entero = miles(0);
const conDecimales = miles(2);

/** Pesos colombianos: $65.000 · -$1.200 (signo pegado, punto de miles). */
export const fmtMoney = (v) => {
  const x = Math.round(Number(v) || 0);
  return `${x < 0 ? '-' : ''}$${entero.format(Math.abs(x))}`;
};
export const fmtNum = (v) => num.format(Number(v) || 0);
export const fmtPct = (v) => `${Math.round((Number(v) || 0) * 100)}%`;
export const fmtQty = (v, unidad) => `${fmtNum(v)} ${unidad || ''}`.trim();
/** Costo por gramo con decimales (ej. $80,5/g · $1.250/und). */
export const fmtUnitCost = (v, unidad) => `$${conDecimales.format(Number(v) || 0)}/${unidad || 'und'}`;

export function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
}

/** Genera y descarga un CSV que Excel abre con tildes correctas. */
export function descargarCSV(nombre, columnas, filas) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lineas = [columnas.map((c) => esc(c.label)).join(';'), ...filas.map((f) => columnas.map((c) => esc(c.value(f))).join(';'))];
  const blob = new Blob(['﻿' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${nombre}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
