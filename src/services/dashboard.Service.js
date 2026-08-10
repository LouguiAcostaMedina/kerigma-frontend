/**
 * Servicio para el Dashboard
 * Maneja todas las peticiones relacionadas con métricas y estadísticas del dashboard
 */

import apiClient from './apiClient';

export const dashboardService = {
  // Obtener métricas generales del dashboard
  getMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },

  // Salud espiritual del trimestre (pilares) - Sprint 3
  getSpiritualHealth: async () => {
    try {
      const response = await apiClient.get('/dashboard/spiritual-health');
      return response?.data ?? null;
    } catch (error) {
      console.error('Error fetching spiritual health:', error);
      throw error;
    }
  },

  // KPIs principales del dashboard - Sprint 3
  getDashboardKpis: async () => {
    try {
      const response = await apiClient.get('/dashboard/kpis');
      return response?.data ?? null;
    } catch (error) {
      console.error('Error fetching dashboard KPIs:', error);
      throw error;
    }
  },


  
  // Obtener datos para gráficos de crecimiento mensual
  getMonthlyGrowth: async (year = new Date().getFullYear()) => {
    try {
      const response = await apiClient.get(`/dashboard/monthly-growth?year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly growth:', error);
      throw error;
    }
  },

  // Obtener estadísticas por grupos
  getGroupStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/group-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching group stats:', error);
      throw error;
    }
  },

  // Obtener top líderes por performance
  getTopLeaders: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/dashboard/top-leaders?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top leaders:', error);
      throw error;
    }
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit = 20) => {
    try {
      const response = await apiClient.get(`/dashboard/recent-activity?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  // Obtener métricas trimestrales
  getQuarterlyMetrics: async (year = new Date().getFullYear()) => {
    try {
      const response = await apiClient.get(`/dashboard/quarterly-metrics?year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quarterly metrics:', error);
      throw error;
    }
  },

  // Obtener progreso de estudiantes bíblicos
  getStudentProgress: async () => {
    try {
      const response = await apiClient.get('/dashboard/student-progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching student progress:', error);
      throw error;
    }
  },

  // Obtener métricas por iglesia (para Directores y Administradores)
  getChurchMetrics: async (churchId = null) => {
    try {
      const endpoint = churchId 
        ? `/dashboard/church-metrics/${churchId}` 
        : '/dashboard/church-metrics';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching church metrics:', error);
      throw error;
    }
  },

  // Obtener comparativa de meses anteriores
  getMonthComparison: async (months = 6) => {
    try {
      const response = await apiClient.get(`/dashboard/month-comparison?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching month comparison:', error);
      throw error;
    }
  },

  // Obtener métricas de conversiones
  getConversionMetrics: async () => {
    try {
      const response = await apiClient.get('/dashboard/conversion-metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
      throw error;
    }
  },

  // Obtener resumen ejecutivo (para roles superiores)
  getExecutiveSummary: async () => {
    try {
      const response = await apiClient.get('/dashboard/executive-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching executive summary:', error);
      throw error;
    }
  },

  // Obtener alertas y notificaciones del sistema
  getSystemAlerts: async () => {
    try {
      const response = await apiClient.get('/dashboard/system-alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  },

  // Obtener objetivos y metas
  getGoalsProgress: async () => {
    try {
      const response = await apiClient.get('/dashboard/goals-progress');
      return response.data;
    } catch (error) {
      console.error('Error fetching goals progress:', error);
      throw error;
    }
  },

  // Exportar reporte del dashboard
  exportDashboardReport: async (format = 'pdf', filters = {}) => {
    try {
      const response = await apiClient.post('/dashboard/export-report', {
        format,
        filters
      }, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting dashboard report:', error);
      throw error;
    }
  },

  // Actualizar configuración del dashboard del usuario
  updateDashboardConfig: async (config) => {
    try {
      const response = await apiClient.put('/dashboard/config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating dashboard config:', error);
      throw error;
    }
  },

  // Obtener configuración del dashboard del usuario
  getDashboardConfig: async () => {
    try {
      const response = await apiClient.get('/dashboard/config');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard config:', error);
      throw error;
    }
  }
};
