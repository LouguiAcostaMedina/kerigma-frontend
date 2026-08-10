/**
 * Componente de Gráfico de Líneas
 * Wrapper para Chart.js con configuración personalizada para el dashboard
 */

import { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Loading from '@/components/common/Loading';
import PropTypes from 'prop-types';
import styles from './LineChart.module.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({ 
  data, 
  title, 
  loading = false, 
  height = 300,
  showLegend = true,
  gradient = true,
  color = '#e2a63f'
}) => {
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!data || loading) return;

    const chart = chartRef.current;
    let gradientFill = null;

    if (chart && gradient) {
      const ctx = chart.ctx;
      gradientFill = ctx.createLinearGradient(0, 0, 0, height);
      gradientFill.addColorStop(0, `${color}20`);
      gradientFill.addColorStop(1, `${color}00`);
    }

    const processedData = {
      labels: data.labels || [],
      datasets: [{
        label: data.label || 'Datos',
        data: data.values || [],
        borderColor: color,
        backgroundColor: gradient ? gradientFill : `${color}10`,
        borderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: '#f3ece0',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: gradient,
        tension: 0.4
      }]
    };

    setChartData(processedData);
  }, [data, loading, height, gradient, color]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(20, 17, 11, 0.95)',
        titleColor: '#f3ece0',
        bodyColor: '#f3ece0',
        borderColor: color,
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return context[0]?.label || '';
          },
          label: (context) => {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${value.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#c2b6a1'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(243, 236, 224, 0.08)',
          borderDash: [5, 5]
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#c2b6a1',
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic'
    }
  };

  if (loading) {
    return (
      <div className={styles.chartContainer} style={{ height }}>
        <Loading size="medium" />
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className={styles.chartContainer} style={{ height }}>
        <div className={styles.noData}>
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer} style={{ height }}>
      <Line ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

LineChart.propTypes = {
  data: PropTypes.shape({
    labels: PropTypes.array,
    values: PropTypes.array,
    label: PropTypes.string
  }),
  title: PropTypes.string,
  loading: PropTypes.bool,
  height: PropTypes.number,
  showLegend: PropTypes.bool,
  gradient: PropTypes.bool,
  color: PropTypes.string
};

export default LineChart;