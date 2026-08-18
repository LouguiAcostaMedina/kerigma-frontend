/**
 * Dashboard Secretaría — Leader / Reader / roles de consulta
 * Miembros por estado, grupos activos, asistencia promedio
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard.Service';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaSync, FaUsers, FaUserCheck, FaUserTimes, FaUserClock, FaLayerGroup } from 'react-icons/fa';
import styles from './SecretaryDashboard.module.css';

const STATUS_CONFIG = {
  activo: { color: '#22c55e', icon: FaUserCheck, label: 'Activos' },
  inactivo: { color: '#ef4444', icon: FaUserTimes, label: 'Inactivos' },
  suspendido: { color: '#f59e0b', icon: FaUserClock, label: 'Suspendidos' },
};

const SecretaryDashboard = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    try {
      const kpisData = await dashboardService.getDashboardKpis();
      setKpis(kpisData);
      return true;
    } catch (error) {
      console.error('Error loading secretary dashboard:', error);
      showToast('Error al cargar datos', 'error');
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

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  if (loading && !kpis) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  const membersByStatus = kpis?.membersByStatus || {};

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{getGreeting()}, {user?.nombre || 'Usuario'}</h1>
          <p className={styles.subtitle}>
            {user?.role === 'leader' ? 'Vista de liderazgo' : 'Vista de consulta'} — {new Intl.DateTimeFormat('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }).format(new Date())}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className={styles.refreshButton}>
          <FaSync className={refreshing ? styles.spinning : ''} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* KPIs principales */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <FaUsers className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.totalMembers || 0}</div>
          <div className={styles.kpiLabel}>Miembros totales</div>
        </div>
        <div className={styles.kpiCard}>
          <FaLayerGroup className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.totalGroups || 0}</div>
          <div className={styles.kpiLabel}>Grupos activos</div>
        </div>
        <div className={styles.kpiCard}>
          <FaUserCheck className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.avgAttendance || 0}</div>
          <div className={styles.kpiLabel}>Asistencia promedio</div>
        </div>
      </div>

      {/* Miembros por estado */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Miembros por Estado</h2>
        <div className={styles.statusGrid}>
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = membersByStatus[key] || 0;
            const total = kpis?.totalMembers || 1;
            const pct = (count / total * 100).toFixed(1);
            const Icon = cfg.icon;
            return (
              <div key={key} className={styles.statusCard}>
                <div className={styles.statusIcon} style={{ color: cfg.color }}>
                  <Icon />
                </div>
                <div className={styles.statusValue}>{count}</div>
                <div className={styles.statusLabel}>{cfg.label}</div>
                <div className={styles.statusPercent}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resumen rápido */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resumen Rápido</h2>
        <div className={styles.quickGrid}>
          <div className={styles.quickCard}>
            <div className={styles.quickLabel}>Tasa de actividad</div>
            <div className={styles.quickValue}>{kpis?.activeRate || 0}%</div>
          </div>
          <div className={styles.quickCard}>
            <div className={styles.quickLabel}>Iglesias</div>
            <div className={styles.quickValue}>{kpis?.totalChurches || 0}</div>
          </div>
          <div className={styles.quickCard}>
            <div className={styles.quickLabel}>Grupos</div>
            <div className={styles.quickValue}>{kpis?.totalGroups || 0}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SecretaryDashboard;
