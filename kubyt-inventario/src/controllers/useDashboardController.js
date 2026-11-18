/** CONTROLADOR · Tablero de inicio */
import { useMemo } from 'react';
import { inversion, mesActual, mesesAtras, porProducto, resumenMes, serieMeses, stockBajo } from '../models';
import { useData } from './DataController';

export function useDashboardController() {
  const data = useData();
  return useMemo(() => {
    const mes = mesActual();
    const [anterior] = mesesAtras(mes, 2);
    const actual = resumenMes(data, mes);
    const prev = resumenMes(data, anterior);
    const variacion = (a, b) => (b !== 0 ? (a - b) / Math.abs(b) : null);
    return {
      data,
      mes,
      actual,
      varIngresos: variacion(actual.ingresos, prev.ingresos),
      varUtilidad: variacion(actual.utilidad, prev.utilidad),
      inv: inversion(data),
      bajos: stockBajo(data.insumos),
      top: porProducto(actual).slice(0, 3),
      serie: serieMeses(data, mes, 6),
      ultimasVentas: data.ventas.slice(0, 5),
      sinStock: data.productos.filter((p) => (Number(p.stock) || 0) <= 0 && p.activo !== false),
      vacio: !data.insumos.length && !data.productos.length,
    };
  }, [data]);
}
