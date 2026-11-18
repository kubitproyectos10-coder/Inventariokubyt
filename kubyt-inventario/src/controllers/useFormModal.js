/**
 * CONTROLADOR · Formulario en ventana (crear / editar) reutilizable.
 * Maneja valores, errores y el estado "guardando".
 */
import { useCallback, useState } from 'react';
import { useUI } from './UIController';

export function useFormModal({ empty, validate, onCreate, onUpdate, messages = {} }) {
  const { toast } = useUI();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = useCallback((field, value) => {
    setValues((v) => ({ ...v, [field]: value }));
    setError('');
  }, []);
  /** Para inputs: onChange={bind('nombre')} */
  const bind = (field) => (e) =>
    set(field, e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  const openNew = (preset = {}) => {
    setValues({ ...empty, ...preset });
    setEditingId(null);
    setError('');
    setOpen(true);
  };
  const openEdit = (row) => {
    setValues({ ...empty, ...row });
    setEditingId(row.id);
    setError('');
    setOpen(true);
  };
  const close = () => !saving && setOpen(false);

  const submit = async (e) => {
    e?.preventDefault();
    const msg = validate?.(values);
    if (msg) return setError(msg);
    setSaving(true);
    try {
      if (editingId) await onUpdate(editingId, values);
      else await onCreate(values);
      toast(editingId ? messages.updated || 'Cambios guardados' : messages.created || 'Guardado');
      setOpen(false);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar. Revisa tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  return { open, values, set, bind, setValues, editingId, isEdit: !!editingId, error, setError, saving, openNew, openEdit, close, submit };
}
