/** VISTA · La persona inició sesión pero no está dada de alta en `usuarios`. */
import { useAuth } from '../../controllers';
import { Button, Logo } from '../components';

export default function NoAccessPage() {
  const { user, error, logout } = useAuth();
  return (
    <div className="center-screen">
      <div className="card narrow">
        <Logo />
        <h2 style={{ margin: '28px 0 10px' }}>Tu cuenta aún no tiene acceso</h2>
        <p className="muted">
          Iniciaste sesión como <b>{user?.email}</b>, pero no hay un perfil con rol para esta cuenta.
        </p>
        <div className="steps-box">
          <b>Para activarla (solo la primera vez):</b>
          <ol>
            <li>En la consola de Firebase, abre Firestore Database.</li>
            <li>
              Crea la colección <code>usuarios</code> y un documento cuyo ID sea:
              <code className="uid">{user?.uid}</code>
            </li>
            <li>
              Agrega los campos <code>rol</code> = <code>admin</code> y <code>nombre</code> = tu nombre.
            </li>
            <li>Vuelve aquí y recarga la página.</li>
          </ol>
        </div>
        {error && <p className="muted small">Detalle técnico: {error.code || error.message}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
          <Button variant="ghost" onClick={logout}>Cerrar sesión</Button>
        </div>
      </div>
    </div>
  );
}
