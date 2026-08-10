/**
 * Página Principal del Dashboard
 * Muestra KPIs, pilares espirituales del trimestre y comparativa de metas
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard.Service';
import DashboardKpis from '@/components/dashboard/DashboardKpis';
import PillarGauge from '@/components/dashboard/PillarGauge';
import GoalsComparisonChart from '@/components/dashboard/GoalsComparisonChart';
import AttendanceQrModal from '@/components/dashboard/AttendanceQrModal';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { exportDashboardExcel, exportDashboardPdf } from '@/utils/dashboardExport';
import { FaSync, FaHeart, FaCalendarAlt, FaBullseye, FaFilePdf, FaFileExcel, FaQrcode, FaGlobe } from 'react-icons/fa';
import styles from './Dashboard.module.css';

const PILLAR_CONFIG = {
  comunion: { color: '#e2a63f', icon: FaHeart },
  relacionamiento: { color: '#34d399', icon: FaHeart },
  mision: { color: '#60a5fa', icon: FaHeart }
};

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [spiritual, setSpiritual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (force) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [kpisData, spiritualData] = await Promise.all([
        dashboardService.getDashboardKpis(),
        dashboardService.getSpiritualHealth()
      ]);
      setKpis(kpisData);
      setSpiritual(spiritualData);
      return true;
    } catch (error) {
      console.error('Error loading dashboard:', error);
      showToast(error?.message || 'Error al cargar los datos del dashboard', 'error');
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    const success = await loadData(true);
    if (success) {
      showToast('Datos actualizados correctamente', 'success');
    }
  };

  const handleExportPdf = () => {
    try {
      exportDashboardPdf({ kpis, spiritual });
      showToast('Reporte PDF descargado correctamente', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('Error al exportar el reporte PDF', 'error');
    }
  };

  const handleExportExcel = () => {
    try {
      exportDashboardExcel({ kpis, spiritual });
      showToast('Reporte Excel descargado correctamente', 'success');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      showToast('Error al exportar el reporte Excel', 'error');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleMessage = () => {
    if (hasRole('admin')) return 'Panel de administración completo';
    if (hasRole('director')) return 'Vista de director regional';
    if (hasRole('lider')) return 'Dashboard de liderazgo';
    if (hasRole('lector')) return 'Vista de consulta';
    return 'Dashboard';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  };

  const buildPillarDetail = (pillar) => {
    if (!pillar) return null;
    if (pillar.activeDisciplePairs !== undefined) {
      return `${pillar.activeDisciplePairs} parejas · ${pillar.bibleStudentsInProgress} estudiantes en curso`;
    }
    return `${pillar.raw} de ${pillar.denominator} miembros`;
  };

  if (loading && !kpis && !spiritual) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const pillars = spiritual?.pillars || {};
  const quarter = spiritual?.quarter;

  return (
    <div className={styles.dashboard}>
      {/* Header del Dashboard */}
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>
            {getGreeting()}, {user?.nombre || user?.firstName || 'Usuario'}
          </h1>
          <p className={styles.subtitle}>
            {getRoleMessage()} - {new Intl.DateTimeFormat('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }).format(new Date())}
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.exportBar}>
            <button
              onClick={handleExportPdf}
              className={styles.exportButton}
              disabled={loading}
              title="Exportar reporte PDF"
            >
              <FaFilePdf className={styles.exportIcon} />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className={styles.exportButton}
              disabled={loading}
              title="Exportar reporte Excel"
            >
              <FaFileExcel className={styles.exportIcon} />
              Excel
            </button>
            <button
              onClick={() => setIsQrOpen(true)}
              className={styles.exportButton}
              title="Códigos QR de asistencia por grupo"
            >
              <FaQrcode className={styles.exportIcon} />
              QR
            </button>
          </div>

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

      {/* Referencia del trimestre (o vista consolidada global) */}
      {quarter ? (
        <div className={styles.quarterBanner}>
          <FaCalendarAlt className={styles.quarterIcon} />
          <div className={styles.quarterInfo}>
            <strong>{quarter.name} {quarter.year}</strong>
            <span>
              {quarter.period} · {formatDate(quarter.startDate)} - {formatDate(quarter.endDate)}
            </span>
          </div>
        </div>
      ) : (
        spiritual?.churchId === '__global__' && (
          <div className={styles.quarterBanner}>
            <FaGlobe className={styles.quarterIcon} />
            <div className={styles.quarterInfo}>
              <strong>Vista consolidada global</strong>
              <span>Todas las iglesias activas · sin trimestre de referencia</span>
            </div>
          </div>
        )
      )}

      {/* KPIs Principales */}
      <section className={styles.statsSection}>
        <DashboardKpis kpis={kpis} loading={loading} />
      </section>

      {/* Pilares Espirituales */}
      <section className={styles.pillarsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaHeart className={styles.sectionIcon} />
            Salud Espiritual del Trimestre
          </h2>
        </div>
        <div className={styles.pillarsGrid}>
          {['comunion', 'relacionamiento', 'mision'].map((key) => {
            const pillar = pillars[key];
            if (!pillar) return null;
            return (
              <PillarGauge
                key={key}
                label={pillar.label}
                value={pillar.value}
                description={pillar.description}
                detail={buildPillarDetail(pillar)}
                color={PILLAR_CONFIG[key].color}
              />
            );
          })}
        </div>
      </section>

      {/* Comparativa de Metas */}
      <section className={styles.goalsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <FaBullseye className={styles.sectionIcon} />
            Comparativa de Metas Planificadas vs Alcanzadas
          </h2>
        </div>
        <GoalsComparisonChart goals={spiritual?.goals} loading={loading} />
      </section>

      <AttendanceQrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};

export default Dashboard;
