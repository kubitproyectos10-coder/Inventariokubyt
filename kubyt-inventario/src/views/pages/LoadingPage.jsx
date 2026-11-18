/** VISTA · Mientras se verifica la sesión. */
import { KubytMark } from '../components';

export default function LoadingPage() {
  return (
    <div className="center-screen">
      <KubytMark size={56} className="mark--pulse" />
    </div>
  );
}
