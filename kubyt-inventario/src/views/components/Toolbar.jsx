/** VISTA · Barra de búsqueda + filtro. */
import Icon from './Icon';

export default function Toolbar({ search, placeholder = 'Buscar…', filterOptions, filterLabel = 'Todos', children }) {
  return (
    <div className="toolbar">
      <label className="search">
        <Icon name="search" size={18} />
        <input value={search.q} onChange={(e) => search.setQ(e.target.value)} placeholder={placeholder} />
      </label>
      {filterOptions && (
        <select className="filter" value={search.filter} onChange={(e) => search.setFilter(e.target.value)}>
          <option value="">{filterLabel}</option>
          {filterOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
      <div className="toolbar-end">{children}</div>
    </div>
  );
}
