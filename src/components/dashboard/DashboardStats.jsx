/**
 * Componente de Estadísticas del Dashboard
 * Muestra las tarjetas de métricas principales con iconos y colores específicos
 */

import { 
  FaUsers, 
  FaChurch, 
  FaUserGraduate, 
  FaBook, 
  FaTrophy,
  FaChartLine
} from 'react-icons/fa';
import MetricCard from './MetricCard';
import PropTypes from 'prop-types';
import styles from './DashboardStats.module.css';

const DashboardStats = ({ stats, loading = false }) => {
  // Configuración de las métricas con sus respectivos iconos y colores
  const metricsConfig = [
    {
      key: 'totalMembers',
      title: 'Miembros Totales',
      icon: FaUsers,
      color: '#3b82f6',
      format: 'number'
    },
    {
      key: 'totalChurches',
      title: 'Iglesias',
      icon: FaChurch,
      color: '#10b981',
      format: 'number'
    },
    {
      key: 'totalStudents',
      title: 'Estudiantes Bíblicos',
      icon: FaUserGraduate,
      color: '#f59e0b',
      format: 'number'
    },
    {
      key: 'totalGroups',
      title: 'Grupos',
      icon: FaBook,
      color: '#8b5cf6',
      format: 'number'
    },
    {
      key: 'baptisms',
      title: 'Bautismos',
      icon: FaTrophy,
      color: '#ef4444',
      format: 'number'
    },
    {
      key: 'growthRate',
      title: 'Crecimiento',
      icon: FaChartLine,
      color: '#06b6d4',
      format: 'percentage'
    }
  ];

  const formatValue = (value, format) => {
    if (value === null || value === undefined) return '0';
    
    switch (format) {
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      case 'number':
      default:
        return Number(value).toLocaleString();
    }
  };

  const getChangeValue = (key, stats) => {
    const changeKey = `${key}Change`;
    return stats?.[changeKey] || 0;
  };

  return (
    <div className={styles.statsGrid}>
      {metricsConfig.map(({ key, title, icon: Icon, color, format }) => (
        <MetricCard
          key={key}
          title={title}
          value={formatValue(stats?.[key], format)}
          change={getChangeValue(key, stats)}
          icon={<Icon />}
          color={color}
          loading={loading}
        />
      ))}
    </div>
  );
};

DashboardStats.propTypes = {
  stats: PropTypes.shape({
    totalMembers: PropTypes.number,
    totalMembersChange: PropTypes.number,
    totalChurches: PropTypes.number,
    totalChurchesChange: PropTypes.number,
    totalStudents: PropTypes.number,
    totalStudentsChange: PropTypes.number,
    totalGroups: PropTypes.number,
    totalGroupsChange: PropTypes.number,
    baptisms: PropTypes.number,
    baptismsChange: PropTypes.number,
    growthRate: PropTypes.number,
    growthRateChange: PropTypes.number
  }),
  loading: PropTypes.bool
};

export default DashboardStats;