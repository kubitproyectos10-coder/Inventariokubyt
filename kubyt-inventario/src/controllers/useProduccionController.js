/** CONTROLADOR · Producción */
import { anularProduccion, consumoTanda, faltantes, registrarProduccion, today, validarProduccion } from '../models';
import { useData } from './DataController';
import { useFormModal } from './useFormModal';
import { useSearch } from './useSearch';
import { useUI } from './UIController';

const n = (v) => Number(v) || 0;

export function useProduccionController() {
  const data = useData();
  const { confirm, toast } = useUI();
  const search = useSearch(data.producciones, ['productoNombre', 'nota']);

  const form = useFormModal({
    empty: { productoId: '', cantidadOk: '', cantidadFallida: '', fecha: today(), nota: '' },
    validate: (v) => validarProduccion(v, data.productosById[v.productoId]),
    onCreate: (v) => registrarProduccion({ ...v, producto: data.productosById[v.productoId] }, data.insumosById, data.ajustes),
    messages: { created: 'Producción registrada · stock actualizado' },
  });

  /** Abre el formulario, o explica qué falta antes y lleva al módulo correcto. */
  const abrir = async (navigate) => {
    if (!data.productos.length) {
      if (await confirm({ title: 'Primero crea un producto', message: 'La producción suma unidades a un producto y descuenta su materia prima según la receta.', confirmLabel: 'Crear producto', danger: false })) navigate('productos', 'nuevo');
      return;
    }
    form.openNew();
  };

  const producto = data.productosById[form.values.productoId];
  const piezas = n(form.values.cantidadOk) + n(form.values.cantidadFallida);
  const consumo = consumoTanda(producto, piezas).map((c) => ({ ...c, insumo: data.insumosById[c.insumoId] }));
  const falta = producto ? faltantes(producto, piezas, data.insumosById) : [];

  const anular = async (p) => {
    if (await confirm({ title: '¿Anular esta producción?', message: `Se restarán ${p.cantidadOk} unidades de ${p.productoNombre} y se devolverá la materia prima.`, confirmLabel: 'Anular' })) {
      try {
        await anularProduccion(p);
        toast('Producción anulada');
      } catch (e) {
        toast(e.message, 'error');
      }
    }
  };

  return { data, search, form, abrir, producto, consumo, falta, anular };
}
