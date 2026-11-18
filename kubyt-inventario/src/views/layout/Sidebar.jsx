/** VISTA · Menú lateral con los módulos y la cuenta. */
import { modules, roleLabel } from '../../models';
import { useAuth } from '../../controllers';
import { Icon, Logo } from '../components';

export default function Sidebar({ route, navigate, open, onClose }) {
  const { profile, user, logout } = useAuth();
  const name = profile?.nombre || user?.email;

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo size={28} />
        </div>
        <nav className="nav">
          {modules.map((m) => (
            <a
              key={m.id}
              href={`#/${m.id}`}
              className={`nav-item ${route === m.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(m.id);
              }}
            >
              <Icon name={m.icon} />
              <span>{m.label}</span>
              
            </a>
          ))}
        </nav>
        <div className="account">
          <div className="avatar">{(name || '?').charAt(0).toUpperCase()}</div>
          <div className="account-info">
            <b title={name}>{name}</b>
            <span>{roleLabel(profile)}</span>
          </div>
          <button className="icon-btn" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
