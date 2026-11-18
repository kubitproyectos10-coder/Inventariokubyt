/**
 * MODELO · Producción (cada tanda impresa)
 * Suma producto terminado y descuenta insumos según la receta, en una transacción.
 */
import { COL, newRef, ref, transaction } from './repository';
import { consumoTanda, costoManoObra, costoMaterial } from './costModel';
import { etiquetaInsumo } from './insumosModel';
import { fmtQty } from './formatModel';

const n = (v) => Number(v) || 0;

export function validarProduccion(d, producto) {
  if (!producto) return 'Elige el producto.';
  if (n(d.cantidadOk) <= 0 && n(d.cantidadFallida) <= 0) return 'Indica cuántas piezas salieron.';
  if (!d.fecha) return 'Elige la fecha.';
  return null;
}

/** Revisa si alcanza el stock de insumos. Devuelve la lista de faltantes. */
export function faltantes(producto, piezas, insumosById) {
  return consumoTanda(producto, piezas)
    .map((c) => {
      const ins = insumosById[c.insumoId];
      const falta = c.cantidad - n(ins?.stock);
      return falta > 0 ? { nombre: etiquetaInsumo(ins), falta, unidad: ins?.unidad || '' } : null;
    })
    .filter(Boolean);
}

export function registrarProduccion({ producto, cantidadOk, cantidadFallida, fecha, nota }, insumosById, ajustes) {
  const ok = n(cantidadOk);
  const fail = n(cantidadFallida);
  const consumos = consumoTanda(producto, ok + fail);
  const materialTanda = costoMaterial(producto, insumosById) * (ok + fail);

  return transaction(async (tx) => {
    const prodRef = ref(COL.productos, producto.id);
    const insRefs = consumos.map((c) => ref(COL.insumos, c.insumoId));
    const [prodSnap, ...insSnaps] = await Promise.all([tx.get(prodRef), ...insRefs.map((r) => tx.get(r))]);
    if (!prodSnap.exists()) throw new Error('El producto ya no existe.');

    insSnaps.forEach((s, i) => {
      if (!s.exists()) throw new Error('Un material de la receta ya no existe.');
      const disp = n(s.data().stock);
      if (disp < consumos[i].cantidad) {
        const u = s.data().unidad || '';
        throw new Error(`No alcanza ${etiquetaInsumo(s.data())}: hay ${fmtQty(disp, u)} y se necesitan ${fmtQty(consumos[i].cantidad, u)}.`);
      }
    });

    tx.update(prodRef, { stock: n(prodSnap.data().stock) + ok, actualizado: Date.now() });
    insSnaps.forEach((s, i) =>
      tx.update(insRefs[i], { stock: n(s.data().stock) - consumos[i].cantidad, actualizado: Date.now() })
    );
    tx.set(newRef(COL.producciones), {
      productoId: producto.id,
      productoNombre: producto.nombre,
      cantidadOk: ok,
      cantidadFallida: fail,
      fecha,
      nota: (nota || '').trim(),
      consumos,
      costoMaterialTanda: materialTanda,
      costoMaterialUnidad: ok > 0 ? materialTanda / ok : 0,
      costoManoObraUnidad: costoManoObra(producto, ajustes),
      creado: Date.now(),
    });
  });
}

/** Anular una tanda: resta el producto y devuelve los insumos. */
export function anularProduccion(p) {
  return transaction(async (tx) => {
    const prodRef = ref(COL.productos, p.productoId);
    const insRefs = (p.consumos || []).map((c) => ref(COL.insumos, c.insumoId));
    const [prodSnap, ...insSnaps] = await Promise.all([tx.get(prodRef), ...insRefs.map((r) => tx.get(r))]);
    if (prodSnap.exists()) tx.update(prodRef, { stock: n(prodSnap.data().stock) - n(p.cantidadOk) });
    insSnaps.forEach((s, i) => {
      if (s.exists()) tx.update(insRefs[i], { stock: n(s.data().stock) + n(p.consumos[i].cantidad) });
    });
    tx.delete(ref(COL.producciones, p.id));
  });
}
