/** Decide qué pantalla mostrar según el estado de la sesión. */
import { AuthProvider, useAuth } from './controllers';
import LoginPage from './views/pages/LoginPage';
import LoadingPage from './views/pages/LoadingPage';
import NoAccessPage from './views/pages/NoAccessPage';
import AppShell from './views/layout/AppShell';

function Gate() {
  const { status } = useAuth();
  if (status === 'loading') return <LoadingPage />;
  if (status === 'signedOut') return <LoginPage />;
  if (status === 'noAccess') return <NoAccessPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
