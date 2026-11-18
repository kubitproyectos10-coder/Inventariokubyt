/** VISTA · Estructura de la app autenticada: menú lateral + barra superior + página. */
import { findModule } from '../../models';
import { DataProvider, UIProvider, useData, useRouter, useSidebarController } from '../../controllers';
import { Icon, KubytMark, UIHost } from '../components';
import Sidebar from './Sidebar';
import QuickAdd from './QuickAdd';
import { pages } from '../routes';

const today = () => {
  const d = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
};

function Content({ module, action, navigate }) {
  const data = useData();
  if (data.error) {
    return (
      <div className="page">
        <div className="alert alert-error">
          No se pudieron cargar los datos ({data.error.code || data.error.message}). Revisa que las reglas de Firestore estén publicadas.
        </div>
      </div>
    );
  }
  if (data.loading) {
    return <div className="center-screen" style={{ minHeight: '60vh' }}><KubytMark size={48} className="mark--pulse" /></div>;
  }
  const Page = pages[module.id];
  return <Page key={module.id} action={action} navigate={navigate} />;
}

export default function AppShell() {
  const { route, action, navigate } = useRouter();
  const sidebar = useSidebarController(route);
  const module = findModule(route) || findModule('inicio');

  return (
    <UIProvider>
      <DataProvider>
        <div className="shell">
          <Sidebar route={module.id} navigate={navigate} open={sidebar.open} onClose={sidebar.close} />
          <main className="main">
            <header className="topbar">
              <button className="icon-btn menu-btn" onClick={sidebar.toggle} aria-label="Abrir menú">
                <Icon name="menu" />
              </button>
              <span className="crumb">{module.label}</span>
              <span className="date">{today()}</span>
            </header>
            <Content module={module} action={action} navigate={navigate} />
          </main>
          <QuickAdd navigate={navigate} />
        </div>
        <UIHost />
      </DataProvider>
    </UIProvider>
  );
}
