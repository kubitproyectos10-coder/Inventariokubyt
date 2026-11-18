/** CONTROLADOR · Tablero de inicio */
import { useMemo } from 'react';
import { mesActual, mesDe, stockBajo, totalesVentas } from '../models';
import { useData } from './DataController';

export function useDashboardController() {
  const data = useData();
  return useMemo(() => {
    const mes = mesActual();
    return {
      data,
      mes,
      // Ganancia de lo vendido (precio − costo por pieza). La utilidad con todos los gastos reales va en Informes.
      mesVentas: totalesVentas(data.ventas.filter((v) => mesDe(v.fecha) === mes)),
      bajos: stockBajo(data.insumos),
      ultimasVentas: data.ventas.slice(0, 5),
      sinStock: data.productos.filter((p) => (Number(p.stock) || 0) <= 0 && p.activo !== false),
      vacio: !data.insumos.length && !data.productos.length,
    };
  }, [data]);
}
