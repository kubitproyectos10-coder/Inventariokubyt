/** VISTA · Ícono KUBYT (la pieza violeta es "la pieza que falta"). Igual que en la web. */
export default function KubytMark({ size = 34, className = '' }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
      <rect className="slot" x="21" y="21" width="17" height="17" rx="4.5" />
      <rect className="t" x="2" y="2" width="17" height="17" rx="4.5" />
      <rect className="t" x="21" y="2" width="17" height="17" rx="4.5" />
      <rect className="t" x="2" y="21" width="17" height="17" rx="4.5" />
      <rect className="pd" x="23" y="19" width="17" height="17" rx="4.5" />
      <rect className="p" x="23" y="17" width="17" height="16.5" rx="4.5" />
    </svg>
  );
}
