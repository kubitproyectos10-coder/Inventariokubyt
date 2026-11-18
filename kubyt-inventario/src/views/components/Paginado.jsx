/**
 * VISTA · Paginador para tablas.
 *   <Paginado rows={lista} resetKey={busqueda}>
 *     {(filas) => <table>…{filas.map(…)}…</table>}
 *   </Paginado>
 * resetKey: cuando cambia (ej. el texto buscado o el filtro), vuelve a la página 1.
 */
import { useEffect, useState } from 'react';

const TAMANOS = [10, 25, 50];

/** Números de página a mostrar: 1 … 4 5 6 … 12 */
function paginasVisibles(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, actual - 1, actual, actual + 1].filter((p) => p >= 1 && p <= total));
  const lista = [...set].sort((a, b) => a - b);
  const out = [];
  lista.forEach((p, i) => {
    if (i && p - lista[i - 1] > 1) out.push('…' + p);
    out.push(p);
  });
  return out;
}

export default function Paginado({ rows, resetKey = '', size = 10, children }) {
  const [page, setPage] = useState(1);
  const [porPagina, setPorPagina] = useState(size);

  useEffect(() => setPage(1), [resetKey, porPagina]);

  const total = rows.length;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const actual = Math.min(page, paginas); // si se borran filas, no queda en una página vacía
  const desde = (actual - 1) * porPagina;
  const filas = rows.slice(desde, desde + porPagina);

  return (
    <>
      {children(filas)}
      <nav className="pager" aria-label="Paginación">
        <span className="pager-info">
          Mostrando <b>{total ? desde + 1 : 0}–{desde + filas.length}</b> de <b>{total}</b>
        </span>
        <label className="pager-size">
          Ver
          <select value={porPagina} onChange={(e) => setPorPagina(Number(e.target.value))}>
            {TAMANOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          por página
        </label>
        <div className="pager-pages">
          <button type="button" onClick={() => setPage(actual - 1)} disabled={actual <= 1} aria-label="Página anterior">‹</button>
          {paginasVisibles(actual, paginas).map((p) =>
            typeof p === 'string'
              ? <span key={p} className="pager-gap">…</span>
              : <button type="button" key={p} className={p === actual ? 'on' : ''} onClick={() => setPage(p)} aria-current={p === actual ? 'page' : undefined}>{p}</button>
          )}
          <button type="button" onClick={() => setPage(actual + 1)} disabled={actual >= paginas} aria-label="Página siguiente">›</button>
        </div>
      </nav>
    </>
  );
}
