/**
 * VISTA · Mapa de rutas → páginas.
 * Para un módulo nuevo: crea su página, regístrala aquí y agrégalo en models/navigationModel.js.
 */
import HomePage from './pages/HomePage';
import InsumosPage from './pages/InsumosPage';
import ProductosPage from './pages/ProductosPage';
import CategoriasPage from './pages/CategoriasPage';
import ProduccionPage from './pages/ProduccionPage';
import VentasPage from './pages/VentasPage';
import GastosPage from './pages/GastosPage';
import InformesPage from './pages/InformesPage';
import AjustesPage from './pages/AjustesPage';

export const pages = {
  inicio: HomePage,
  insumos: InsumosPage,
  productos: ProductosPage,
  categorias: CategoriasPage,
  produccion: ProduccionPage,
  ventas: VentasPage,
  gastos: GastosPage,
  informes: InformesPage,
  ajustes: AjustesPage,
};
