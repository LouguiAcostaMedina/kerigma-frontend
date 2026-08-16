/**
 * Servicio para la gestión de reportes avanzados del sistema misionero
 * Maneja la generación, configuración y exportación de reportes personalizados
 */

import { apiClient } from './apiClient';

const unwrap = (envelope) => envelope?.data ?? envelope;

export const reportsService = {
  // ===================== REPORTES PREDEFINIDOS =====================
  
  /**
   * Obtener lista de reportes predefinidos disponibles
   */
  getPredefinedReports: async () => {
    try {
      const response = await apiClient.get('/reports/predefined');
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching predefined reports:', error);
      throw error;
    }
  },

  /**
   * Ejecutar un reporte predefinido con parámetros
   */
  executePredefinedReport: async (reportId, params = {}) => {
    try {
      const response = await apiClient.post(`/reports/predefined/${reportId}/execute`, params);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error executing predefined report:', error);
      throw error;
    }
  },

  // ===================== REPORTES PERSONALIZADOS =====================

  /**
   * Obtener reportes personalizados del usuario
   */
  getCustomReports: async (params = {}, signal) => {
    try {
      const response = await apiClient.get('/reports/custom', { params, signal });
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError' || error.message?.includes('cancelada')) return;
      console.error('Error fetching custom reports:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo reporte personalizado
   */
  createCustomReport: async (reportData) => {
    try {
      const response = await apiClient.post('/reports/custom', reportData);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error creating custom report:', error);
      throw error;
    }
  },

  /**
   * Actualizar reporte personalizado existente
   */
  updateCustomReport: async (id, reportData) => {
    try {
      const response = await apiClient.put(`/reports/custom/${id}`, reportData);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error updating custom report:', error);
      throw error;
    }
  },

  /**
   * Eliminar reporte personalizado
   */
  deleteCustomReport: async (id) => {
    try {
      const response = await apiClient.delete(`/reports/custom/${id}`);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error deleting custom report:', error);
      throw error;
    }
  },

  /**
   * Ejecutar reporte personalizado
   */
  executeCustomReport: async (id, params = {}) => {
    try {
      const response = await apiClient.post(`/reports/custom/${id}/execute`, params);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error executing custom report:', error);
      throw error;
    }
  },

  // ===================== CONSTRUCTOR DE REPORTES =====================

  /**
   * Obtener campos disponibles para reportes
   */
  getAvailableFields: async (entity) => {
    try {
      const response = await apiClient.get(`/reports/fields/${entity}`);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching available fields:', error);
      throw error;
    }
  },

  /**
   * Obtener funciones de agregación disponibles
   */
  getAggregationFunctions: async () => {
    try {
      const response = await apiClient.get('/reports/aggregations');
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching aggregation functions:', error);
      throw error;
    }
  },

  /**
   * Previsualizar reporte antes de guardarlo
   */
  previewReport: async (reportConfig) => {
    try {
      const response = await apiClient.post('/reports/preview', reportConfig);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error previewing report:', error);
      throw error;
    }
  },

  // ===================== REPORTES DE MÉTRICAS =====================

  /**
   * Obtener reporte de crecimiento de membresía
   */
  getMembershipGrowthReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/reports/metrics/membership-growth', { params });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching membership growth report:', error);
      throw error;
    }
  },

  /**
   * Obtener reporte de actividad de grupos
   */
  getGroupActivityReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/reports/metrics/group-activity', { params });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching group activity report:', error);
      throw error;
    }
  },

  /**
   * Obtener reporte de progreso de estudiantes bíblicos
   */
  getBibleStudentProgressReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/reports/metrics/bible-student-progress', { params });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching bible student progress report:', error);
      throw error;
    }
  },

  // ===================== EXPORTACIÓN DE REPORTES =====================

  /**
   * Exportar reporte a Excel
   */
  exportReportToExcel: async (reportId, reportType = 'custom', params = {}) => {
    try {
      const response = await apiClient.post(
        `/reports/${reportType}/${reportId}/export/excel`, 
        params,
        { 
          responseType: 'blob',
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting report to Excel:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte a PDF
   */
  exportReportToPDF: async (reportId, reportType = 'custom', params = {}) => {
    try {
      const response = await apiClient.post(
        `/reports/${reportType}/${reportId}/export/pdf`, 
        params,
        { 
          responseType: 'blob',
          headers: {
            'Accept': 'application/pdf'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting report to PDF:', error);
      throw error;
    }
  },

  /**
   * Exportar gráfico como imagen
   */
  exportChartAsImage: async (chartConfig, format = 'png') => {
    try {
      const response = await apiClient.post(
        '/reports/export/chart',
        { ...chartConfig, format },
        { 
          responseType: 'blob',
          headers: {
            'Accept': `image/${format}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error exporting chart as image:', error);
      throw error;
    }
  },

  // ===================== PROGRAMACIÓN DE REPORTES =====================

  /**
   * Programar reporte automático
   */
  scheduleReport: async (reportId, scheduleConfig) => {
    try {
      const response = await apiClient.post(`/reports/schedule`, {
        reportId,
        ...scheduleConfig
      });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  },

  /**
   * Obtener reportes programados
   */
  getScheduledReports: async () => {
    try {
      const response = await apiClient.get('/reports/scheduled');
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      throw error;
    }
  },

  /**
   * Cancelar reporte programado
   */
  cancelScheduledReport: async (scheduleId) => {
    try {
      const response = await apiClient.delete(`/reports/scheduled/${scheduleId}`);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error canceling scheduled report:', error);
      throw error;
    }
  },

  // ===================== PLANTILLAS DE REPORTES =====================

  /**
   * Obtener plantillas de reportes disponibles
   */
  getReportTemplates: async (category = null) => {
    try {
      const params = category ? { category } : {};
      const response = await apiClient.get('/reports/templates', { params });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching report templates:', error);
      throw error;
    }
  },

  /**
   * Crear reporte desde plantilla
   */
  createReportFromTemplate: async (templateId, customizations = {}) => {
    try {
      const response = await apiClient.post(`/reports/templates/${templateId}/create`, customizations);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error creating report from template:', error);
      throw error;
    }
  },

  // ===================== ESTADÍSTICAS DE REPORTES =====================

  /**
   * Obtener estadísticas de uso de reportes
   */
  getReportUsageStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/reports/stats/usage', { params });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching report usage stats:', error);
      throw error;
    }
  },

  /**
   * Obtener reportes más populares
   */
  getPopularReports: async (limit = 10) => {
    try {
      const response = await apiClient.get('/reports/stats/popular', { 
        params: { limit } 
      });
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching popular reports:', error);
      throw error;
    }
  },

  /**
   * Compartir reporte con otros usuarios
   */
  shareReport: async (reportId, shareConfig) => {
    try {
      const response = await apiClient.post(`/reports/custom/${reportId}/share`, shareConfig);
      return unwrap(response.data);
    } catch (error) {
      console.error('Error sharing report:', error);
      throw error;
    }
  },

  /**
   * Obtener reportes compartidos conmigo
   */
  getSharedReports: async () => {
    try {
      const response = await apiClient.get('/reports/shared');
      return unwrap(response.data);
    } catch (error) {
      console.error('Error fetching shared reports:', error);
      throw error;
    }
  }
};