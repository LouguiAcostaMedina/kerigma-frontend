import React from 'react';
import { FaInbox } from 'react-icons/fa';
import './EmptyState.css';

/**
 * Estado vacío reutilizable para tablas, listas y secciones.
 * @param {object} props
 * @param {React.ReactNode} [props.icon] - Icono a mostrar (default: FaInbox)
 * @param {string} props.title - Título principal
 * @param {string} [props.description] - Descripción secundaria
 * @param {React.ReactNode} [props.action] - Botón o enlace de acción CTA
 * @param {string} [props.className]
 */
export function EmptyState({ icon, title, description, action, className = '' }) {
  const Icon = icon || FaInbox;

  return (
    <div className={`empty-state${className ? ` ${className}` : ''}`} role="status">
      <div className="empty-state__icon">
        {React.isValidElement(Icon) ? Icon : <Icon />}
      </div>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}

export default EmptyState;
