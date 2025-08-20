/**
 * Hook personalizado para el Dashboard
 * Maneja el estado y lógica del dashboard incluyendo métricas, gráficos y caché
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboard.Service';
import { showToast } from '@/utils/notifications';

export const useDashboard = () => {
  const { user, hasRole } = useAuth();

  // Estados de datos
  const [metrics, setMetrics] = useState(null);
  const [monthlyGrowth, setMonthlyGrowth] = useState(null);
  const [groupStats, setGroupStats] = useState(null);
  const [topLeaders, setTopLeaders] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [quarterlyMetrics, setQuarterlyMetrics] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [churchMetrics, setChurchMetrics] = useState(null);
  const [conversionMetrics, setConversionMetrics] = useState(null);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [goalsProgress, setGoalsProgress] = useState(null);
  const [dashboardConfig, setDashboardConfig] = useState(null);

  // Estados de loading
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Errores
  const [error, setError] = useState(null);

  // Cache
  const cacheRef = useRef({});
  const lastFetchRef = useRef({});

  // Verificar si cache es válido
  const isCacheValid = useCallback((key, ttl = 5 * 60 * 1000) => {
    const lastFetch = lastFetchRef.current[key];
    return lastFetch && Date.now() - lastFetch < ttl;
  }, []);

  // Limpiar cache
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    lastFetchRef.current = {};
  }, []);

  // ======================
  // FUNCIONES DE CARGA
  // ======================

  // Métricas principales
  const loadMetrics = useCallback(async (forceRefresh = false) => {
    const cacheKey = `metrics_${user?.id}`;
    if (!forceRefresh && isCacheValid(cacheKey)) {
      setMetrics(cacheRef.current[cacheKey]);
      return;
    }

    try {
      setIsLoadingMetrics(true);
      const data = await dashboardService.getMetrics();
      setMetrics(data);
      cacheRef.current[cacheKey] = data;
      lastFetchRef.current[cacheKey] = Date.now();
      setError(null);
    } catch (err) {
      setError('Error al cargar métricas principales');
      showToast('Error al cargar métricas principales', 'error');
      console.error('Error loading metrics:', err);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [user, isCacheValid]);

  // Datos de gráficos
  const loadChartData = useCallback(async (forceRefresh = false) => {
    const cacheKey = `charts_${user?.id}`;
    if (!forceRefresh && isCacheValid(cacheKey, 10 * 60 * 1000)) {
      const {
        monthlyGrowth,
        groupStats,
        quarterlyMetrics,
        studentProgress,
        conversionMetrics
      } = cacheRef.current[cacheKey] || {};
      setMonthlyGrowth(monthlyGrowth || null);
      setGroupStats(groupStats || null);
      setQuarterlyMetrics(quarterlyMetrics || null);
      setStudentProgress(studentProgress || null);
      setConversionMetrics(conversionMetrics || null);
      return;
    }

    try {
      setIsLoadingCharts(true);
      const [
        monthlyGrowthData,
        groupStatsData,
        quarterlyData,
        studentProgressData,
        conversionData
      ] = await Promise.allSettled([
        dashboardService.getMonthlyGrowth(),
        dashboardService.getGroupStats(),
        dashboardService.getQuarterlyMetrics(),
        dashboardService.getStudentProgress(),
        dashboardService.getConversionMetrics()
      ]);

      const cached = {};

      if (monthlyGrowthData.status === 'fulfilled') {
        setMonthlyGrowth(monthlyGrowthData.value);
        cached.monthlyGrowth = monthlyGrowthData.value;
      }

      if (groupStatsData.status === 'fulfilled') {
        setGroupStats(groupStatsData.value);
        cached.groupStats = groupStatsData.value;
      }

      if (quarterlyData.status === 'fulfilled') {
        setQuarterlyMetrics(quarterlyData.value);
        cached.quarterlyMetrics = quarterlyData.value;
      }

      if (studentProgressData.status === 'fulfilled') {
        setStudentProgress(studentProgressData.value);
        cached.studentProgress = studentProgressData.value;
      }

      if (conversionData.status === 'fulfilled') {
        setConversionMetrics(conversionData.value);
        cached.conversionMetrics = conversionData.value;
      }

      cacheRef.current[cacheKey] = cached;
      lastFetchRef.current[cacheKey] = Date.now();
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de gráficos');
      showToast('Error al cargar gráficos', 'error');
      console.error('Error loading chart data:', err);
    } finally {
      setIsLoadingCharts(false);
    }
  }, [user, isCacheValid]);

  // Actividad reciente y líderes
  const loadActivityData = useCallback(async (forceRefresh = false) => {
    const cacheKey = `activity_${user?.id}`;
    if (!forceRefresh && isCacheValid(cacheKey, 2 * 60 * 1000)) {
      const { topLeaders, recentActivity, systemAlerts, goalsProgress } = cacheRef.current[cacheKey] || {};
      setTopLeaders(topLeaders || []);
      setRecentActivity(recentActivity || []);
      setSystemAlerts(systemAlerts || []);
      setGoalsProgress(goalsProgress || null);
      return;
    }

    try {
      setIsLoadingActivity(true);
      const [
        topLeadersData,
        recentActivityData,
        alertsData,
        goalsData
      ] = await Promise.allSettled([
        dashboardService.getTopLeaders(),
        dashboardService.getRecentActivity(),
        dashboardService.getSystemAlerts(),
        dashboardService.getGoalsProgress()
      ]);

      const cached = {};

      if (topLeadersData.status === 'fulfilled') {
        setTopLeaders(topLeadersData.value);
        cached.topLeaders = topLeadersData.value;
      }

      if (recentActivityData.status === 'fulfilled') {
        setRecentActivity(recentActivityData.value);
        cached.recentActivity = recentActivityData.value;
      }

      if (alertsData.status === 'fulfilled') {
        setSystemAlerts(alertsData.value);
        cached.systemAlerts = alertsData.value;
      }

      if (goalsData.status === 'fulfilled') {
        setGoalsProgress(goalsData.value);
        cached.goalsProgress = goalsData.value;
      }

      cacheRef.current[cacheKey] = cached;
      lastFetchRef.current[cacheKey] = Date.now();
      setError(null);
    } catch (err) {
      setError('Error al cargar datos de actividad');
      showToast('Error al cargar actividad reciente', 'error');
      console.error('Error loading activity data:', err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [user, isCacheValid]);

  // Métricas de iglesia
  const loadChurchMetrics = useCallback(async (forceRefresh = false) => {
    if (!hasRole('Director')) return;

    const cacheKey = `church_${user?.id}`;
    if (!forceRefresh && isCacheValid(cacheKey)) {
      setChurchMetrics(cacheRef.current[cacheKey]);
      return;
    }

    try {
      const data = await dashboardService.getChurchMetrics();
      setChurchMetrics(data);
      cacheRef.current[cacheKey] = data;
      lastFetchRef.current[cacheKey] = Date.now();
    } catch (err) {
      console.error('Error loading church metrics:', err);
      showToast('Error al cargar métricas de iglesia', 'error');
    }
  }, [user, hasRole, isCacheValid]);

  // Configuración
  const loadDashboardConfig = useCallback(async () => {
    try {
      const config = await dashboardService.getDashboardConfig();
      setDashboardConfig(config);
    } catch (err) {
      console.error('Error loading dashboard config:', err);
      setDashboardConfig({
        widgets: ['metrics', 'charts', 'activity'],
        theme: 'light',
        refreshInterval: 300000
      });
    }
  }, []);

  // ======================
  // FUNCIONES UTILITARIAS
  // ======================

  const refreshDashboard = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        loadMetrics(true),
        loadChartData(true),
        loadActivityData(true),
        loadChurchMetrics(true)
      ]);
      showToast('Dashboard actualizado correctamente', 'success');
    } catch (err) {
      showToast('Error al refrescar dashboard', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }, [loadMetrics, loadChartData, loadActivityData, loadChurchMetrics]);

  const exportReport = useCallback(async (format = 'pdf', filters = {}) => {
    setIsExporting(true);
    try {
      const blob = await dashboardService.exportDashboardReport(format, filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast(`Reporte ${format.toUpperCase()} descargado exitosamente`, 'success');
    } catch (err) {
      showToast('Error al exportar reporte', 'error');
      console.error('Error exporting report:', err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const updateConfig = useCallback(async (newConfig) => {
    try {
      const updatedConfig = await dashboardService.updateDashboardConfig(newConfig);
      setDashboardConfig(updatedConfig);
      showToast('Configuración actualizada', 'success');
    } catch (err) {
      showToast('Error al actualizar configuración', 'error');
      console.error('Error updating config:', err);
    }
  }, []);

  // ======================
  // EFECTOS
  // ======================

  useEffect(() => {
    if (user) {
      loadMetrics();
      loadChartData();
      loadActivityData();
      loadChurchMetrics();
      loadDashboardConfig();
    }
  }, [user, loadMetrics, loadChartData, loadActivityData, loadChurchMetrics, loadDashboardConfig]);

  useEffect(() => {
    if (!dashboardConfig?.refreshInterval) return;
    const interval = setInterval(() => {
      refreshDashboard();
    }, dashboardConfig.refreshInterval);
    return () => clearInterval(interval);
  }, [dashboardConfig?.refreshInterval, refreshDashboard]);

  // ======================
  // RETORNO DEL HOOK
  // ======================

  return {
    // Datos
    metrics,
    monthlyGrowth,
    groupStats,
    topLeaders,
    recentActivity,
    quarterlyMetrics,
    studentProgress,
    churchMetrics,
    conversionMetrics,
    systemAlerts,
    goalsProgress,
    dashboardConfig,

    // Loading
    isLoadingMetrics,
    isLoadingCharts,
    isLoadingActivity,
    isExporting,
    isRefreshing,

    // Error
    error,

    // Funciones principales
    refreshDashboard,
    exportReport,
    updateConfig,
    clearCache,

    // Funciones individuales
    loadMetrics,
    loadChartData,
    loadActivityData,
    loadChurchMetrics
  };
};
