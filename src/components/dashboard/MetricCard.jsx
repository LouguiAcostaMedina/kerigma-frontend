/**
 * Componente de Tarjeta de Métrica
 * Muestra una métrica individual con valor, cambio y gráfico opcional
 */

import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import Loading from '@/components/common/Loading';
import PropTypes from 'prop-types';
import styles from './MetricCard.module.css';

const MetricCard = ({
  title,
  value,
  previousValue,
  change,
  changeType = 'percentage', // 'percentage', 'absolute', 'none'
  icon: IconComponent,
  color = '#3b82f6', // ahora acepta HEX/string en lugar de solo variantes
  isLoading = false,
  trend = null, // 'up', 'down', 'neutral'
  format = 'number', // 'number', 'currency', 'percentage'
  subtitle = null,
  onClick = null,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`${styles.metricCard} ${styles.loading} ${className}`} style={{ borderLeftColor: color }}>
        <Loading size="small" />
      </div>
    );
  }

  // Calcular el cambio automáticamente si no se proporciona
  const calculatedChange = change !== undefined ? change :
    previousValue !== undefined && previousValue !== 0 ?
      ((value - previousValue) / previousValue) * 100 : 0;

  // Determinar la tendencia automáticamente si no se proporciona
  const calculatedTrend = trend || (
    calculatedChange > 0 ? 'up' :
      calculatedChange < 0 ? 'down' : 'neutral'
  );

  // Formatear el valor principal
  const formatValue = (val) => {
    if (val === null || val === undefined) return 'N/A';

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-PE', {
          style: 'currency',
          currency: 'PEN'
        }).format(val);

      case 'percentage':
        return `${val.toFixed(1)}%`;

      case 'number':
      default:
        return new Intl.NumberFormat('es-PE').format(val);
    }
  };

  // Formatear el cambio
  const formatChange = (changeVal) => {
    if (changeVal === 0 || changeVal === null || changeVal === undefined) {
      return '0%';
    }

    const absChange = Math.abs(changeVal);

    if (changeType === 'percentage') {
      return `${absChange.toFixed(1)}%`;
    } else if (changeType === 'absolute') {
      return new Intl.NumberFormat('es-PE').format(absChange);
    }

    return '';
  };

  // Obtener el icono de tendencia
  const getTrendIcon = () => {
    switch (calculatedTrend) {
      case 'up':
        return <FaArrowUp className={styles.trendUp} />;
      case 'down':
        return <FaArrowDown className={styles.trendDown} />;
      default:
        return <FaMinus className={styles.trendNeutral} />;
    }
  };

  // Clases CSS dinámicas
  const cardClasses = [
    styles.metricCard,
    onClick ? styles.clickable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cardClasses}
      style={{ borderLeftColor: color }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Header con icono y título */}
      <div className={styles.cardHeader}>
        {IconComponent && (
          <div className={styles.iconContainer} style={{ backgroundColor: `${color}15` }}>
            <IconComponent className={styles.icon} style={{ color }} />
          </div>
        )}
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {/* Valor principal */}
      <div className={styles.cardBody}>
        <div className={styles.valueSection}>
          <span className={styles.value}>
            {formatValue(value)}
          </span>

          {changeType !== 'none' && calculatedChange !== 0 && (
            <div className={styles.changeSection}>
              {getTrendIcon()}
              <span className={`${styles.changeText} ${styles[`trend${calculatedTrend.charAt(0).toUpperCase() + calculatedTrend.slice(1)}`]}`}>
                {formatChange(calculatedChange)}
              </span>
            </div>
          )}
        </div>

        {previousValue !== undefined && (
          <div className={styles.comparison}>
            <span className={styles.comparisonLabel}>Anterior:</span>
            <span className={styles.comparisonValue}>
              {formatValue(previousValue)}
            </span>
          </div>
        )}
      </div>

      {/* Efecto de hover */}
      <div className={styles.hoverEffect} style={{ backgroundColor: `${color}05` }}></div>
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  previousValue: PropTypes.number,
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['percentage', 'absolute', 'none']),
  icon: PropTypes.elementType,
  color: PropTypes.string, // ahora más flexible
  isLoading: PropTypes.bool,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  format: PropTypes.oneOf(['number', 'currency', 'percentage']),
  subtitle: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default MetricCard;
