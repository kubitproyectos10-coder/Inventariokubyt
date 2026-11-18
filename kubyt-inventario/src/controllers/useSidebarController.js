/** CONTROLADOR · Menú lateral: abierto/cerrado en celular. */
import { useCallback, useEffect, useState } from 'react';

export function useSidebarController(route) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [route]); // al navegar, se cierra en celular
  return { open, toggle: useCallback(() => setOpen((o) => !o), []), close: useCallback(() => setOpen(false), []) };
}
