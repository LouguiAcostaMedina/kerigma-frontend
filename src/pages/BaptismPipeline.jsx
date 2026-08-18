import { useState, useEffect, useCallback } from 'react';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaFunnelDollar, FaWater, FaUserCheck, FaGraduationCap, FaBookOpen } from 'react-icons/fa';
import styles from './BaptismPipeline.module.css';

const STAGES = [
  { key: 'studying', label: 'Estudiando', color: 'var(--color-warning)' },
  { key: 'candidate', label: 'Candidatos', color: 'var(--color-info)' },
  { key: 'baptized', label: 'Bautizados', color: 'var(--color-success)' },
  { key: 'fullMember', label: 'Miembros Activos', color: 'var(--color-accent)' },
];

const BaptismPipeline = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    studying: 0, candidate: 0, baptized: 0, fullMember: 0,
    totalStudents: 0, avgDaysInStage: 0, conversionRate: 0,
    recentGraduations: [], lessonsCompleted: 0, lessonsTotal: 0,
  });

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/baptism-pipeline/stats');
      const data = await res.json();
      setStats(prev => ({ ...prev, ...(data || {}) }));
    } catch {
      showToast('Error al cargar estadísticas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const total = stats.studying + stats.candidate + stats.baptized + stats.fullMember;
  const maxStage = Math.max(stats.studying, stats.candidate, stats.baptized, stats.fullMember, 1);

  if (loading) return <Loading message="Cargando pipeline de bautismos..." />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><FaWater className={styles.titleIcon} /> Pipeline de Bautismos</h1>
        <p className={styles.subtitle}>Dashboard de métricas del proceso de bautismo</p>
      </div>

      <div className={styles.statsGrid}>
        {STAGES.map(s => (
          <div key={s.key} className={styles.statCard} style={{ borderTopColor: s.color }}>
            <div className={styles.statIcon} style={{ color: s.color }}>
              {s.key === 'studying' && <FaBookOpen />}
              {s.key === 'candidate' && <FaFunnelDollar />}
              {s.key === 'baptized' && <FaWater />}
              {s.key === 'fullMember' && <FaUserCheck />}
            </div>
            <div className={styles.statValue}>{stats[s.key] || 0}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{total}</div>
          <div className={styles.metricLabel}>Total en Pipeline</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{stats.conversionRate || 0}%</div>
          <div className={styles.metricLabel}>Tasa de Conversión</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{stats.avgDaysInStage || 0}</div>
          <div className={styles.metricLabel}>Días Promedio por Etapa</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricValue}>{stats.lessonsCompleted || 0}/{stats.lessonsTotal || 0}</div>
          <div className={styles.metricLabel}>Lecciones Completadas</div>
        </div>
      </div>

      <div className={styles.funnelSection}>
        <h2 className={styles.sectionTitle}><FaFunnelDollar /> Embudo de Conversión</h2>
        <div className={styles.funnel}>
          {STAGES.map(s => {
            const count = stats[s.key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const barWidth = maxStage > 0 ? (count / maxStage) * 100 : 0;
            return (
              <div key={s.key} className={styles.funnelRow}>
                <div className={styles.funnelLabel}>{s.label}</div>
                <div className={styles.funnelBarTrack}>
                  <div className={styles.funnelBar} style={{ width: `${barWidth}%`, background: s.color }} />
                </div>
                <div className={styles.funnelValue}>{count} <span className={styles.funnelPct}>({pct}%)</span></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}><FaGraduationCap /> Graduaciones Recientes</h2>
        {(!stats.recentGraduations || stats.recentGraduations.length === 0) ? (
          <p className={styles.emptyMsg}>No hay graduaciones recientes</p>
        ) : (
          <div className={styles.graduationList}>
            {stats.recentGraduations.map((g, i) => (
              <div key={g.id || i} className={styles.graduationItem}>
                <div className={styles.gradName}>{g.name || g.studentName}</div>
                <div className={styles.gradDate}>{g.graduationDate ? new Date(g.graduationDate).toLocaleDateString() : '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}><FaBookOpen /> Completación de Lecciones</h2>
        <div className={styles.lessonProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill}
              style={{ width: `${stats.lessonsTotal > 0 ? (stats.lessonsCompleted / stats.lessonsTotal) * 100 : 0}%` }} />
          </div>
          <span className={styles.progressText}>
            {stats.lessonsTotal > 0 ? Math.round((stats.lessonsCompleted / stats.lessonsTotal) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default BaptismPipeline;
