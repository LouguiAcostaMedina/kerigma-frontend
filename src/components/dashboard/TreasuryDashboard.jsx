/**
 * Dashboard Tesorero — Tesorero
 * KPIs financieros, tendencia mensual, distribución por categoría
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { financialService } from '@/services/financialService';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaHandHoldingHeart, FaSync, FaCalendarAlt, FaChartBar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import styles from './TreasuryDashboard.module.css';

const CATEGORY_LABELS = {
  diezmo: 'Diezmos',
  ofrenda_misionera: 'Ofrendas Misioneras',
  escuela_sabatica: 'Escuela Sabática',
  proyectos_especiales: 'Proyectos Especiales',
  otros: 'Otros',
};

const CATEGORY_COLORS = {
  diezmo: '#22c55e',
  ofrenda_misionera: '#3b82f6',
  escuela_sabatica: '#f59e0b',
  proyectos_especiales: '#8b5cf6',
  otros: '#6b7280',
};

const TreasuryDashboard = () => {
  const { user } = useAuth();
  const [categorySummary, setCategorySummary] = useState([]);
  const [periodSummary, setPeriodSummary] = useState([]);
  const [recentContributions, setRecentContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    try {
      const [catData, periodData, recentData] = await Promise.all([
        financialService.getSummaryByCategory(),
        financialService.getSummaryByPeriod(),
        financialService.getContributions({ limit: 5 }),
      ]);
      setCategorySummary(catData || []);
      setPeriodSummary(periodData || []);
      setRecentContributions(recentData?.data || []);
      return true;
    } catch (error) {
      console.error('Error loading treasury dashboard:', error);
      showToast('Error al cargar datos financieros', 'error');
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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);

  const totalAmount = categorySummary.reduce((sum, s) => sum + s.total, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthTotal = categorySummary.reduce((sum, s) => sum + (s.currentMonthTotal || 0), 0);
  const prevMonthTotal = categorySummary.reduce((sum, s) => sum + (s.prevMonthTotal || 0), 0);
  const trendPercent = prevMonthTotal > 0 ? ((currentMonthTotal - prevMonthTotal) / prevMonthTotal * 100) : 0;
  const trendUp = trendPercent >= 0;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
        <p>Cargando panel financiero...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <FaHandHoldingHeart className={styles.titleIcon} />
            Panel Financiero
          </h1>
          <p className={styles.subtitle}>
            Hola, {user?.nombre || user?.firstName || 'Tesorero'} — Resumen de diezmos y ofrendas
          </p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className={styles.refreshButton}>
          <FaSync className={refreshing ? styles.spinning : ''} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* KPIs financieros */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{formatCurrency(totalAmount)}</div>
          <div className={styles.kpiLabel}>Total acumulado</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{formatCurrency(currentMonthTotal)}</div>
          <div className={styles.kpiLabel}>Mes actual ({currentMonth})</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiValue} ${trendUp ? styles.trendUp : styles.trendDown}`}>
            {trendUp ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(trendPercent).toFixed(1)}%
          </div>
          <div className={styles.kpiLabel}>Variación mensual</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiValue}>{categorySummary.reduce((sum, s) => sum + s.count, 0)}</div>
          <div className={styles.kpiLabel}>Total registros</div>
        </div>
      </div>

      {/* Distribución por categoría */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><FaChartBar /> Distribución por Categoría</h2>
        <div className={styles.categoryGrid}>
          {categorySummary.map((item) => {
            const pct = totalAmount > 0 ? (item.total / totalAmount * 100) : 0;
            return (
              <div key={item.category} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryName}>{CATEGORY_LABELS[item.category] || item.category}</span>
                  <span className={styles.categoryAmount}>{formatCurrency(item.total)}</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[item.category] || '#6b7280' }}
                  />
                </div>
                <div className={styles.categoryFooter}>
                  <span>{item.count} registros</span>
                  <span>{pct.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tendencia por período */}
      {periodSummary.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}><FaCalendarAlt /> Tendencia Mensual</h2>
          <div className={styles.periodGrid}>
            {periodSummary.slice(0, 6).map((item) => (
              <div key={item.period} className={styles.periodCard}>
                <div className={styles.periodName}>{item.period}</div>
                <div className={styles.periodTotal}>{formatCurrency(item.total)}</div>
                <div className={styles.periodBar}>
                  <div
                    className={styles.periodBarFill}
                    style={{ width: `${Math.min(100, (item.total / (periodSummary[0]?.total || 1)) * 100)}%` }}
                  />
                </div>
                <div className={styles.periodCount}>{item.count} contribuciones</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Últimas contribuciones */}
      {recentContributions.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Últimas Contribuciones</h2>
          <div className={styles.recentTable}>
            <div className={styles.recentRow}>
              <span className={styles.recentHeader}>Fecha</span>
              <span className={styles.recentHeader}>Miembro</span>
              <span className={styles.recentHeader}>Categoría</span>
              <span className={styles.recentHeader}>Monto</span>
            </div>
            {recentContributions.map((c) => (
              <div key={c.id} className={styles.recentRow}>
                <span>{new Date(c.createdAt).toLocaleDateString('es-PE')}</span>
                <span>{c.memberName}</span>
                <span className={styles.categoryBadge} style={{ backgroundColor: `${CATEGORY_COLORS[c.category]}20`, color: CATEGORY_COLORS[c.category] }}>
                  {CATEGORY_LABELS[c.category] || c.category}
                </span>
                <span className={styles.amountCell}>{formatCurrency(c.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TreasuryDashboard;
