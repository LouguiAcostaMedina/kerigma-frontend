/**
 * Componente de KPIs del Dashboard
 * Muestra las tarjetas de métricas principales derivadas de /dashboard/kpis
 */

import {
  FaUsers,
  FaUserCheck,
  FaBook,
  FaUserGraduate,
  FaTrophy,
  FaChartLine,
  FaHandshake,
  FaCalendarCheck
} from 'react-icons/fa';
import MetricCard from './MetricCard';
import PropTypes from 'prop-types';
import styles from './DashboardKpis.module.css';

const KPI_CARDS = [
  { key: 'totalMembers', title: 'Miembros Totales', icon: FaUsers, color: '#e2a63f', format: 'number' },
  { key: 'activeMembers', title: 'Miembros Activos', icon: FaUserCheck, color: '#34d399', format: 'number' },
  { key: 'totalGroups', title: 'Grupos', icon: FaBook, color: '#60a5fa', format: 'number' },
  { key: 'totalBibleStudents', title: 'Estudiantes Bíblicos', icon: FaUserGraduate, color: '#fbbf24', format: 'number' },
  { key: 'totalBaptisms', title: 'Bautismos', icon: FaTrophy, color: '#f87171', format: 'number' },
  { key: 'growthPercent', title: 'Crecimiento', icon: FaChartLine, color: '#22d3ee', format: 'percentage' },
  { key: 'totalActiveDisciplePairs', title: 'Parejas Discipuladoras', icon: FaHandshake, color: '#f472b6', format: 'number' },
  { key: 'attendanceRecords', title: 'Registros de Asistencia', icon: FaCalendarCheck, color: '#2dd4bf', format: 'number' }
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

const DashboardKpis = ({ kpis, loading = false }) => {
  const growthPercent = kpis?.growth?.growthPercent ?? 0;

  const resolveValue = (key) => {
    if (key === 'growthPercent') return growthPercent;
    return kpis?.[key] ?? 0;
  };

  return (
    <div className={styles.kpisGrid}>
      {KPI_CARDS.map(({ key, title, icon: Icon, color, format }) => (
        <MetricCard
          key={key}
          title={title}
          value={formatValue(resolveValue(key), format)}
          icon={Icon}
          color={color}
          isLoading={loading && !kpis}
        />
      ))}
    </div>
  );
};

DashboardKpis.propTypes = {
  kpis: PropTypes.shape({
    totalMembers: PropTypes.number,
    activeMembers: PropTypes.number,
    totalGroups: PropTypes.number,
    activeGroups: PropTypes.number,
    totalBibleStudents: PropTypes.number,
    bibleStudentsInProgress: PropTypes.number,
    baptizedStudents: PropTypes.number,
    baptizedMembers: PropTypes.number,
    totalBaptisms: PropTypes.number,
    totalActiveDisciplePairs: PropTypes.number,
    attendanceRecords: PropTypes.number,
    growth: PropTypes.shape({
      currentQuarterMembers: PropTypes.number,
      previousQuarterMembers: PropTypes.number,
      growthAbsolute: PropTypes.number,
      growthPercent: PropTypes.number
    })
  }),
  loading: PropTypes.bool
};

export default DashboardKpis;
