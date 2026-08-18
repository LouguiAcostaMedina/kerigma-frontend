/**
 * Dashboard Pastoral — Director
 * Asistencia semanal, crecimiento de miembros, bautismos, pilares espirituales
 */

import { useCallback, useEffect, useState } from 'react';
import { dashboardService } from '@/services/dashboard.Service';
import PillarGauge from './PillarGauge';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaSync, FaUsers, FaChurch, FaBookOpen, FaHeart, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './PastoralDashboard.module.css';

const PILLAR_CONFIG = {
  comunion: { color: '#e2a63f' },
  relacionamiento: { color: '#34d399' },
  mision: { color: '#60a5fa' },
};

const PastoralDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [spiritual, setSpiritual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      console.error('Error loading pastoral dashboard:', error);
      showToast('Error al cargar datos pastorales', 'error');
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

  const pillars = spiritual?.pillars || {};

  if (loading && !kpis) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <p>Cargando panel pastoral...</p>
      </div>
    );
  }

  const attendanceTrend = kpis?.attendanceTrend;
  const growthRate = kpis?.growthRate;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{getGreeting()}, Director</h1>
          <p className={styles.subtitle}>
            Vista pastoral — {new Intl.DateTimeFormat('es-ES', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            }).format(new Date())}
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className={styles.refreshButton}>
          <FaSync className={refreshing ? styles.spinning : ''} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* KPIs pastorales */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <FaUsers className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.totalMembers || 0}</div>
          <div className={styles.kpiLabel}>Miembros totales</div>
          {growthRate !== undefined && (
            <div className={`${styles.kpiTrend} ${growthRate >= 0 ? styles.trendUp : styles.trendDown}`}>
              {growthRate >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(growthRate).toFixed(1)}%
            </div>
          )}
        </div>
        <div className={styles.kpiCard}>
          <FaChurch className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.totalChurches || 0}</div>
          <div className={styles.kpiLabel}>Iglesias bajo supervisión</div>
        </div>
        <div className={styles.kpiCard}>
          <FaBookOpen className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.avgAttendance || 0}</div>
          <div className={styles.kpiLabel}>Asistencia promedio</div>
          {attendanceTrend !== undefined && (
            <div className={`${styles.kpiTrend} ${attendanceTrend >= 0 ? styles.trendUp : styles.trendDown}`}>
              {attendanceTrend >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(attendanceTrend).toFixed(1)}%
            </div>
          )}
        </div>
        <div className={styles.kpiCard}>
          <FaHeart className={styles.kpiIcon} />
          <div className={styles.kpiValue}>{kpis?.activeRate || 0}%</div>
          <div className={styles.kpiLabel}>Tasa de miembros activos</div>
        </div>
      </div>

      {/* Pilares espirituales */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}><FaHeart /> Pilares Espirituales</h2>
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

      {/* Resumen de bautismos y nuevos miembros */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Crecimiento</h2>
        </div>
        <div className={styles.growthGrid}>
          <div className={styles.growthCard}>
            <div className={styles.growthValue}>{kpis?.baptismsYTD || 0}</div>
            <div className={styles.growthLabel}>Bautismos este año</div>
          </div>
          <div className={styles.growthCard}>
            <div className={styles.growthValue}>{kpis?.newMembersYTD || 0}</div>
            <div className={styles.growthLabel}>Nuevos miembros este año</div>
          </div>
          <div className={styles.growthCard}>
            <div className={styles.growthValue}>{kpis?.transfersYTD || 0}</div>
            <div className={styles.growthLabel}>Transferencias este año</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PastoralDashboard;
