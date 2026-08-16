/**
 * Servicio para el Dashboard
 * Maneja las peticiones de métricas y estadísticas del dashboard
 */

import apiClient from './apiClient';

export const dashboardService = {
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
};
