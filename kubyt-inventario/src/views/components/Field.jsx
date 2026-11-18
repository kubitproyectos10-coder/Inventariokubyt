/**
 * VISTA · Campo de formulario.
 *   <Field label="Nombre" id="nombre" value=… onChange=… />
 *   <Field as="select" options={[{value,label}]} … />
 *   <Field as="textarea" … />
 *   prefix / suffix: texto pegado al campo ("$", "g", "min")
 */
export default function Field({ label, id, hint, action, as = 'input', options, prefix, suffix, className = '', ...props }) {
  let control;
  if (as === 'select') {
    control = (
      <select id={id} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea id={id} rows={2} {...props} />;
  } else {
    control = <input id={id} {...props} />;
  }
  return (
    <div className={`field ${className}`}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className="field-box">
        {prefix && <span className="affix">{prefix}</span>}
        {control}
        {suffix && <span className="affix">{suffix}</span>}
        {action}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}
