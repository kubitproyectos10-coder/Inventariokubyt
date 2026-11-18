/** VISTA · Pestañas tipo píldora (como en la web). */
export default function Tabs({ value, onChange, options }) {
  return (
    <div className="tabs" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value} className={`tab ${value === o.value ? 'on' : ''}`} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span className="tab-count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
