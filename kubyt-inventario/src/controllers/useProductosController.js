/** CONTROLADOR · Productos con receta y costos */
import { useMemo } from 'react';
import {
  PRODUCTO_VACIO, infoCategoria, costoProducto, esEmpaque, margenDe, redondearPrecio, crearProducto, descargarCSV, editarProducto, eliminarProducto,
  validarProducto,
} from '../models';
import { useData } from './DataController';
import { useFormModal } from './useFormModal';
import { useSearch } from './useSearch';
import { useUI } from './UIController';

const FIELDS = ['nombre', 'sku'];

export function useProductosController() {
  const data = useData();
  const { confirm, toast } = useUI();

  const rows = useMemo(
    () => data.productos.map((p) => ({ ...p, costo: costoProducto(p, data.insumosById, data.ajustes) })),
    [data.productos, data.insumosById, data.ajustes]
  );
  const search = useSearch(rows, FIELDS, { filterField: 'linea' });

  /** Si el precio es automático, se guarda el precio calculado en ese momento. */
  const conPrecio = (v) =>
    v.precioAuto ? { ...v, precioVenta: redondearPrecio(costoProducto(v, data.insumosById, data.ajustes).sugerido) } : v;

  const form = useFormModal({
    empty: PRODUCTO_VACIO,
    validate: validarProducto,
    onCreate: (v) => crearProducto(conPrecio(v)),
    onUpdate: (id, v) => editarProducto(id, conPrecio(v)),
    messages: { created: 'Producto creado', updated: 'Producto actualizado' },
  });

  const empaques = data.insumos.filter(esEmpaque);
  /** Opciones de categoría para el formulario y el filtro. */
  const categorias = data.categorias.map((cat) => ({ value: cat.id, label: cat.nombre }));

  // Edición de la receta
  const receta = form.values.receta || [];
  const addLine = () => form.set('receta', [...receta, { insumoId: '', cantidad: '' }]);
  const setLine = (i, field, value) => form.set('receta', receta.map((r, k) => (k === i ? { ...r, [field]: value } : r)));
  const removeLine = (i) => form.set('receta', receta.filter((_, k) => k !== i));

  /** Abrir: productos nuevos calculan el precio solos; los que ya existían conservan su precio manual. */
  const nuevo = () => form.openNew({ precioAuto: true, margen: data.ajustes.margenObjetivo });
  const editar = (p) => form.openEdit({ ...p, precioAuto: !!p.precioAuto, margen: margenDe(p, data.ajustes) });

  /** Costos en vivo mientras se edita (con el precio automático ya aplicado). */
  const preview = costoProducto(conPrecio(form.values), data.insumosById, data.ajustes);
  const sugerido = redondearPrecio(preview.sugerido);
  const usarSugerido = () => form.set('precioVenta', sugerido);

  const eliminar = async (p) => {
    if (await confirm({ title: `¿Eliminar ${p.nombre}?`, message: 'Las ventas y producciones registradas se conservan en el historial.' })) {
      await eliminarProducto(p.id);
      toast('Producto eliminado');
    }
  };

  const exportar = () =>
    descargarCSV('kubyt-productos', [
      { label: 'Producto', value: (p) => p.nombre },
      { label: 'Categoría', value: (p) => infoCategoria(p.linea, data.categoriasById).nombre },
      { label: 'SKU', value: (p) => p.sku },
      { label: 'Stock', value: (p) => p.stock },
      { label: 'Precio', value: (p) => p.precioVenta },
      { label: 'Material', value: (p) => Math.round(p.costo.material) },
      { label: 'Impresión (luz + desgaste)', value: (p) => Math.round(p.costo.impresion) },
      { label: 'Fallos', value: (p) => Math.round(p.costo.fallos) },
      { label: 'Empaque', value: (p) => Math.round(p.costo.empaque) },
      { label: 'Mano de obra', value: (p) => Math.round(p.costo.manoObra) },
      { label: 'Administrativo', value: (p) => Math.round(p.costo.admin) },
      { label: 'Costo unitario', value: (p) => Math.round(p.costo.total) },
      { label: 'Utilidad', value: (p) => Math.round(p.costo.utilidad) },
      { label: 'Margen %', value: (p) => Math.round(p.costo.margen * 100) },
    ], rows);

  return { data, rows, search, form, empaques, categorias, nuevo, editar, receta, addLine, setLine, removeLine, preview, sugerido, usarSugerido, eliminar, exportar };
}
