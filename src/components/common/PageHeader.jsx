import React from 'react';
import './PageHeader.css';

/**
 * Cabecera estándar de página con título, subtítulo y área de acciones.
 * @param {object} props
 * @param {React.ReactNode} props.title - Título de la página
 * @param {string} [props.subtitle] - Subtítulo o descripción
 * @param {React.ReactNode} [props.icon] - Icono junto al título
 * @param {React.ReactNode} [props.actionButton] - Botón o grupo de acciones (derecha)
 * @param {React.ReactNode} [props.children] - Contenido adicional debajo del header
 * @param {string} [props.className]
 */
export function PageHeader({ title, subtitle, icon, actionButton, children, className = '' }) {
  return (
    <div className={`page-header${className ? ` ${className}` : ''}`}>
      <div className="page-header__info">
        <h1 className="page-header__title">
          {icon && <span className="page-header__icon">{icon}</span>}
          {title}
        </h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {actionButton && (
        <div className="page-header__actions">{actionButton}</div>
      )}
      {children}
    </div>
  );
}

export default PageHeader;
