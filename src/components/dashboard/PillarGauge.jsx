/**
 * Componente de Medidor de Pilar Espiritual
 * Muestra el porcentaje de un pilar con un gráfico de dona y el valor central
 */

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';
import styles from './PillarGauge.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PillarGauge = ({ label, value, description, detail = null, color = '#e2a63f' }) => {
  const clamped = Math.min(100, Math.max(0, Number(value) || 0));

  const data = {
    labels: [label, 'Restante'],
    datasets: [
      {
        data: [clamped, 100 - clamped],
        backgroundColor: [color, '#2b251b'],
        borderWidth: 0,
        borderRadius: clamped >= 100 ? 0 : 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '76%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    },
    animation: {
      duration: 1200,
      easing: 'easeInOutCubic'
    }
  };

  return (
    <div className={styles.gaugeCard}>
      <div className={styles.gaugeWrap}>
        <Doughnut data={data} options={options} />
        <div className={styles.gaugeCenter}>
          <span className={styles.gaugeValue}>{clamped.toFixed(1)}%</span>
        </div>
      </div>
      <div className={styles.gaugeInfo}>
        <h3 className={styles.gaugeTitle}>
          {label}
        </h3>
        <p className={styles.gaugeDesc}>{description}</p>
        {detail && <div className={styles.gaugeDetail}>{detail}</div>}
      </div>
    </div>
  );
};

PillarGauge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  description: PropTypes.string,
  detail: PropTypes.node,
  color: PropTypes.string
};

export default PillarGauge;
