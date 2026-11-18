/**
 * CONTROLADOR · Datos del negocio en tiempo real
 * Escucha todas las colecciones una vez y las comparte con la app (useData).
 * Para el volumen de un emprendimiento es lo más simple y rápido; si algún día
 * hay miles de registros, aquí se agregan filtros por fecha.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AJUSTES_DEFAULT, AJUSTES_ID, COL, adminMensualEstimado, subscribe, subscribeDoc } from '../models';

const DataContext = createContext(null);
const LISTAS = ['insumos', 'productos', 'categorias', 'producciones', 'ventas', 'compras', 'gastos', 'aportes'];
const byFechaDesc = (a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.creado || 0) - (a.creado || 0);
const byNombre = (a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es');

export function DataProvider({ children }) {
  const [raw, setRaw] = useState({});
  const [ajustes, setAjustes] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubs = LISTAS.map((k) =>
      subscribe(COL[k], (rows) => setRaw((r) => ({ ...r, [k]: rows })), setError)
    );
    unsubs.push(subscribeDoc(COL.ajustes, AJUSTES_ID, (d) => setAjustes(d || {}), setError));
    return () => unsubs.forEach((u) => u());
  }, []);

  const value = useMemo(() => {
    const sortName = (l) => [...(l || [])].sort(byNombre);
    const sortDate = (l) => [...(l || [])].sort(byFechaDesc);
    const data = {
      insumos: sortName(raw.insumos),
      productos: sortName(raw.productos),
      categorias: sortName(raw.categorias),
      producciones: sortDate(raw.producciones),
      ventas: sortDate(raw.ventas),
      compras: sortDate(raw.compras),
      gastos: sortDate(raw.gastos),
      aportes: sortDate(raw.aportes),
      ajustes: { ...AJUSTES_DEFAULT, ...(ajustes || {}) },
    };
    // Los gastos administrativos salen del módulo Gastos, no se escriben a mano.
    data.adminMensual = adminMensualEstimado(data.gastos);
    data.ajustes.gastosAdminEstimadosMes = data.adminMensual.promedio;
    data.insumosById = Object.fromEntries(data.insumos.map((i) => [i.id, i]));
    data.productosById = Object.fromEntries(data.productos.map((p) => [p.id, p]));
    data.categoriasById = Object.fromEntries(data.categorias.map((c) => [c.id, c]));
    data.loading = LISTAS.some((k) => !raw[k]) || ajustes === null;
    data.error = error;
    return data;
  }, [raw, ajustes, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData debe usarse dentro de <DataProvider>');
  return ctx;
}
