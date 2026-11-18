/** VISTA · Logo KUBYT + nombre del producto ("Inventario"). */
import KubytMark from './KubytMark';
import { brand } from '../../models';

export default function Logo({ showProduct = true, size = 30 }) {
  return (
    <div className="brand">
      <KubytMark size={size} />
      <span className="wordmark">{brand.wordmark}</span>
      {showProduct && <span className="brand-product">{brand.product}</span>}
    </div>
  );
}
