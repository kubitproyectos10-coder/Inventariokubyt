/** VISTA · Categorías de productos. */
import { COLORES_CATEGORIA } from '../../models';
import { useAutoOpen, useCategoriasController } from '../../controllers';
import { Button, EmptyState, Field, Modal, PageHead, Paginado, RowActions, Toolbar } from '../components';

export default function CategoriasPage({ action, navigate }) {
  const c = useCategoriasController();
  const { form } = c;
  const v = form.values;
  useAutoOpen(action, () => form.openNew(), navigate, 'categorias');
  const color = COLORES_CATEGORIA.find((x) => x.value === v.color) || COLORES_CATEGORIA[0];

  return (
    <div className="page">
      <PageHead eyebrow="Catálogo" title="Categorías" description="Agrupa tus productos: llaveros, soportes, figuras… Sirven para filtrar el catálogo y ver qué tipo de producto vende más.">
        <Button icon="+" onClick={() => form.openNew()}>Nueva categoría</Button>
      </PageHead>

      {c.data.categorias.length > 0 && <Toolbar search={c.search} placeholder="Buscar categoría" />}

      {c.search.result.length ? (
        <Paginado rows={c.search.result} resetKey={c.search.q}>
          {(filas) => (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Categoría</th><th>Descripción</th><th className="num">Productos</th><th /></tr></thead>
              <tbody>
                {filas.map((cat) => {
                  const col = COLORES_CATEGORIA.find((x) => x.value === cat.color) || COLORES_CATEGORIA[0];
                  return (
                    <tr key={cat.id}>
                      <td><span className="line-chip" style={{ background: col.bg, color: col.fg }}>{cat.nombre}</span></td>
                      <td>{cat.descripcion || <span className="muted">—</span>}</td>
                      <td className="num">
                        {cat.productos > 0 ? <button type="button" className="link" onClick={() => navigate('productos')}>{cat.productos}</button> : 0}
                      </td>
                      <td><RowActions onEdit={() => form.openEdit(cat)} onDelete={() => c.eliminar(cat)} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </Paginado>
      ) : (
        <EmptyState
          title={c.data.categorias.length ? 'Sin resultados' : 'Aún no tienes categorías'}
          text={c.data.categorias.length ? 'Prueba con otra búsqueda.' : 'Crea las tuyas (Llaveros, Soportes de celular, Figuras…) o empieza con las básicas que traía la app.'}>
          {!c.data.categorias.length && (
            <>
              <Button icon="+" onClick={() => form.openNew()}>Crear categoría</Button>
              <Button variant="ghost" onClick={c.crearIniciales}>Usar las básicas</Button>
            </>
          )}
        </EmptyState>
      )}

      <Modal open={form.open} onClose={form.close} onSubmit={form.submit} saving={form.saving} error={form.error}
        eyebrow="Categoría" title={form.isEdit ? 'Editar categoría' : 'Nueva categoría'}>
        <Field label="Nombre" id="c-nombre" value={v.nombre} onChange={form.bind('nombre')} placeholder="Soportes de celular" autoFocus className="span-2" />
        <Field label="Descripción" id="c-desc" value={v.descripcion} onChange={form.bind('descripcion')} placeholder="Opcional" className="span-2" />
        <div className="field span-2">
          <label>Color de la etiqueta</label>
          <div className="color-picker">
            {COLORES_CATEGORIA.map((x) => (
              <button key={x.value} type="button" className={v.color === x.value ? 'on' : ''} style={{ background: x.bg, color: x.fg }} onClick={() => form.set('color', x.value)} aria-label={x.label}>
                {x.label}
              </button>
            ))}
          </div>
          <small>Así se verá: <span className="line-chip" style={{ background: color.bg, color: color.fg }}>{v.nombre || 'Categoría'}</span></small>
        </div>
      </Modal>
    </div>
  );
}
