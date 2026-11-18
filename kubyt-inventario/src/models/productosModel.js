/**
 * MODELO · Productos (catálogo + receta)
 * receta: [{ insumoId, cantidad }] = lo que consume UNA unidad.
 */
import { COL, create, remove, update } from './repository';

const n = (v) => Number(v) || 0;

export const PRODUCTO_VACIO = {
  nombre: '',
  linea: '', // id de la categoría (módulo Categorías)
  sku: '',
  precioVenta: 0,
  precioAuto: true, // el precio se calcula: costo + ganancia deseada
  margen: '', // % de ganancia sobre el precio ('' = usar el de Ajustes)
  minutosManoObra: 0,
  impresionHoras: 0,
  impresionMinutos: 0,
  unidadesPorImpresion: 1,
  stock: 0,
  receta: [],
  empaqueId: '', // empaque habitual: se preselecciona al vender (se puede cambiar)
  notas: '',
  activo: true,
};

const limpiar = (d) => ({
  nombre: d.nombre.trim(),
  linea: d.linea,
  sku: (d.sku || '').trim(),
  precioVenta: n(d.precioVenta),
  precioAuto: !!d.precioAuto,
  margen: d.margen === '' || d.margen === undefined ? '' : n(d.margen),
  minutosManoObra: n(d.minutosManoObra),
  impresionHoras: n(d.impresionHoras),
  impresionMinutos: n(d.impresionMinutos),
  unidadesPorImpresion: Math.max(n(d.unidadesPorImpresion) || 1, 1),
  stock: n(d.stock),
  receta: (d.receta || [])
    .filter((r) => r.insumoId && n(r.cantidad) > 0)
    .map((r) => ({ insumoId: r.insumoId, cantidad: n(r.cantidad) })),
  empaqueId: d.empaqueId || '',
  notas: (d.notas || '').trim(),
  activo: d.activo !== false,
});

export function validarProducto(d) {
  if (!d.nombre?.trim()) return 'Escribe el nombre del producto.';
  if (n(d.precioVenta) < 0) return 'El precio no puede ser negativo.';
  if (d.precioAuto && (n(d.margen) < 0 || n(d.margen) >= 95)) return 'La ganancia debe estar entre 0 % y 94 %.';
  const ids = (d.receta || []).filter((r) => r.insumoId).map((r) => r.insumoId);
  if (new Set(ids).size !== ids.length) return 'Hay un material repetido en la receta.';
  return null;
}

export const crearProducto = (d) => create(COL.productos, limpiar(d));
export const editarProducto = (id, d) => update(COL.productos, id, limpiar(d));
export const eliminarProducto = (id) => remove(COL.productos, id);

/** ¿Algún producto usa este insumo en su receta? */
export const productosQueUsan = (insumoId, productos) =>
  productos.filter((p) => (p.receta || []).some((r) => r.insumoId === insumoId));
