/** CONTROLADOR · Búsqueda y filtro simples para listas. */
import { useMemo, useState } from 'react';

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function useSearch(rows, fields, { filterField } = {}) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const result = useMemo(() => {
    const term = norm(q);
    return rows.filter(
      (r) =>
        (!filter || r[filterField] === filter) &&
        (!term || fields.some((f) => norm(typeof f === 'function' ? f(r) : r[f]).includes(term)))
    );
  }, [rows, q, filter, fields, filterField]);
  return { q, setQ, filter, setFilter, result };
}
