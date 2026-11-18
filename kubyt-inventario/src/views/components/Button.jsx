/** VISTA · Botón. variant: 'dark' | 'violet' | 'ghost' | 'link' */
export default function Button({ variant = 'dark', loading = false, icon, children, className = '', ...rest }) {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
      {icon && !loading ? <span className="arr">{icon}</span> : null}
    </button>
  );
}
