/** VISTA · Estado vacío con las piezas de la marca. */
export default function EmptyState({ title, text, children }) {
  return (
    <div className="empty">
      <div className="empty-tiles" aria-hidden="true"><i /><i /><i /><i className="piece" /></div>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}
