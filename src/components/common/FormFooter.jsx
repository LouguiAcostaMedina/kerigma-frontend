import React from 'react';
import Button from './Button';
import './FormFooter.css';

/**
 * Footer estándar de formularios con botones Cancelar / Guardar.
 * @param {object} props
 * @param {() => void} props.onCancel - Handler del botón Cancelar
 * @param {boolean} [props.saving=false] - Estado de carga del submit
 * @param {{ cancel?: string, submit?: string }} [props.labels] - Labels personalizados
 * @param {boolean} [props.hidden=false] - Ocultar el footer (modo vista)
 */
export function FormFooter({ onCancel, saving = false, labels = {}, hidden = false }) {
  if (hidden) return null;

  return (
    <div className="form-footer" role="group" aria-label="Acciones del formulario">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={saving}
      >
        {labels.cancel || 'Cancelar'}
      </Button>
      <Button
        type="submit"
        variant="primary"
        disabled={saving}
        loading={saving}
      >
        {labels.submit || 'Guardar'}
      </Button>
    </div>
  );
}

export default FormFooter;
