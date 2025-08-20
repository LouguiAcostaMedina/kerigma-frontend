/**
 * Página Principal del Dashboard
 * Muestra el dashboard con métricas, estadísticas y gráficos según el rol del usuario
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import Loading from '@/components/common/Loading';
import { showNotification } from '@/utils/notifications';
import { FaSync, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    stats, 
    chartsData, 
    loading, 
    error, 
    fetchDashboardData,
    fetchChartData 
  } = useDashboard();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDashboardData(),
          fetchChartData(selectedPeriod)
        ]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      }
    };

    loadData();
  }, [fetchDashboardData, fetchChartData, selectedPeriod]);

  // Manejo de errores
  useEffect(() => {
    if (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar los datos del dashboard'
      });
    }
  }, [error]);

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchChartData(selectedPeriod)
      ]);
      showNotification({
        type: 'success',
        title: 'Actualizado',
        message: 'Datos actualizados correctamente'
      });
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar los datos'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Cambiar período de tiempo
  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    try {
      await fetchChartData(period);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar datos del período seleccionado'
      });
    }
  };

  // Obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  // Obtener mensaje según el rol
  const getRoleMessage = (role) => {
    const messages = {
      'administrador': 'Panel de administración completo',
      'director': 'Vista de director regional',
      'lider': 'Dashboard de liderazgo',
      'lector': 'Vista de consulta'
    };
    return messages[role] || 'Dashboard';
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading && !stats) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header del Dashboard */}
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>
            {getGreeting()}, {user?.firstName || 'Usuario'}
          </h1>
          <p className={styles.subtitle}>
            {getRoleMessage(user?.role)} - {formatDate(new Date())}
          </p>
        </div>
        
        <div className={styles.headerActions}>
          {/* Selector de período */}
          <div className={styles.periodSelector}>
            <FaFilter className={styles.filterIcon} />
            <select 
              value={selectedPeriod} 
              onChange={(e) => handlePeriodChange(e.target.value)}
              className={styles.periodSelect}
            >
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
            </select>
          </div>

          {/* Botón de actualizar */}
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className={styles.refreshButton}
          >
            <FaSync className={`${styles.refreshIcon} ${refreshing ? styles.spinning : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Estadísticas Principales */}
      <section className={styles.statsSection}>
        <DashboardStats 
          stats={stats} 
          loading={loading} 
        />
      </section>

      {/* Gráficos y Charts */}
      {(user?.role === 'administrador' || user?.role === 'director' || user?.role === 'lider') && (
        <section className={styles.chartsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <FaCalendarAlt className={styles.sectionIcon} />
              Análisis y Tendencias
            </h2>
          </div>
          <DashboardCharts 
            chartsData={chartsData} 
            loading={loading}
          />
        </section>
      )}

      {/* Mensaje para lectores */}
      {user?.role === 'lector' && (
        <div className={styles.readerMessage}>
          <div className={styles.messageCard}>
            <h3>Vista de Solo Lectura</h3>
            <p>Como lector, tienes acceso a visualizar las métricas generales del sistema.</p>
            <p>Para acceder a más funcionalidades, contacta con tu administrador.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;