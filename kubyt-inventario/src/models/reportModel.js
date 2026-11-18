/**
 * MODELO · Informes (funciones puras sobre los datos ya cargados)
 *
 * Utilidad del mes = Ingresos − Material vendido − Mano de obra vendida
 *                    − Envíos/comisiones − Gastos administrativos del mes
 * Gastos administrativos del mes = gastos no inversión del mes + cuotas de máquinas.
 * Nota: aquí NO se suma el costo estimado de impresión (luz + desgaste) de cada venta,
 * porque el recibo de luz y los repuestos reales ya entran como gastos del mes.
 */
import { cuotaMensual } from './gastosModel';
import { etiquetaInsumo } from './insumosModel';

const n = (v) => Number(v) || 0;
export const mesDe = (fecha) => (fecha || '').slice(0, 7); // 'AAAA-MM'
export const mesActual = () => new Date().toLocaleDateString('en-CA').slice(0, 7);

/** Diferencia en meses entre dos 'AAAA-MM'. */
const difMeses = (a, b) => {
  const [ya, ma] = a.split('-').map(Number);
  const [yb, mb] = b.split('-').map(Number);
  return (yb - ya) * 12 + (mb - ma);
};

export function mesesAtras(mes, cantidad) {
  const [y, m] = mes.split('-').map(Number);
  return Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(y, m - 1 - (cantidad - 1 - i), 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
}

export function nombreMes(mes, corto = false) {
  const [y, m] = mes.split('-').map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString('es-CO', { month: corto ? 'short' : 'long', year: corto ? undefined : 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');
}

/**
 * Gastos administrativos por mes, calculados desde el módulo Gastos (para el costo de los productos).
 * Promedia los últimos 3 meses que tienen gastos (un negocio nuevo no se castiga con meses vacíos).
 * La categoría «Luz» se excluye: la luz de la impresora ya se cobra por hora de impresión.
 */
export function adminMensualEstimado(gastos, mes = mesActual()) {
  const sinLuz = (gastos || []).filter((g) => g.categoria !== 'luz');
  const meses = mesesAtras(mes, 3)
    .map((m) => ({ mes: m, ...adminDelMes(sinLuz, m) }))
    .filter((m) => m.total > 0);
  const promedio = meses.length ? meses.reduce((s, m) => s + m.total, 0) / meses.length : 0;
  const luzExcluida = (gastos || []).some((g) => g.categoria === 'luz' && !g.esInversion);
  // Detalle: cuánto aporta cada gasto al promedio mensual (para que se vea de dónde sale).
  const usados = new Set(meses.map((m) => m.mes));
  const detalle = {};
  for (const g of sinLuz) {
    for (const m of usados) {
      let aporte = 0;
      if (!g.esInversion) aporte = mesDe(g.fecha) === m ? n(g.monto) : 0;
      else if (n(g.vidaUtilMeses) > 0) {
        const k = difMeses(mesDe(g.fecha), m);
        aporte = k >= 0 && k < n(g.vidaUtilMeses) ? cuotaMensual(g) : 0;
      }
      if (aporte > 0) {
        detalle[g.id] ||= { id: g.id, concepto: g.concepto, categoria: g.categoria, esInversion: !!g.esInversion, valor: 0 };
        detalle[g.id].valor += aporte / meses.length;
      }
    }
  }
  return { promedio, meses, luzExcluida, detalle: Object.values(detalle).sort((a, b) => b.valor - a.valor) };
}

export function adminDelMes(gastos, mes) {
  let gastosAdmin = 0;
  let cuotas = 0;
  for (const g of gastos) {
    if (!g.esInversion) {
      if (mesDe(g.fecha) === mes) gastosAdmin += n(g.monto);
    } else if (n(g.vidaUtilMeses) > 0) {
      const k = difMeses(mesDe(g.fecha), mes);
      if (k >= 0 && k < n(g.vidaUtilMeses)) cuotas += cuotaMensual(g);
    }
  }
  return { gastosAdmin, cuotas, total: gastosAdmin + cuotas };
}

export function resumenMes(data, mes) {
  const ventas = data.ventas.filter((v) => mesDe(v.fecha) === mes);
  const producciones = data.producciones.filter((p) => mesDe(p.fecha) === mes);
  const ingresos = ventas.reduce((s, v) => s + n(v.cantidad) * n(v.precioUnitario), 0);
  const material = ventas.reduce((s, v) => s + n(v.cantidad) * (n(v.costoMaterial) + n(v.costoEmpaque)), 0);
  const manoObra = ventas.reduce((s, v) => s + n(v.cantidad) * n(v.costoManoObra), 0);
  const envios = ventas.reduce((s, v) => s + n(v.costoEnvio), 0);
  const admin = adminDelMes(data.gastos, mes);
  const costo = material + manoObra + envios + admin.total;
  const utilidad = ingresos - costo;
  const unidadesVendidas = ventas.reduce((s, v) => s + n(v.cantidad), 0);
  const unidadesProducidas = producciones.reduce((s, p) => s + n(p.cantidadOk), 0);
  const fallidas = producciones.reduce((s, p) => s + n(p.cantidadFallida), 0);
  return {
    mes,
    ingresos,
    material,
    manoObra,
    envios,
    admin,
    costo,
    utilidad,
    margen: ingresos > 0 ? utilidad / ingresos : 0,
    unidadesVendidas,
    unidadesProducidas,
    fallidas,
    adminPorUnidad: unidadesProducidas > 0 ? admin.total / unidadesProducidas : 0,
    ventas,
    producciones,
  };
}

export const serieMeses = (data, mes, cantidad = 6) =>
  mesesAtras(mes, cantidad).map((m) => {
    const r = resumenMes(data, m);
    return { mes: m, ingresos: r.ingresos, utilidad: r.utilidad };
  });

/** Rentabilidad por producto: el administrativo del mes se reparte por unidad vendida. */
export function porProducto(resumen) {
  const adminUnidad = resumen.unidadesVendidas > 0 ? resumen.admin.total / resumen.unidadesVendidas : 0;
  const map = {};
  for (const v of resumen.ventas) {
    const k = v.productoId;
    map[k] ||= { productoId: k, nombre: v.productoNombre, unidades: 0, ingresos: 0, costo: 0 };
    const cant = n(v.cantidad);
    map[k].unidades += cant;
    map[k].ingresos += cant * n(v.precioUnitario);
    map[k].costo += cant * (n(v.costoMaterial) + n(v.costoEmpaque) + n(v.costoManoObra) + adminUnidad) + n(v.costoEnvio);
  }
  return Object.values(map)
    .map((r) => ({ ...r, utilidad: r.ingresos - r.costo, margen: r.ingresos > 0 ? (r.ingresos - r.costo) / r.ingresos : 0 }))
    .sort((a, b) => b.utilidad - a.utilidad);
}

export function porCanal(resumen, canales) {
  const map = {};
  for (const v of resumen.ventas) {
    map[v.canal] = (map[v.canal] || 0) + n(v.cantidad) * n(v.precioUnitario);
  }
  return canales
    .map((c) => ({ key: c.value, label: c.label, valor: map[c.value] || 0 }))
    .filter((r) => r.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

export function consumoFilamento(resumen, insumosById) {
  const map = {};
  for (const p of resumen.producciones) {
    for (const c of p.consumos || []) {
      const ins = insumosById[c.insumoId];
      if (ins && ins.tipo !== 'filamento') continue;
      map[c.insumoId] = (map[c.insumoId] || 0) + n(c.cantidad);
    }
  }
  return Object.entries(map)
    .map(([id, g]) => ({ key: id, label: etiquetaInsumo(insumosById[id]) || 'Material eliminado', valor: g }))
    .sort((a, b) => b.valor - a.valor);
}

/** Inversión total y cuánto se ha recuperado (todo el historial). */
export function inversion(data) {
  const equipos = data.gastos.filter((g) => g.esInversion).reduce((s, g) => s + n(g.monto), 0);
  const administrativos = data.gastos.filter((g) => !g.esInversion).reduce((s, g) => s + n(g.monto), 0);
  const insumos = data.compras.reduce((s, c) => s + n(c.costoTotal), 0);
  const totalGastado = equipos + administrativos + insumos;
  const ingresos = data.ventas.reduce((s, v) => s + n(v.cantidad) * n(v.precioUnitario) - n(v.costoEnvio), 0);
  const aportes = data.aportes.reduce((s, a) => s + n(a.monto), 0);
  const balance = ingresos - totalGastado;
  return {
    equipos,
    administrativos,
    insumos,
    totalGastado,
    ingresos,
    aportes,
    balance,
    recuperacion: totalGastado > 0 ? Math.min(ingresos / totalGastado, 9.99) : 0,
  };
}

export const stockBajo = (insumos) =>
  insumos.filter((i) => n(i.stockMinimo) > 0 && n(i.stock) <= n(i.stockMinimo));

/** Valor del inventario actual (insumos a costo + productos a costo de material y mano de obra). */
export const valorInventario = (insumos) => insumos.reduce((s, i) => s + Math.max(n(i.stock), 0) * n(i.costoUnitario), 0);
