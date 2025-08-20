/**
 * Componente de Gráficos del Dashboard
 * Contiene todos los gráficos y visualizaciones de datos del dashboard
 */

import LineChart from './LineChart';
import PropTypes from 'prop-types';
import styles from './DashboardCharts.module.css';

const DashboardCharts = ({ chartsData, loading = false }) => {
  const {
    membersGrowth,
    studentsGrowth,
    baptismsMonthly,
    groupsActivity
  } = chartsData || {};

  return (
    <div className={styles.chartsContainer}>
      {/* Crecimiento de Miembros */}
      <div className={styles.chartSection}>
        <LineChart
          data={membersGrowth}
          title="Crecimiento de Miembros"
          loading={loading}
          height={320}
          color="#3b82f6"
          gradient={true}
        />
      </div>

      {/* Crecimiento de Estudiantes Bíblicos */}
      <div className={styles.chartSection}>
        <LineChart
          data={studentsGrowth}
          title="Estudiantes Bíblicos"
          loading={loading}
          height={320}
          color="#f59e0b"
          gradient={true}
        />
      </div>

      {/* Bautismos Mensuales */}
      <div className={styles.chartSection}>
        <LineChart
          data={baptismsMonthly}
          title="Bautismos por Mes"
          loading={loading}
          height={320}
          color="#ef4444"
          gradient={true}
        />
      </div>

      {/* Actividad de Grupos */}
      <div className={styles.chartSection}>
        <LineChart
          data={groupsActivity}
          title="Actividad de Grupos"
          loading={loading}
          height={320}
          color="#8b5cf6"
          gradient={true}
        />
      </div>
    </div>
  );
};

DashboardCharts.propTypes = {
  chartsData: PropTypes.shape({
    membersGrowth: PropTypes.shape({
      labels: PropTypes.array,
      values: PropTypes.array,
      label: PropTypes.string
    }),
    studentsGrowth: PropTypes.shape({
      labels: PropTypes.array,
      values: PropTypes.array,
      label: PropTypes.string
    }),
    baptismsMonthly: PropTypes.shape({
      labels: PropTypes.array,
      values: PropTypes.array,
      label: PropTypes.string
    }),
    groupsActivity: PropTypes.shape({
      labels: PropTypes.array,
      values: PropTypes.array,
      label: PropTypes.string
    })
  }),
  loading: PropTypes.bool
};

export default DashboardCharts;