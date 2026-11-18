/**
 * MODELO · Ventas
 * Guarda el costo con el que se vendió (material, impresión, mano de obra y administrativo estimado),
 * para que si mañana sube un insumo, la utilidad de ventas pasadas no cambie.
 */
import { COL, newRef, ref, transaction } from './repository';
import { costoProducto } from './costModel';
import { etiquetaInsumo } from './insumosModel';

const n = (v) => Number(v) || 0;

export function validarVenta(d, producto) {
  if (!producto) return 'Elige el producto.';
  if (n(d.cantidad) <= 0) return 'La cantidad debe ser mayor que cero.';
  if (n(d.precioUnitario) < 0) return 'El precio no puede ser negativo.';
  if (!d.fecha) return 'Elige la fecha.';
  return null;
}

/** El costo de la venta usa el empaque elegido en ESTA venta, no el habitual del producto. */
const costoVenta = (d, producto, insumosById, ajustes) =>
  costoProducto({ ...producto, empaqueId: d.empaqueId || '' }, insumosById, ajustes);

/** Vista previa de la utilidad mientras se llena el formulario. */
export function calcularVenta(d, producto, insumosById, ajustes) {
  const c = costoVenta(d, producto, insumosById, ajustes);
  const cant = n(d.cantidad);
  const ingreso = cant * n(d.precioUnitario);
  const costo = cant * c.total + n(d.costoEnvio);
  return { ingreso, costo, utilidad: ingreso - costo, unit: c };
}

export function registrarVenta(d, producto, insumosById, ajustes) {
  const c = costoVenta(d, producto, insumosById, ajustes);
  const cant = n(d.cantidad);
  return transaction(async (tx) => {
    const prodRef = ref(COL.productos, producto.id);
    const empRef = d.empaqueId ? ref(COL.insumos, d.empaqueId) : null;
    const snap = await tx.get(prodRef);
    const empSnap = empRef ? await tx.get(empRef) : null;
    if (!snap.exists()) throw new Error('El producto ya no existe.');
    const stock = n(snap.data().stock);
    if (stock < cant) throw new Error(`Solo hay ${stock} en stock de ${producto.nombre}. Registra primero la producción.`);
    if (empRef) {
      if (!empSnap.exists()) throw new Error('El empaque elegido ya no existe.');
      const disp = n(empSnap.data().stock);
      if (disp < cant) throw new Error(`No alcanza ${etiquetaInsumo(empSnap.data())}: hay ${disp} y se necesitan ${cant}.`);
      tx.update(empRef, { stock: disp - cant, actualizado: Date.now() });
    }
    tx.update(prodRef, { stock: stock - cant, actualizado: Date.now() });
    tx.set(newRef(COL.ventas), {
      productoId: producto.id,
      productoNombre: producto.nombre,
      linea: producto.linea,
      cantidad: n(d.cantidad),
      precioUnitario: n(d.precioUnitario),
      canal: d.canal,
      cliente: (d.cliente || '').trim(),
      costoEnvio: n(d.costoEnvio), // envío o comisión que asume KUBYT
      fecha: d.fecha,
      nota: (d.nota || '').trim(),
      costoMaterial: c.material,
      costoImpresion: c.impresion + c.fallos, // luz + desgaste + fallos (estimado)
      empaqueId: d.empaqueId || '',
      empaqueNombre: d.empaqueId ? etiquetaInsumo(insumosById[d.empaqueId]) : '',
      costoEmpaque: c.empaque, // por unidad
      costoManoObra: c.manoObra,
      costoAdminEstimado: c.admin,
      creado: Date.now(),
    });
  });
}

/** Anular venta: devuelve las unidades al stock (y los empaques, si se usaron). */
export function anularVenta(v) {
  return transaction(async (tx) => {
    const prodRef = ref(COL.productos, v.productoId);
    const empRef = v.empaqueId ? ref(COL.insumos, v.empaqueId) : null;
    const snap = await tx.get(prodRef);
    const empSnap = empRef ? await tx.get(empRef) : null;
    if (snap.exists()) tx.update(prodRef, { stock: n(snap.data().stock) + n(v.cantidad) });
    if (empSnap?.exists()) tx.update(empRef, { stock: n(empSnap.data().stock) + n(v.cantidad) });
    tx.delete(ref(COL.ventas, v.id));
  });
}
