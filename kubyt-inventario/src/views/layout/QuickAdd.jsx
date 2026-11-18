/** VISTA · Botón flotante "+ Registrar" con accesos rápidos. */
import { useState } from 'react';
import { Icon } from '../components';

const acciones = [
  { route: 'ventas', label: 'Venta', icon: 'bag' },
  { route: 'produccion', label: 'Producción', icon: 'printer' },
  { route: 'insumos', label: 'Compra de materia prima', icon: 'cart' },
  { route: 'gastos', label: 'Gasto', icon: 'wallet' },
];

export default function QuickAdd({ navigate }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`quick ${open ? 'open' : ''}`}>
      {open && <div className="quick-scrim" onClick={() => setOpen(false)} />}
      <div className="quick-menu">
        {acciones.map((a) => (
          <button key={a.route} onClick={() => { setOpen(false); navigate(a.route, 'nuevo'); }}>
            <Icon name={a.icon} size={18} /> {a.label}
          </button>
        ))}
      </div>
      <button className="quick-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Icon name="plus" size={20} /> <span>Registrar</span>
      </button>
    </div>
  );
}
