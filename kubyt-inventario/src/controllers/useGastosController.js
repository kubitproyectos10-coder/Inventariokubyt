/** CONTROLADOR · Gastos administrativos e inversiones */
import {
  CATEGORIAS_GASTO, GASTO_VACIO, adminDelMes, crearGasto, descargarCSV, editarGasto, eliminarGasto, inversion,
  labelOf, mesActual, today, validarGasto,
} from '../models';
import { useData } from './DataController';
import { useFormModal } from './useFormModal';
import { useSearch } from './useSearch';
import { useUI } from './UIController';

export function useGastosController() {
  const data = useData();
  const { confirm, toast } = useUI();
  const search = useSearch(data.gastos, ['concepto', 'nota'], { filterField: 'categoria' });

  const gasto = useFormModal({
    empty: { ...GASTO_VACIO, fecha: today() },
    validate: validarGasto,
    onCreate: crearGasto,
    onUpdate: editarGasto,
    messages: { created: 'Gasto registrado', updated: 'Gasto actualizado' },
  });

  /** Máquinas y herramientas son compras que duran: se marcan como inversión (36 / 12 meses por defecto). */
  const VIDA_UTIL = { maquina: 36, herramienta: 12 };
  const elegirCategoria = (cat) => {
    gasto.set('categoria', cat);
    if (VIDA_UTIL[cat] && !gasto.isEdit) {
      gasto.set('esInversion', true);
      if (!Number(gasto.values.vidaUtilMeses)) gasto.set('vidaUtilMeses', VIDA_UTIL[cat]);
    }
  };

  const borrar = async (row) => {
    if (await confirm({ title: `¿Eliminar ${row.concepto}?` })) {
      await eliminarGasto(row.id);
      toast('Eliminado');
    }
  };

  const mes = mesActual();
  const adminMes = adminDelMes(data.gastos, mes);
  const inv = inversion(data);

  const exportar = () =>
    descargarCSV('kubyt-gastos', [
      { label: 'Fecha', value: (g) => g.fecha },
      { label: 'Concepto', value: (g) => g.concepto },
      { label: 'Categoría', value: (g) => labelOf(CATEGORIAS_GASTO, g.categoria) },
      { label: 'Tipo', value: (g) => (g.esInversion ? 'Inversión' : 'Administrativo') },
      { label: 'Monto', value: (g) => g.monto },
      { label: 'Vida útil (meses)', value: (g) => g.vidaUtilMeses || '' },
    ], search.result);

  return { data, search, gasto, elegirCategoria, borrar, adminMes, inv, exportar };
}
