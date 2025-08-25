import React, { useMemo } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import styles from './ChurchStats.module.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const ChurchStats = ({ churches = [], members = [], groups = [], students = [] }) => {
  // Calculamos las estadísticas principales
  const stats = useMemo(() => {
    const totalChurches = churches.length;
    const activeChurches = churches.filter(c => c.status === 'active').length;
    const inactiveChurches = churches.filter(c => c.status === 'inactive').length;
    const inConstruction = churches.filter(c => c.status === 'construction').length;
    const inPlanning = churches.filter(c => c.status === 'planning').length;
    
    const totalCapacity = churches.reduce((sum, church) => sum + (parseInt(church.capacity) || 0), 0);
    const avgCapacity = totalChurches > 0 ? Math.round(totalCapacity / totalChurches) : 0;
    
    const churchesWithPastor = churches.filter(c => c.pastorId).length;
    const churchesWithLeader = churches.filter(c => c.leaderId).length;
    
    // Agrupaciones geográficas
    const citiesCount = [...new Set(churches.map(c => c.city))].length;
    const statesCount = [...new Set(churches.map(c => c.state))].length;
    const countriesCount = [...new Set(churches.map(c => c.country))].length;

    return {
      totalChurches,
      activeChurches,
      inactiveChurches,
      inConstruction,
      inPlanning,
      totalCapacity,
      avgCapacity,
      churchesWithPastor,
      churchesWithLeader,
      citiesCount,
      statesCount,
      countriesCount
    };
  }, [churches]);

  // Datos para gráfico de estado de iglesias
  const statusChartData = useMemo(() => ({
    labels: ['Activas', 'Inactivas', 'En Construcción', 'En Planificación'],
    datasets: [{
      label: 'Estado de Iglesias',
      data: [stats.activeChurches, stats.inactiveChurches, stats.inConstruction, stats.inPlanning],
      backgroundColor: [
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(59, 130, 246, 0.8)'
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(59, 130, 246, 1)'
      ],
      borderWidth: 2
    }]
  }), [stats]);

  // Datos para gráfico de capacidad por iglesia
  const capacityChartData = useMemo(() => {
    const sortedChurches = [...churches]
      .filter(c => c.capacity && c.capacity > 0)
      .sort((a, b) => parseInt(b.capacity) - parseInt(a.capacity))
      .slice(0, 10);

    return {
      labels: sortedChurches.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name),
      datasets: [{
        label: 'Capacidad',
        data: sortedChurches.map(c => parseInt(c.capacity)),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  }, [churches]);

  // Datos para distribución geográfica
  const geographicData = useMemo(() => {
    const cityCount = churches.reduce((acc, church) => {
      acc[church.city] = (acc[church.city] || 0) + 1;
      return acc;
    }, {});

    const topCities = Object.entries(cityCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    return {
      labels: topCities.map(([city]) => city),
      datasets: [{
        label: 'Iglesias por Ciudad',
        data: topCities.map(([, count]) => count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(245, 101, 101, 0.8)'
        ],
        borderWidth: 0
      }]
    };
  }, [churches]);

  // Análisis de instalaciones
  const facilitiesData = useMemo(() => {
    const facilitiesCount = {
      parking: 0,
      accessibility: 0,
      audioVisual: 0,
      kitchen: 0,
      nursery: 0,
      library: 0
    };

    churches.forEach(church => {
      if (church.facilities) {
        Object.keys(facilitiesCount).forEach(facility => {
          if (church.facilities[facility]) {
            facilitiesCount[facility]++;
          }
        });
      }
    });

    const facilitiesLabels = {
      parking: 'Estacionamiento',
      accessibility: 'Accesibilidad',
      audioVisual: 'Audio y Video',
      kitchen: 'Cocina',
      nursery: 'Guardería',
      library: 'Biblioteca'
    };

    return {
      labels: Object.keys(facilitiesCount).map(key => facilitiesLabels[key]),
      datasets: [{
        label: 'Instalaciones',
        data: Object.values(facilitiesCount),
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(34, 197, 94, 1)'
      }]
    };
  }, [churches]);

  // Crecimiento mensual (simulado)
  const growthData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    const growthValues = [];
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth - 11 + i + 12) % 12;
      // Simular crecimiento basado en fechas de fundación
      const churchesInMonth = churches.filter(c => {
        if (!c.foundedDate) return false;
        const foundedDate = new Date(c.foundedDate);
        return foundedDate.getMonth() === monthIndex;
      }).length;
      growthValues.push(churchesInMonth);
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Iglesias Fundadas',
          data: growthValues,
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  }, [churches]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: Math.max(...Object.values(facilitiesData.datasets[0].data))
      }
    }
  };

  return (
    <div className={styles.statsContainer}>
      {/* Métricas principales */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>🏛️</div>
          <div className={styles.metricContent}>
            <h3>Total de Iglesias</h3>
            <div className={styles.metricValue}>{stats.totalChurches}</div>
            <div className={styles.metricSubtext}>
              {stats.activeChurches} activas
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>📍</div>
          <div className={styles.metricContent}>
            <h3>Ubicaciones</h3>
            <div className={styles.metricValue}>{stats.citiesCount}</div>
            <div className={styles.metricSubtext}>
              {stats.statesCount} regiones
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👥</div>
          <div className={styles.metricContent}>
            <h3>Capacidad Total</h3>
            <div className={styles.metricValue}>{stats.totalCapacity.toLocaleString()}</div>
            <div className={styles.metricSubtext}>
              Promedio: {stats.avgCapacity}
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>👨‍💼</div>
          <div className={styles.metricContent}>
            <h3>Con Pastor</h3>
            <div className={styles.metricValue}>{stats.churchesWithPastor}</div>
            <div className={styles.metricSubtext}>
              {stats.churchesWithLeader} con líder
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className={styles.chartsGrid}>
        {/* Estado de iglesias */}
        <div className={styles.chartCard}>
          <h3>Estado de Iglesias</h3>
          <div className={styles.chartContainer}>
            <Doughnut data={statusChartData} options={{
              ...chartOptions,
              cutout: '60%',
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>

        {/* Capacidad por iglesia */}
        <div className={styles.chartCard}>
          <h3>Top 10 - Capacidad</h3>
          <div className={styles.chartContainer}>
            <Bar data={capacityChartData} options={chartOptions} />
          </div>
        </div>

        {/* Distribución geográfica */}
        <div className={styles.chartCard}>
          <h3>Distribución por Ciudad</h3>
          <div className={styles.chartContainer}>
            <Doughnut data={geographicData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>

        {/* Instalaciones disponibles */}
        <div className={styles.chartCard}>
          <h3>Instalaciones Disponibles</h3>
          <div className={styles.chartContainer}>
            <Radar data={facilitiesData} options={radarOptions} />
          </div>
        </div>

        {/* Crecimiento mensual */}
        <div className={styles.chartCard + ' ' + styles.fullWidth}>
          <h3>Fundación de Iglesias por Mes</h3>
          <div className={styles.chartContainer}>
            <Line data={growthData} options={{
              ...chartOptions,
              interaction: {
                intersect: false,
                mode: 'index'
              }
            }} />
          </div>
        </div>
      </div>

      {/* Resumen de estado */}
      <div className={styles.summaryCards}>
        <div className={`${styles.summaryCard} ${styles.success}`}>
          <h4>🟢 Iglesias Activas</h4>
          <div className={styles.summaryValue}>{stats.activeChurches}</div>
          <div className={styles.summaryPercentage}>
            {stats.totalChurches > 0 ? Math.round((stats.activeChurches / stats.totalChurches) * 100) : 0}% del total
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.warning}`}>
          <h4>🟡 En Construcción</h4>
          <div className={styles.summaryValue}>{stats.inConstruction}</div>
          <div className={styles.summaryPercentage}>
            {stats.totalChurches > 0 ? Math.round((stats.inConstruction / stats.totalChurches) * 100) : 0}% del total
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.info}`}>
          <h4>🔵 En Planificación</h4>
          <div className={styles.summaryValue}>{stats.inPlanning}</div>
          <div className={styles.summaryPercentage}>
            {stats.totalChurches > 0 ? Math.round((stats.inPlanning / stats.totalChurches) * 100) : 0}% del total
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.error}`}>
          <h4>🔴 Inactivas</h4>
          <div className={styles.summaryValue}>{stats.inactiveChurches}</div>
          <div className={styles.summaryPercentage}>
            {stats.totalChurches > 0 ? Math.round((stats.inactiveChurches / stats.totalChurches) * 100) : 0}% del total
          </div>
        </div>
      </div>
    </div>
  );
};