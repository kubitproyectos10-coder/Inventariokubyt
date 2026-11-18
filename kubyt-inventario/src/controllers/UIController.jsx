/**
 * CONTROLADOR · Avisos (toasts) y confirmaciones
 *   const { toast, confirm } = useUI();
 *   toast('Guardado');  ·  if (await confirm({ title: '¿Eliminar?' })) …
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const seq = useRef(0);

  const toast = useCallback((message, type = 'ok') => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const confirm = useCallback(
    (opts) =>
      new Promise((resolve) => {
        setDialog({
          title: '¿Seguro?',
          confirmLabel: 'Eliminar',
          danger: true,
          ...opts,
          resolve: (v) => {
            setDialog(null);
            resolve(v);
          },
        });
      }),
    []
  );

  const value = useMemo(() => ({ toast, confirm, toasts, dialog }), [toast, confirm, toasts, dialog]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>');
  return ctx;
}
