/** VISTA · Ventana modal con formulario. Se cierra con Esc o tocando fuera. */
import { useEffect } from 'react';
import Button from './Button';

export default function Modal({ open, title, eyebrow, onClose, onSubmit, submitLabel = 'Guardar', saving, error, wide, children, aside }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className={`modal ${wide ? 'modal-wide' : ''}`} onSubmit={onSubmit} noValidate>
        <header className="modal-head">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h2>{title}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>
        <div className={`modal-body ${aside ? 'with-aside' : ''}`}>
          <div className="form-grid">{children}</div>
          {aside && <aside className="modal-aside">{aside}</aside>}
        </div>
        {error && <div className="alert alert-error modal-error" role="alert">{error}</div>}
        <footer className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={saving}>{submitLabel}</Button>
        </footer>
      </form>
    </div>
  );
}
