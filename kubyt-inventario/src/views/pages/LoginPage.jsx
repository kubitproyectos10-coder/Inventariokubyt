/** VISTA · Inicio de sesión (solo personas dadas de alta; no hay registro público). */
import { brand } from '../../models';
import { useLoginController } from '../../controllers';
import { Button, Field, Icon, Logo } from '../components';

const features = [
  ['Inventario', 'Materia prima y productos al día'],
  ['Costos', 'Material, mano de obra y administrativos'],
  ['Utilidad', 'Lo que deja cada venta'],
];

export default function LoginPage() {
  const c = useLoginController();
  const isLogin = c.mode === 'login';

  return (
    <div className="login">
      <section className="login-brand">
        <Logo />
        <div className="login-hero">
          <div className="tiles" aria-hidden="true">
            <i /><i /><i /><i className="slot" /><i className="piece" />
          </div>
          <h1>
            Tu taller,
            <br />
            <span className="v">pieza a pieza.</span>
          </h1>
          <p>Inventario, costos y utilidad de {brand.wordmark} en un solo lugar.</p>
        </div>
        <ul className="login-features">
          {features.map(([t, d]) => (
            <li key={t}>
              <b>{t}</b>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={c.submit} noValidate>
          <div className="eyebrow">{isLogin ? 'Acceso administradora' : 'Recuperar acceso'}</div>
          <h2>{isLogin ? 'Inicia sesión' : 'Nueva contraseña'}</h2>
          <p className="muted">
            {isLogin
              ? 'Entra con el correo que registraste en Firebase.'
              : 'Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.'}
          </p>

          <Field
            id="email"
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={c.form.email}
            onChange={c.setField('email')}
            autoFocus
          />

          {isLogin && (
            <Field
              id="password"
              label="Contraseña"
              type={c.showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={c.form.password}
              onChange={c.setField('password')}
              action={
                <button
                  type="button"
                  className="field-action"
                  onClick={c.togglePassword}
                  aria-label={c.showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <Icon name={c.showPassword ? 'eyeOff' : 'eye'} size={18} />
                </button>
              }
            />
          )}

          {c.error && <div className="alert alert-error" role="alert">{c.error}</div>}
          {c.notice && <div className="alert alert-ok">{c.notice}</div>}

          <Button type="submit" variant="dark" loading={c.loading} icon="→" className="btn-block">
            {isLogin ? 'Entrar' : 'Enviar enlace'}
          </Button>

          <button type="button" className="link" onClick={() => c.switchMode(isLogin ? 'reset' : 'login')}>
            {isLogin ? '¿Olvidaste tu contraseña?' : '← Volver a iniciar sesión'}
          </button>

          <div className="secure">
            <Icon name="lock" size={14} /> Acceso privado · solo cuentas autorizadas
          </div>
        </form>
      </section>
    </div>
  );
}
