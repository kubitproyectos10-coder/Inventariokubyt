/**
 * MODELO · Módulos de la app
 * Para agregar un módulo: añádelo aquí y registra su página en views/routes.js.
 * status: 'ready' (disponible) | 'soon' (planeado, muestra "Próximamente")
 */
export const modules = [
  { id: 'inicio', label: 'Inicio', icon: 'home', status: 'ready', description: 'Resumen del negocio' },
  { id: 'insumos', label: 'Materia prima', icon: 'spool', status: 'ready', description: 'Filamentos, cajas, empaques y accesorios' },
  { id: 'productos', label: 'Productos', icon: 'tag', status: 'ready', description: 'Catálogo, recetas y costos' },
  { id: 'categorias', label: 'Categorías', icon: 'folder', status: 'ready', description: 'Llaveros, soportes, figuras…' },
  { id: 'produccion', label: 'Producción', icon: 'printer', status: 'ready', description: 'Cada tanda que imprimes' },
  { id: 'ventas', label: 'Ventas', icon: 'bag', status: 'ready', description: 'Ventas y utilidad' },
  { id: 'gastos', label: 'Gastos e inversión', icon: 'wallet', status: 'ready', description: 'Administrativos, máquinas e inversión' },
  { id: 'informes', label: 'Informes', icon: 'chart', status: 'ready', description: 'Utilidad, stock e inversión' },
  { id: 'ajustes', label: 'Ajustes', icon: 'gear', status: 'ready', description: 'Mano de obra y parámetros' },
];

export const DEFAULT_ROUTE = 'inicio';

export const findModule = (id) => modules.find((m) => m.id === id);
