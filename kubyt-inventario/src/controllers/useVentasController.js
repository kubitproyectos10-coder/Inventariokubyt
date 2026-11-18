/** CONTROLADOR · Ventas */
import {
  CANALES, anularVenta, esEmpaque, totalesVentas, utilidadDeVenta, calcularVenta, descargarCSV, labelOf, registrarVenta, today, validarVenta,
} from '../models';
import { useData } from './DataController';
import { useFormModal } from './useFormModal';
import { useSearch } from './useSearch';
import { useUI } from './UIController';

const n = (v) => Number(v) || 0;

export function useVentasController() {
  const data = useData();
  const { confirm, toast } = useUI();
  const search = useSearch(data.ventas, ['productoNombre', 'cliente', 'nota'], { filterField: 'canal' });

  const form = useFormModal({
    empty: { productoId: '', empaqueId: '', cantidad: 1, precioUnitario: '', canal: 'instagram', cliente: '', costoEnvio: '', fecha: today(), nota: '' },
    validate: (v) => validarVenta(v, data.productosById[v.productoId]),
    onCreate: (v) => registrarVenta(v, data.productosById[v.productoId], data.insumosById, data.ajustes),
    messages: { created: 'Venta registrada' },
  });

  /** Abre el formulario, o explica qué falta antes y lleva al módulo correcto. */
  const abrir = async (navigate) => {
    if (!data.productos.length) {
      if (await confirm({ title: 'Primero crea un producto', message: 'Para registrar una venta necesitas al menos un producto en tu catálogo.', confirmLabel: 'Crear producto', danger: false })) navigate('productos', 'nuevo');
      return;
    }
    if (!data.productos.some((p) => n(p.stock) > 0)) {
      if (await confirm({ title: 'No tienes productos en stock', message: 'Cada venta descuenta del stock. Registra primero la producción de lo que vas a vender.', confirmLabel: 'Registrar producción', danger: false })) navigate('produccion', 'nuevo');
      return;
    }
    form.openNew();
  };

  const elegirProducto = (id) => {
    form.set('productoId', id);
    const p = data.productosById[id];
    if (p) {
      form.set('precioUnitario', p.precioVenta);
      form.set('empaqueId', p.empaqueId || '');
    }
  };

  /** Cajas y bolsas disponibles para elegir al vender. */
  const empaques = data.insumos.filter(esEmpaque);
  const empaque = data.insumosById[form.values.empaqueId];
  const faltaEmpaque = !!empaque && n(empaque.stock) < n(form.values.cantidad);

  const producto = data.productosById[form.values.productoId];
  const preview = producto ? calcularVenta(form.values, producto, data.insumosById, data.ajustes) : null;

  const t = totalesVentas(search.result);
  const totales = { unidades: t.unidades, ingresos: t.ingresos, utilidad: t.ganancia };
  const utilidadVenta = utilidadDeVenta;

  const anular = async (v) => {
    if (await confirm({ title: '¿Anular esta venta?', message: `${v.cantidad} × ${v.productoNombre} volverán al stock${v.empaqueNombre ? `, junto con ${v.cantidad} × ${v.empaqueNombre}` : ''}.`, confirmLabel: 'Anular venta' })) {
      try {
        await anularVenta(v);
        toast('Venta anulada');
      } catch (e) {
        toast(e.message, 'error');
      }
    }
  };

  const exportar = () =>
    descargarCSV('kubyt-ventas', [
      { label: 'Fecha', value: (v) => v.fecha },
      { label: 'Producto', value: (v) => v.productoNombre },
      { label: 'Cantidad', value: (v) => v.cantidad },
      { label: 'Precio unitario', value: (v) => v.precioUnitario },
      { label: 'Total', value: (v) => n(v.cantidad) * n(v.precioUnitario) },
      { label: 'Canal', value: (v) => labelOf(CANALES, v.canal) },
      { label: 'Cliente', value: (v) => v.cliente },
      { label: 'Envío/comisión', value: (v) => v.costoEnvio },
      { label: 'Utilidad', value: (v) => Math.round(utilidadVenta(v)) },
    ], search.result);

  return { data, search, form, abrir, empaques, faltaEmpaque, elegirProducto, producto, preview, totales, utilidadVenta, anular, exportar };
}
