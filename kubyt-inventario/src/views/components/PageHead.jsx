/** VISTA · Encabezado de página: etiqueta, título, descripción y acciones. */
export default function PageHead({ eyebrow, title, description, children }) {
  return (
    <header className="page-head">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}
