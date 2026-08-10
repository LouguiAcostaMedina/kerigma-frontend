/**
 * Componente de Comparativa de Metas
 * Gráfico de barras horizontales que compara metas planificadas vs alcanzadas
 */

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Loading from '@/components/common/Loading';
import PropTypes from 'prop-types';
import styles from './GoalsComparisonChart.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const GOAL_TYPE_COLORS = {
  comunion: '#e2a63f',
  relacionamiento: '#34d399',
  mision: '#60a5fa'
};

const GOAL_TYPE_LABELS = {
  comunion: 'Comunión',
  relacionamiento: 'Relacionamiento',
  mision: 'Misión'
};

const GoalsComparisonChart = ({ goals, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.chartContainer}>
        <Loading size="medium" />
      </div>
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <div className={styles.chartContainer}>
        <p className={styles.empty}>No hay metas registradas para este trimestre</p>
      </div>
    );
  }

  const labels = goals.map((goal) => goal.title);
  const targets = goals.map((goal) => goal.targetValue);
  const achieved = goals.map((goal) => goal.achievedValue ?? goal.currentValue ?? 0);
  const achievedColors = goals.map((goal) => GOAL_TYPE_COLORS[goal.goalType] || '#e2a63f');

  const data = {
    labels,
    datasets: [
      {
        label: 'Planificado',
        data: targets,
        backgroundColor: '#3a3123',
        borderWidth: 0,
        borderRadius: 4
      },
      {
        label: 'Alcanzado',
        data: achieved,
        backgroundColor: achievedColors,
        borderWidth: 0,
        borderRadius: 4
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#f3ece0',
          font: { size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 17, 11, 0.95)',
        titleColor: '#f3ece0',
        bodyColor: '#f3ece0',
        borderColor: '#3a3123',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context) => {
            const goal = goals[context.dataIndex];
            const unit = goal?.unit ? ` ${goal.unit}` : '';
            return `${context.dataset.label}: ${context.parsed.x}${unit}`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(243, 236, 224, 0.08)', borderDash: [5, 5] },
        border: { display: false },
        ticks: { color: '#c2b6a1', font: { size: 11 } }
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#f3ece0', font: { size: 12, weight: '600' } }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic'
    }
  };

  return (
    <div className={styles.chartContainer}>
      <Bar data={data} options={options} />
      <div className={styles.legendMeta}>
        {goals.map((goal) => (
          <span key={goal.id} className={styles.goalTag}>
            <span
              className={styles.goalDot}
              style={{ backgroundColor: GOAL_TYPE_COLORS[goal.goalType] || '#e2a63f' }}
            />
            {GOAL_TYPE_LABELS[goal.goalType] || goal.goalType}: {goal.progressPercent}%
          </span>
        ))}
      </div>
    </div>
  );
};

GoalsComparisonChart.propTypes = {
  goals: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      goalType: PropTypes.string,
      title: PropTypes.string,
      targetValue: PropTypes.number,
      currentValue: PropTypes.number,
      achievedValue: PropTypes.number,
      unit: PropTypes.string,
      status: PropTypes.string,
      progressPercent: PropTypes.number
    })
  ),
  loading: PropTypes.bool
};

export default GoalsComparisonChart;
