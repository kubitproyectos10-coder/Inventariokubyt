/** CONTROLADOR · Informes por mes */
import { useMemo, useState } from 'react';
import {
  CANALES, consumoFilamento, descargarCSV, fmtPct, inversion, mesActual, porCanal, porProducto, resumenMes,
  serieMeses, stockBajo,
} from '../models';
import { useData } from './DataController';

export function useInformesController() {
  const data = useData();
  const [mes, setMes] = useState(mesActual());

  const r = useMemo(() => {
    const resumen = resumenMes(data, mes);
    return {
      resumen,
      serie: serieMeses(data, mes, 6),
      productos: porProducto(resumen),
      canales: porCanal(resumen, CANALES),
      filamento: consumoFilamento(resumen, data.insumosById),
      inv: inversion(data),
      bajos: stockBajo(data.insumos),
    };
  }, [data, mes]);

  const exportarProductos = () =>
    descargarCSV(`kubyt-rentabilidad-${mes}`, [
      { label: 'Producto', value: (p) => p.nombre },
      { label: 'Unidades', value: (p) => p.unidades },
      { label: 'Ingresos', value: (p) => Math.round(p.ingresos) },
      { label: 'Costo', value: (p) => Math.round(p.costo) },
      { label: 'Utilidad', value: (p) => Math.round(p.utilidad) },
      { label: 'Margen', value: (p) => fmtPct(p.margen) },
    ], r.productos);

  const exportarResumen = () => {
    const s = r.resumen;
    descargarCSV(`kubyt-resultado-${mes}`, [
      { label: 'Concepto', value: (x) => x[0] },
      { label: 'Valor', value: (x) => Math.round(x[1]) },
    ], [
      ['Ingresos', s.ingresos], ['Material', s.material], ['Mano de obra', s.manoObra], ['Envíos y comisiones', s.envios],
      ['Gastos administrativos', s.admin.gastosAdmin], ['Cuotas de máquinas', s.admin.cuotas], ['Utilidad', s.utilidad],
      ['Unidades vendidas', s.unidadesVendidas], ['Unidades producidas', s.unidadesProducidas],
    ]);
  };

  return { data, mes, setMes, ...r, exportarProductos, exportarResumen };
}
