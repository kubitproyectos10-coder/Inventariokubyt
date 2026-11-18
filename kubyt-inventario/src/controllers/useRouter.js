/**
 * CONTROLADOR · Navegación por hash: #/modulo o #/modulo/accion (ej. #/ventas/nuevo)
 * Sin dependencias extra. Si la app crece mucho se puede cambiar por react-router
 * sin tocar las páginas: solo este archivo y views/routes.js.
 */
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_ROUTE } from '../models';

const read = () => {
  const [route, action] = window.location.hash.replace(/^#\/?/, '').split('/');
  return { route: route || DEFAULT_ROUTE, action: action || null };
};

export function useRouter() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const onChange = () => setState(read());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  const navigate = useCallback((id, action) => {
    window.location.hash = action ? `/${id}/${action}` : `/${id}`;
  }, []);
  return { ...state, navigate };
}
