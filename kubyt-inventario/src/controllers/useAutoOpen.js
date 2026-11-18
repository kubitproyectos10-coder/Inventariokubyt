/** CONTROLADOR · Abre un formulario cuando se llega con #/modulo/nuevo (desde "+ Registrar" u otro módulo). */
import { useEffect } from 'react';

export function useAutoOpen(action, open, navigate, route, ready = true, expected = 'nuevo') {
  useEffect(() => {
    if (action === expected && ready) {
      open();
      navigate(route);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, ready]);
}
