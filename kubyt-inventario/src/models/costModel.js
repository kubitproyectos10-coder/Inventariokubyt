/**
 * MODELO · Fórmulas de costo y utilidad (funciones puras, sin Firebase)
 *
 *   Costo unitario = Material + Impresión (luz + desgaste) + Fallos + Empaque
 *                  + Mano de obra + Gastos administrativos por unidad
 *   El empaque (caja o bolsa) NO va en la receta: se elige y se descuenta al vender.
 *   Utilidad       = Precio de venta − Costo unitario
 */
const n = (v) => Number(v) || 0;

/** Costo por gramo/unidad a partir de un paquete (ej. rollo de 1000 g a 80.000). */
export const costoPorUnidad = (precioPaquete, cantidadPaquete) =>
  n(cantidadPaquete) > 0 ? n(precioPaquete) / n(cantidadPaquete) : 0;

export const costoMaterial = (producto, insumosById) =>
  (producto?.receta || []).reduce(
    (s, r) => s + n(r.cantidad) * n(insumosById[r.insumoId]?.costoUnitario),
    0
  );

/** Horas de impresora que ocupa UNA unidad (si imprimes varias por placa, se reparte). */
export const horasImpresionUnidad = (producto) =>
  (n(producto?.impresionHoras) + n(producto?.impresionMinutos) / 60) / Math.max(n(producto?.unidadesPorImpresion) || 1, 1);

/** Lo que cuesta tener la impresora encendida una hora: luz + desgaste/repuestos. */
export const costoHoraImpresora = (ajustes) =>
  (n(ajustes?.potenciaImpresoraW) / 1000) * n(ajustes?.precioKwh) + n(ajustes?.desgasteHora);

export const costoImpresion = (producto, ajustes) => horasImpresionUnidad(producto) * costoHoraImpresora(ajustes);

/** Costo de UN empaque (caja/bolsa). Sin empaque = 0. */
export const costoEmpaque = (empaqueId, insumosById) => (empaqueId ? n(insumosById[empaqueId]?.costoUnitario) : 0);

/** Materia prima que sirve como empaque al vender. */
export const esEmpaque = (insumo) => insumo?.tipo === 'caja' || insumo?.tipo === 'empaque';

export const costoManoObra = (producto, ajustes) =>
  (n(producto?.minutosManoObra) * n(ajustes?.valorHoraManoObra)) / 60;

/** Estimado mientras el mes está abierto; el informe mensual usa el real. */
export const costoAdminUnidad = (ajustes) =>
  n(ajustes?.unidadesEstimadasMes) > 0 ? n(ajustes.gastosAdminEstimadosMes) / n(ajustes.unidadesEstimadasMes) : 0;

/** Ganancia deseada (% del precio): la del producto o, si no tiene, la general de Ajustes. */
export const margenDe = (producto, ajustes) =>
  producto?.margen !== undefined && producto?.margen !== '' ? n(producto.margen) : n(ajustes?.margenObjetivo);

/** Redondea el precio hacia arriba a los $100 (ej. 12.430 → 12.500). */
export const redondearPrecio = (v) => Math.ceil(n(v) / 100) * 100;

export function costoProducto(producto, insumosById, ajustes) {
  const material = costoMaterial(producto, insumosById);
  const impresion = costoImpresion(producto, ajustes);
  // Piezas que salen mal: se pierde material y tiempo de máquina.
  const fallos = ((material + impresion) * n(ajustes?.porcentajeFallos)) / 100;
  const empaque = costoEmpaque(producto?.empaqueId, insumosById);
  const manoObra = costoManoObra(producto, ajustes);
  const admin = costoAdminUnidad(ajustes);
  const total = material + impresion + fallos + empaque + manoObra + admin;
  const precio = n(producto?.precioVenta);
  const utilidad = precio - total;
  const margen = precio > 0 ? utilidad / precio : 0;
  const objetivo = margenDe(producto, ajustes) / 100;
  const sugerido = objetivo < 1 ? total / (1 - objetivo) : 0;
  return { material, impresion, fallos, empaque, manoObra, admin, total, precio, utilidad, margen, sugerido };
}

/** Insumos que consume una tanda (incluye las piezas fallidas). */
export const consumoTanda = (producto, piezas) =>
  (producto?.receta || [])
    .filter((r) => r.insumoId && n(r.cantidad) > 0)
    .map((r) => ({ insumoId: r.insumoId, cantidad: n(r.cantidad) * n(piezas) }));

/** Nuevo costo promedio ponderado al comprar más de un insumo. */
export function costoPromedio(stockActual, costoActual, cantidadCompra, costoTotalCompra) {
  const s = Math.max(n(stockActual), 0);
  const total = s + n(cantidadCompra);
  if (total <= 0) return n(costoActual);
  return (s * n(costoActual) + n(costoTotalCompra)) / total;
}
