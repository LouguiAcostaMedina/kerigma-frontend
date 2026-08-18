/**
 * Dashboard Admin — Super Admin / Admin
 * Composición consolidada: KPIs + pilares espirituales + metas + métricas del sistema
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard.Service';
import DashboardKpis from './DashboardKpis';
import PillarGauge from './PillarGauge';
import GoalsComparisonChart from './GoalsComparisonChart';
import AttendanceQrModal from './AttendanceQrModal';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { exportDashboardPdf, exportDashboardExcel } from '@/utils/dashboardExport';
import { FaSync, FaHeart, FaCalendarAlt, FaBullseye, FaFilePdf, FaFileExcel, FaQrcode, FaGlobe } from 'react-icons/fa';
import styles from './AdminDashboard.module.css';

const PILLAR_CONFIG = {
  comunion: { color: '#e2a63f' },
  relacionamiento: { color: '#34d399' },
  mision: { color: '#60a5fa' }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [spiritual, setSpiritual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    try {
      const [kpisData, spiritualData] = await Promise.all([
        dashboardService.getDashboardKpis(),
        dashboardService.getSpiritualHealth(),
      ]);
      setKpis(kpisData);
      setSpiritual(spiritualData);
      return true;
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      showToast(error?.message || 'Error al cargar los datos', 'error');
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => {
    const ok = await loadData(true);
    if (ok) showToast('Datos actualizados', 'success');
  };

  const handleExportPdf = () => {
    try { exportDashboardPdf({ kpis, spiritual }); showToast('PDF descargado', 'success'); }
    catch { showToast('Error al exportar PDF', 'error'); }
  };

  const handleExportExcel = () => {
    try { exportDashboardExcel({ kpis, spiritual }); showToast('Excel descargado', 'success'); }
    catch { showToast('Error al exportar Excel', 'error'); }
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const pillars = spiritual?.pillars || {};
  const quarter = spiritual?.quarter;

  if (loading && !kpis) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>{getGreeting()}, {user?.nombre || 'Administrador'}</h1>
          <p className={styles.subtitle}>
            Panel de administración completo — {new Intl.DateTimeFormat('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }).format(new Date())}
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.exportBar}>
            <button onClick={handleExportPdf} className={styles.exportButton} disabled={loading} title="PDF">
              <FaFilePdf /> PDF
            </button>
            <button onClick={handleExportExcel} className={styles.exportButton} disabled={loading} title="Excel">
              <FaFileExcel /> Excel
            </button>
            <button onClick={() => setIsQrOpen(true)} className={styles.exportButton} title="QR asistencia">
              <FaQrcode /> QR
            </button>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className={styles.refreshButton}>
            <FaSync className={refreshing ? styles.spinning : ''} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {quarter && (
        <div className={styles.quarterBanner}>
          <FaCalendarAlt className={styles.quarterIcon} />
          <div className={styles.quarterInfo}>
            <strong>{quarter.name} {quarter.year}</strong>
            <span>{quarter.period}</span>
          </div>
        </div>
      )}

      <section className={styles.statsSection}>
        <DashboardKpis kpis={kpis} loading={loading} />
      </section>

      <section className={styles.pillarsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><FaHeart /> Salud Espiritual</h2>
        </div>
        <div className={styles.pillarsGrid}>
          {['comunion', 'relacionamiento', 'mision'].map((key) => {
            const p = pillars[key];
            if (!p) return null;
            return (
              <PillarGauge
                key={key}
                label={p.label}
                value={p.value}
                description={p.description}
                detail={p.activeDisciplePairs !== undefined
                  ? `${p.activeDisciplePairs} parejas · ${p.bibleStudentsInProgress} estudiantes`
                  : `${p.raw} de ${p.denominator}`}
                color={PILLAR_CONFIG[key].color}
              />
            );
          })}
        </div>
      </section>

      <section className={styles.goalsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><FaBullseye /> Metas Planificadas vs Alcanzadas</h2>
        </div>
        <GoalsComparisonChart goals={spiritual?.goals} loading={loading} />
      </section>

      <AttendanceQrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
