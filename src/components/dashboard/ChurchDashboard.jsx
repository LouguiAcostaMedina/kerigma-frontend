import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import Button  from '../common/Button';
import Modal from '../common/Modal';
import  Loading  from '@/components/common/Loading';
import  ChartExporter  from '@/components/common/reports/ChartExporter';
import { showNotification } from '../../utils/notifications';
import styles from './ChurchDashboard.module.css';

export const ChurchDashboard = ({ 
  church, 
  members = [], 
  groups = [], 
  students = [],
  activities = [],
  isOpen = false, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [showExporter, setShowExporter] = useState(false);
  const [exportChart, setExportChart] = useState(null);

  // Métricas principales de la iglesia
  const metrics = useMemo(() => {
    if (!church) return {};

    const churchMembers = members.filter(m => m.churchId === church.id);
    const churchGroups = groups.filter(g => g.churchId === church.id);
    const churchStudents = students.filter(s => s.churchId === church.id);
    const activeMembers = churchMembers.filter(m => m.status === 'active');
    const activeGroups = churchGroups.filter(g => g.status === 'active');

    // Cálculos de crecimiento (simulado)
    const lastMonthMembers = Math.max(0, activeMembers.length - Math.floor(Math.random() * 5));
    const memberGrowth = lastMonthMembers > 0 
      ? ((activeMembers.length - lastMonthMembers) / lastMonthMembers * 100).toFixed(1)
      : 0;

    const capacityUsage = church.capacity 
      ? ((activeMembers.length / parseInt(church.capacity)) * 100).toFixed(1)
      : 0;

    return {
      totalMembers: churchMembers.length,
      activeMembers: activeMembers.length,
      totalGroups: churchGroups.length,
      activeGroups: activeGroups.length,
      totalStudents: churchStudents.length,
      memberGrowth: parseFloat(memberGrowth),
      capacityUsage: parseFloat(capacityUsage),
      avgGroupSize: activeGroups.length > 0 
        ? Math.round(activeMembers.length / activeGroups.length) 
        : 0
    };
  }, [church, members, groups, students]);

  // Datos para gráfico de crecimiento mensual
  const growthData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const memberData = [];
    const groupData = [];
    const studentData = [];

    // Simular datos de crecimiento
    for (let i = 0; i < 12; i++) {
      memberData.push(Math.max(0, metrics.activeMembers - Math.floor(Math.random() * 20) + i * 2));
      groupData.push(Math.max(0, metrics.activeGroups - Math.floor(Math.random() * 3) + Math.floor(i / 3)));
      studentData.push(Math.max(0, metrics.totalStudents - Math.floor(Math.random() * 10) + i));
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Miembros',
          data: memberData,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Grupos',
          data: groupData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        },
        {
          label: 'Estudiantes',
          data: studentData,
          borderColor: 'rgba(251, 191, 36, 1)',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderWidth: 3,
          fill: false,
          tension: 0.4
        }
      ]
    };
  }, [metrics]);

  // Distribución por edades (simulada)
  const ageDistribution = useMemo(() => ({
    labels: ['0-12', '13-17', '18-25', '26-35', '36-50', '51-65', '65+'],
    datasets: [{
      label: 'Distribución por Edad',
      data: [
        Math.floor(metrics.activeMembers * 0.15),
        Math.floor(metrics.activeMembers * 0.12),
        Math.floor(metrics.activeMembers * 0.18),
        Math.floor(metrics.activeMembers * 0.22),
        Math.floor(metrics.activeMembers * 0.20),
        Math.floor(metrics.activeMembers * 0.08),
        Math.floor(metrics.activeMembers * 0.05)
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(251, 191, 36, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(75, 85, 99, 0.8)'
      ]
    }]
  }), [metrics.activeMembers]);

  // Asistencia semanal (simulada)
  const attendanceData = useMemo(() => {
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
    const baseAttendance = Math.floor(metrics.activeMembers * 0.75);
    
    return {
      labels: weeks,
      datasets: [
        {
          label: 'Domingo',
          data: weeks.map(() => baseAttendance + Math.floor(Math.random() * 20 - 10)),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderRadius: 6
        },
        {
          label: 'Miércoles',
          data: weeks.map(() => Math.floor(baseAttendance * 0.6) + Math.floor(Math.random() * 15 - 7)),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderRadius: 6
        },
        {
          label: 'Viernes',
          data: weeks.map(() => Math.floor(baseAttendance * 0.4) + Math.floor(Math.random() * 10 - 5)),
          backgroundColor: 'rgba(251, 191, 36, 0.8)',
          borderRadius: 6
        }
      ]
    };
  }, [metrics.activeMembers]);

  // Análisis de grupos
  const groupAnalysis = useMemo(() => {
    const groupTypes = ['Célula', 'Estudio Bíblico', 'Jóvenes', 'Niños', 'Mujeres', 'Hombres'];
    const data = groupTypes.map(() => Math.floor(Math.random() * metrics.activeGroups) + 1);

    return {
      labels: groupTypes,
      datasets: [{
        label: 'Grupos por Tipo',
        data: data,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(99, 102, 241, 1)'
      }]
    };
  }, [metrics.activeGroups]);

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
      }
    },
    scales: {
      x: {
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  const handleExportChart = (chartType, chartData) => {
    setExportChart({ type: chartType, data: chartData });
    setShowExporter(true);
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'growth', label: 'Crecimiento', icon: '📈' },
    { id: 'demographics', label: 'Demografia', icon: '👥' },
    { id: 'attendance', label: 'Asistencia', icon: '📅' },
    { id: 'groups', label: 'Grupos', icon: '👨‍👩‍👧‍👦' }
  ];

  if (!church) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="large">
        <div className={styles.noData}>
          <h2>No hay iglesia seleccionada</h2>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="fullscreen">
      <div className={styles.dashboardContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.churchInfo}>
            <h1>{church.name}</h1>
            <div className={styles.churchMeta}>
              <span className={styles.location}>📍 {church.city}, {church.state}</span>
              <span className={`${styles.status} ${styles[church.status]}`}>
                {church.status === 'active' ? '🟢 Activa' : 
                 church.status === 'construction' ? '🟡 En Construcción' :
                 church.status === 'planning' ? '🔵 En Planificación' : '🔴 Inactiva'}
              </span>
              {church.capacity && (
                <span className={styles.capacity}>👥 Cap: {church.capacity}</span>
              )}
            </div>
          </div>
          <div className={styles.headerActions}>
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className={styles.dateSelector}
            >
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Año</option>
            </select>
            <Button variant="secondary" size="small" onClick={onClose}>
              ✕ Cerrar
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Tab: Resumen */}
          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              {/* Métricas principales */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>👥</div>
                  <div className={styles.metricContent}>
                    <h3>Miembros Activos</h3>
                    <div className={styles.metricValue}>{metrics.activeMembers}</div>
                    <div className={styles.metricChange}>
                      {metrics.memberGrowth > 0 ? '📈' : metrics.memberGrowth < 0 ? '📉' : '➡️'} 
                      {Math.abs(metrics.memberGrowth)}% este mes
                    </div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>👨‍👩‍👧‍👦</div>
                  <div className={styles.metricContent}>
                    <h3>Grupos Activos</h3>
                    <div className={styles.metricValue}>{metrics.activeGroups}</div>
                    <div className={styles.metricChange}>
                      Promedio: {metrics.avgGroupSize} miembros/grupo
                    </div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>📚</div>
                  <div className={styles.metricContent}>
                    <h3>Estudiantes</h3>
                    <div className={styles.metricValue}>{metrics.totalStudents}</div>
                    <div className={styles.metricChange}>
                      En estudios bíblicos
                    </div>
                  </div>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricIcon}>📊</div>
                  <div className={styles.metricContent}>
                    <h3>Uso de Capacidad</h3>
                    <div className={styles.metricValue}>{metrics.capacityUsage}%</div>
                    <div className={styles.metricChange}>
                      {metrics.activeMembers} de {church.capacity || 'N/A'} lugares
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de contacto y detalles */}
              <div className={styles.infoCards}>
                <div className={styles.infoCard}>
                  <h3>📞 Información de Contacto</h3>
                  <div className={styles.contactInfo}>
                    {church.phone && <div><strong>Teléfono:</strong> {church.phone}</div>}
                    {church.email && <div><strong>Email:</strong> {church.email}</div>}
                    {church.address && <div><strong>Dirección:</strong> {church.address}</div>}
                    {church.contact?.website && (
                      <div><strong>Sitio Web:</strong> 
                        <a href={church.contact.website} target="_blank" rel="noopener noreferrer">
                          {church.contact.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <h3>⛪ Horarios de Servicios</h3>
                  <div className={styles.servicesInfo}>
                    {church.services?.sunday.enabled && (
                      <div><strong>Domingo:</strong> {church.services.sunday.time}</div>
                    )}
                    {church.services?.wednesday.enabled && (
                      <div><strong>Miércoles:</strong> {church.services.wednesday.time}</div>
                    )}
                    {church.services?.friday.enabled && (
                      <div><strong>Viernes:</strong> {church.services.friday.time}</div>
                    )}
                  </div>
                </div>

                <div className={styles.infoCard}>
                  <h3>🏗️ Instalaciones</h3>
                  <div className={styles.facilitiesInfo}>
                    {Object.entries(church.facilities || {}).map(([key, value]) => {
                      if (!value) return null;
                      const labels = {
                        parking: '🚗 Estacionamiento',
                        accessibility: '♿ Accesibilidad',
                        audioVisual: '🎤 Audio y Video',
                        kitchen: '🍽️ Cocina',
                        nursery: '👶 Guardería',
                        library: '📚 Biblioteca'
                      };
                      return <div key={key}>{labels[key]}</div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Crecimiento */}
          {activeTab === 'growth' && (
            <div className={styles.tabContent}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>📈 Crecimiento Anual</h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleExportChart('line', growthData)}
                  >
                    📤 Exportar
                  </Button>
                </div>
                <div className={styles.chartContainer}>
                  <Line data={growthData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Demografia */}
          {activeTab === 'demographics' && (
            <div className={styles.tabContent}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>👥 Distribución por Edades</h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleExportChart('doughnut', ageDistribution)}
                  >
                    📤 Exportar
                  </Button>
                </div>
                <div className={styles.chartContainer}>
                  <Doughnut data={ageDistribution} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Asistencia */}
          {activeTab === 'attendance' && (
            <div className={styles.tabContent}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>📅 Asistencia Semanal</h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleExportChart('bar', attendanceData)}
                  >
                    📤 Exportar
                  </Button>
                </div>
                <div className={styles.chartContainer}>
                  <Bar data={attendanceData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Grupos */}
          {activeTab === 'groups' && (
            <div className={styles.tabContent}>
              <div className={styles.chartCard}>
                <div className={styles.chartHeader}>
                  <h3>👨‍👩‍👧‍👦 Análisis de Grupos</h3>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => handleExportChart('radar', groupAnalysis)}
                  >
                    📤 Exportar
                  </Button>
                </div>
                <div className={styles.chartContainer}>
                  <Radar data={groupAnalysis} options={{
                    ...chartOptions,
                    scales: {
                      r: {
                        angleLines: { display: true },
                        suggestedMin: 0,
                        suggestedMax: Math.max(...groupAnalysis.datasets[0].data) + 2
                      }
                    }
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de exportación */}
        {showExporter && exportChart && (
          <ChartExporter
            isOpen={showExporter}
            onClose={() => setShowExporter(false)}
            chartType={exportChart.type}
            chartData={exportChart.data}
            filename={`${church.name}_${activeTab}_${Date.now()}`}
          />
        )}
      </div>
    </Modal>
  );
};