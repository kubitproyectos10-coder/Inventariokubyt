/**
 * MODELO · Categorías de productos (llaveros, soportes, figuras…)
 * El producto guarda el id de su categoría en el campo `linea` (nombre histórico).
 */
import { COL, create, remove, save, update } from './repository';
import { LINEAS } from './catalogModel';

/** Colores disponibles para la etiqueta de cada categoría. */
export const COLORES_CATEGORIA = [
  { value: 'violeta', label: 'Violeta', bg: '#efedff', fg: '#5a28c4' },
  { value: 'verde', label: 'Verde', bg: '#EEF8DD', fg: '#3F6B0A' },
  { value: 'naranja', label: 'Naranja', bg: '#f9eeda', fg: '#8a5a12' },
  { value: 'azul', label: 'Azul', bg: '#e3effd', fg: '#1d5aa6' },
  { value: 'rosa', label: 'Rosa', bg: '#fde7f0', fg: '#a3285e' },
  { value: 'gris', label: 'Gris', bg: '#eeeef1', fg: '#4a4a55' },
];

export const CATEGORIA_VACIA = { nombre: '', descripcion: '', color: 'violeta' };

const limpiar = (d) => ({
  nombre: d.nombre.trim(),
  descripcion: (d.descripcion || '').trim(),
  color: d.color || 'violeta',
});

export function validarCategoria(d, categorias = [], id = null) {
  const nombre = d.nombre?.trim();
  if (!nombre) return 'Escribe el nombre de la categoría.';
  const repetida = categorias.some((c) => c.id !== id && c.nombre.trim().toLowerCase() === nombre.toLowerCase());
  if (repetida) return 'Ya existe una categoría con ese nombre.';
  return null;
}

export const crearCategoria = (d) => create(COL.categorias, limpiar(d));
export const editarCategoria = (id, d) => update(COL.categorias, id, limpiar(d));
export const eliminarCategoria = (id) => remove(COL.categorias, id);

/**
 * Crea las categorías que la app traía de fábrica, con el MISMO id que ya usan
 * los productos existentes (así ninguno pierde su categoría).
 */
const COLOR_INICIAL = { armable: 'violeta', completa: 'azul', clicker: 'verde', llavero: 'naranja', otro: 'gris' };
export const crearCategoriasIniciales = () =>
  Promise.all(LINEAS.map((l) => save(COL.categorias, l.value, { nombre: l.label, descripcion: '', color: COLOR_INICIAL[l.value] || 'gris', creado: Date.now() })));

/** Datos para mostrar la categoría de un producto (con respaldo para las categorías antiguas). */
export function infoCategoria(id, categoriasById) {
  const color = (key) => COLORES_CATEGORIA.find((c) => c.value === key) || COLORES_CATEGORIA[5];
  const cat = categoriasById?.[id];
  if (cat) return { nombre: cat.nombre, ...color(cat.color) };
  const antigua = LINEAS.find((l) => l.value === id);
  if (antigua) return { nombre: antigua.label, ...color(COLOR_INICIAL[id]) };
  return { nombre: 'Sin categoría', ...color('gris') };
}

/** ¿Cuántos productos usan esta categoría? */
export const productosDeCategoria = (id, productos) => productos.filter((p) => p.linea === id);
