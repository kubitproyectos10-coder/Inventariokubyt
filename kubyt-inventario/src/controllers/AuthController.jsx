/**
 * CONTROLADOR · Sesión
 * Sabe en qué estado está la persona: cargando, sin sesión, sin acceso o lista.
 * Lo comparte con toda la app mediante un contexto (useAuth).
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile, logout, watchSession } from '../models';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, profile: null, error: null });

  useEffect(
    () =>
      watchSession(async (user) => {
        if (!user) {
          setState({ status: 'signedOut', user: null, profile: null, error: null });
          return;
        }
        try {
          const profile = await getProfile(user.uid);
          setState({ status: profile ? 'ready' : 'noAccess', user, profile, error: null });
        } catch (error) {
          // Suele pasar si las reglas de Firestore aún no están publicadas.
          setState({ status: 'noAccess', user, profile: null, error });
        }
      }),
    []
  );

  const value = useMemo(() => ({ ...state, logout }), [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
