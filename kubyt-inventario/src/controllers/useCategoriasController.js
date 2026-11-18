/** CONTROLADOR · Categorías de productos */
import { useMemo } from 'react';
import {
  CATEGORIA_VACIA, crearCategoria, crearCategoriasIniciales, editarCategoria, eliminarCategoria,
  productosDeCategoria, validarCategoria,
} from '../models';
import { useData } from './DataController';
import { useFormModal } from './useFormModal';
import { useSearch } from './useSearch';
import { useUI } from './UIController';

export function useCategoriasController() {
  const data = useData();
  const { confirm, toast } = useUI();

  const rows = useMemo(
    () => data.categorias.map((c) => ({ ...c, productos: productosDeCategoria(c.id, data.productos).length })),
    [data.categorias, data.productos]
  );
  const search = useSearch(rows, ['nombre', 'descripcion']);

  const form = useFormModal({
    empty: CATEGORIA_VACIA,
    validate: (v) => validarCategoria(v, data.categorias, form.editingId),
    onCreate: crearCategoria,
    onUpdate: editarCategoria,
    messages: { created: 'Categoría creada', updated: 'Categoría actualizada' },
  });

  const eliminar = async (cat) => {
    const usan = productosDeCategoria(cat.id, data.productos);
    if (usan.length) {
      toast(`No se puede eliminar: la usan ${usan.length} producto(s). Cámbiales la categoría primero.`, 'error');
      return;
    }
    if (await confirm({ title: `¿Eliminar la categoría ${cat.nombre}?` })) {
      await eliminarCategoria(cat.id);
      toast('Categoría eliminada');
    }
  };

  const crearIniciales = async () => {
    await crearCategoriasIniciales();
    toast('Categorías básicas creadas');
  };

  return { data, rows, search, form, eliminar, crearIniciales };
}
