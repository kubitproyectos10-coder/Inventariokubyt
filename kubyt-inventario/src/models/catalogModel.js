/**
 * MODELO · Listas fijas del negocio (edítalas aquí).
 */
export const TIPOS_INSUMO = [
  { value: 'filamento', label: 'Filamento' },
  { value: 'caja', label: 'Caja' },
  { value: 'empaque', label: 'Bolsa / empaque' },
  { value: 'accesorio', label: 'Accesorio (pines, imanes…)' },
  { value: 'otro', label: 'Otro' },
];

export const UNIDADES = [
  { value: 'g', label: 'gramos (g)' },
  { value: 'und', label: 'unidades (und)' },
];

export const LINEAS = [
  { value: 'armable', label: 'Figura armable' },
  { value: 'completa', label: 'Pieza completa' },
  { value: 'clicker', label: 'Clicker' },
  { value: 'llavero', label: 'Llavero' },
  { value: 'otro', label: 'Otro' },
];

export const CANALES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'feria', label: 'Feria / evento' },
  { value: 'tienda', label: 'Tienda' },
  { value: 'otro', label: 'Otro' },
];

export const CATEGORIAS_GASTO = [
  { value: 'maquina', label: 'Máquina (impresora, etc.)' },
  { value: 'herramienta', label: 'Herramientas' },
  { value: 'internet', label: 'Internet' },
  { value: 'software', label: 'Software / licencias' },
  { value: 'luz', label: 'Luz' },
  { value: 'publicidad', label: 'Publicidad' },
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'transporte', label: 'Transporte / envíos' },
  { value: 'otro', label: 'Otro' },
];

export const labelOf = (list, value) => list.find((o) => o.value === value)?.label ?? value ?? '—';
