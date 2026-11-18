/** VISTA · Muestra los avisos (toasts) y el diálogo de confirmación del UIController. */
import { useUI } from '../../controllers';
import Button from './Button';

export default function UIHost() {
  const { toasts, dialog } = useUI();
  return (
    <>
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
        ))}
      </div>
      {dialog && (
        <div className="modal-scrim" onMouseDown={(e) => e.target === e.currentTarget && dialog.resolve(false)}>
          <div className="modal modal-confirm" role="alertdialog">
            <h2>{dialog.title}</h2>
            {dialog.message && <p className="muted">{dialog.message}</p>}
            <footer className="modal-foot">
              <Button variant="ghost" onClick={() => dialog.resolve(false)}>Cancelar</Button>
              <Button variant={dialog.danger ? 'danger' : 'dark'} onClick={() => dialog.resolve(true)} autoFocus>
                {dialog.confirmLabel}
              </Button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
