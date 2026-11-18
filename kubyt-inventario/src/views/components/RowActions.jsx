/** VISTA · Botones de editar / eliminar en una fila. */
import Icon from './Icon';

export default function RowActions({ onEdit, onDelete, deleteLabel = 'Eliminar' }) {
  return (
    <div className="row-actions">
      {onEdit && (
        <button className="icon-btn" onClick={onEdit} aria-label="Editar" title="Editar"><Icon name="edit" size={17} /></button>
      )}
      {onDelete && (
        <button className="icon-btn danger" onClick={onDelete} aria-label={deleteLabel} title={deleteLabel}><Icon name="trash" size={17} /></button>
      )}
    </div>
  );
}
