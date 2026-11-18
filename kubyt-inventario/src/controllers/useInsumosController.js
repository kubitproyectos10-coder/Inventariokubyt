/** CONTROLADOR · Insumos y compras */
import { useState } from 'react';
import {
  INSUMO_VACIO, TIPOS_INSUMO, anularCompra, crearInsumo, descargarCSV, editarInsumo, eliminarInsumo,
  etiquetaInsumo, labelOf, productosQueUsan, registrarCompra, today, validarCompra, validarInsumo,
} from '../models';
import { useData } from './DataController';
import { useFormModal } from './useFormModal';
import { useSearch } from './useSearch';
import { useUI } from './UIController';

const n = (v) => Number(v) || 0;
const FIELDS = ['nombre', 'color', 'proveedor'];

export function useInsumosController() {
  const data = useData();
  const { confirm, toast } = useUI();
  const [tab, setTab] = useState('insumos');
  const search = useSearch(data.insumos, FIELDS, { filterField: 'tipo' });

  const form = useFormModal({
    empty: { ...INSUMO_VACIO, comoCompra: true, precioPaquete: '', cantidadPaquete: '' },
    validate: validarInsumo,
    onCreate: (v) => crearInsumo(v, { comoCompra: v.comoCompra, fecha: today() }),
    onUpdate: editarInsumo,
    messages: { created: 'Materia prima creada', updated: 'Materia prima actualizada' },
  });

  /** Calculadora: precio del paquete ÷ cantidad = costo por g/und. */
  const calcularCosto = (precio, cantidad) => {
    form.set('precioPaquete', precio);
    form.set('cantidadPaquete', cantidad);
    if (n(cantidad) > 0) form.set('costoUnitario', Math.round((n(precio) / n(cantidad)) * 100) / 100);
  };

  /**
   * Error común: poner 1 (rollo) como stock y $65.000 como costo "por gramo".
   * Si el costo por gramo es ≥ $1.000 casi seguro es el precio del rollo.
   */
  const pareceRollo = form.values.unidad === 'g' && n(form.values.costoUnitario) >= 1000;
  const corregirRollo = (gramos = 1000) => {
    form.set('costoUnitario', Math.round((n(form.values.costoUnitario) / gramos) * 100) / 100);
    if (n(form.values.stock) > 0 && n(form.values.stock) < 50) form.set('stock', n(form.values.stock) * gramos);
    if (n(form.values.stockMinimo) > 0 && n(form.values.stockMinimo) < 50) form.set('stockMinimo', n(form.values.stockMinimo) * gramos);
  };

  const compra = useFormModal({
    empty: { insumoId: '', cantidad: '', costoTotal: '', proveedor: '', fecha: today(), nota: '' },
    validate: validarCompra,
    onCreate: registrarCompra,
    messages: { created: 'Compra registrada · stock actualizado' },
  });

  const eliminar = async (ins) => {
    const usan = productosQueUsan(ins.id, data.productos);
    if (usan.length) {
      toast(`No se puede eliminar: lo usan ${usan.map((p) => p.nombre).join(', ')}.`, 'error');
      return;
    }
    if (await confirm({ title: `¿Eliminar ${etiquetaInsumo(ins)}?`, message: 'Las compras registradas se conservan en el historial.' })) {
      await eliminarInsumo(ins.id);
      toast('Material eliminado');
    }
  };

  const anular = async (c) => {
    if (await confirm({ title: '¿Anular esta compra?', message: `Se restarán ${c.cantidad} ${c.unidad} del stock de ${c.insumoNombre}.`, confirmLabel: 'Anular compra' })) {
      try {
        await anularCompra(c);
        toast('Compra anulada');
      } catch (e) {
        toast(e.message, 'error');
      }
    }
  };

  const exportar = () =>
    descargarCSV('kubyt-materia-prima', [
      { label: 'Material', value: (i) => i.nombre },
      { label: 'Color', value: (i) => i.color },
      { label: 'Tipo', value: (i) => labelOf(TIPOS_INSUMO, i.tipo) },
      { label: 'Stock', value: (i) => i.stock },
      { label: 'Unidad', value: (i) => i.unidad },
      { label: 'Stock mínimo', value: (i) => i.stockMinimo },
      { label: 'Costo unitario', value: (i) => i.costoUnitario },
      { label: 'Valor en stock', value: (i) => Math.round(n(i.stock) * n(i.costoUnitario)) },
    ], data.insumos);

  /** Compra en gramos con una cantidad muy pequeña: probablemente escribieron rollos. */
  const insCompra = data.insumosById[compra.values.insumoId];
  const compraEnRollos = insCompra?.unidad === 'g' && n(compra.values.cantidad) > 0 && n(compra.values.cantidad) < 50;
  const compraARollos = () => compra.set('cantidad', n(compra.values.cantidad) * 1000);

  const valorTotal = data.insumos.reduce((s, i) => s + Math.max(n(i.stock), 0) * n(i.costoUnitario), 0);
  const bajos = data.insumos.filter((i) => n(i.stockMinimo) > 0 && n(i.stock) <= n(i.stockMinimo)).length;

  return { data, tab, setTab, search, form, calcularCosto, pareceRollo, corregirRollo, compra, compraEnRollos, compraARollos, eliminar, anular, exportar, valorTotal, bajos };
}
