import React from 'react';
import './ChartCard.css';

/**
 * Card para envolver gráficos con título y acción opcional (exportar).
 * @param {object} props
 * @param {string} props.title - Título del gráfico
 * @param {React.ReactNode} [props.icon] - Icono junto al título
 * @param {React.ReactNode} [props.action] - Botón de acción (e.g. exportar)
 * @param {React.ReactNode} props.children - El gráfico
 * @param {string} [props.className]
 */
export function ChartCard({ title, icon, action, children, className = '' }) {
  return (
    <div className={`chart-card${className ? ` ${className}` : ''}`}>
      <div className="chart-card__header">
        <h3 className="chart-card__title">
          {icon && <span className="chart-card__icon">{icon}</span>}
          {title}
        </h3>
        {action && <div className="chart-card__action">{action}</div>}
      </div>
      <div className="chart-card__body">
        {children}
      </div>
    </div>
  );
}

export default ChartCard;
