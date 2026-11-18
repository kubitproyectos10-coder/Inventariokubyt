/**
 * MODELO · Insumos y compras de insumos
 */
import { COL, create, newRef, ref, remove, transaction, update } from './repository';
import { costoPromedio } from './costModel';

const n = (v) => Number(v) || 0;

export const INSUMO_VACIO = {
  nombre: '',
  tipo: 'filamento',
  color: '',
  unidad: 'g',
  stock: 0,
  stockMinimo: 0,
  costoUnitario: 0,
  proveedor: '',
  notas: '',
};

const limpiar = (d) => ({
  nombre: d.nombre.trim(),
  tipo: d.tipo,
  color: (d.color || '').trim(),
  unidad: d.unidad,
  stockMinimo: n(d.stockMinimo),
  costoUnitario: n(d.costoUnitario),
  proveedor: (d.proveedor || '').trim(),
  notas: (d.notas || '').trim(),
});

export function validarInsumo(d) {
  if (!d.nombre?.trim()) return 'Escribe el nombre del material.';
  if (n(d.costoUnitario) < 0) return 'El costo no puede ser negativo.';
  return null;
}

/**
 * Crea un insumo. Si trae stock inicial y `comoCompra`, lo registra como compra
 * para que cuente en la inversión.
 */
export async function crearInsumo(d, { comoCompra = true, fecha } = {}) {
  const stockInicial = n(d.stock);
  if (stockInicial > 0 && comoCompra) {
    const r = await create(COL.insumos, { ...limpiar(d), stock: 0 });
    await registrarCompra({
      insumoId: r.id,
      cantidad: stockInicial,
      costoTotal: stockInicial * n(d.costoUnitario),
      proveedor: d.proveedor,
      fecha,
      nota: 'Stock inicial',
    });
    return r;
  }
  return create(COL.insumos, { ...limpiar(d), stock: stockInicial });
}

/** Editar datos del insumo. El stock se corrige aquí solo como ajuste manual. */
export const editarInsumo = (id, d) => update(COL.insumos, id, { ...limpiar(d), stock: n(d.stock) });

export const eliminarInsumo = (id) => remove(COL.insumos, id);

/** Compra: sube el stock y recalcula el costo promedio, en una sola transacción. */
export function registrarCompra({ insumoId, cantidad, costoTotal, proveedor = '', fecha, nota = '' }) {
  return transaction(async (tx) => {
    const insRef = ref(COL.insumos, insumoId);
    const snap = await tx.get(insRef);
    if (!snap.exists()) throw new Error('El material ya no existe.');
    const ins = snap.data();
    const nuevoCosto = costoPromedio(ins.stock, ins.costoUnitario, cantidad, costoTotal);
    tx.update(insRef, { stock: n(ins.stock) + n(cantidad), costoUnitario: nuevoCosto, actualizado: Date.now() });
    tx.set(newRef(COL.compras), {
      insumoId,
      insumoNombre: ins.nombre + (ins.color ? ` · ${ins.color}` : ''),
      unidad: ins.unidad,
      cantidad: n(cantidad),
      costoTotal: n(costoTotal),
      proveedor: (proveedor || '').trim(),
      fecha,
      nota,
      creado: Date.now(),
    });
  });
}

/** Anular compra: devuelve el stock (el costo promedio no se modifica). */
export function anularCompra(compra) {
  return transaction(async (tx) => {
    const insRef = ref(COL.insumos, compra.insumoId);
    const snap = await tx.get(insRef);
    if (snap.exists()) {
      tx.update(insRef, { stock: n(snap.data().stock) - n(compra.cantidad), actualizado: Date.now() });
    }
    tx.delete(ref(COL.compras, compra.id));
  });
}

export function validarCompra(d) {
  if (!d.insumoId) return 'Elige el material.';
  if (n(d.cantidad) <= 0) return 'La cantidad debe ser mayor que cero.';
  if (n(d.costoTotal) < 0) return 'El costo no puede ser negativo.';
  if (!d.fecha) return 'Elige la fecha.';
  return null;
}

export const etiquetaInsumo = (i) => (i ? i.nombre + (i.color ? ` · ${i.color}` : '') : '—');
