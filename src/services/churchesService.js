/**
 * Servicio para la gestión de iglesias del sistema misionero
 * Maneja operaciones CRUD, estadísticas y configuraciones de iglesias
 */

import { apiClient } from './apiClient';

export const churchesService = {
  // ===================== OPERACIONES CRUD BÁSICAS =====================
  
  /**
   * Obtener lista de iglesias con filtros y paginación
   */
  getChurches: async (params = {}) => {
    try {
      const response = await apiClient.get('/churches', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching churches:', error);
      throw error;
    }
  },

  /**
   * Obtener una iglesia específica por ID
   */
  getChurchById: async (id) => {
    try {
      const response = await apiClient.get(`/churches/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching church:', error);
      throw error;
    }
  },

  /**
   * Crear nueva iglesia
   */
  createChurch: async (churchData) => {
    try {
      const response = await apiClient.post('/churches', churchData);
      return response.data;
    } catch (error) {
      console.error('Error creating church:', error);
      throw error;
    }
  },

  /**
   * Actualizar iglesia existente
   */
  updateChurch: async (id, churchData) => {
    try {
      const response = await apiClient.put(`/churches/${id}`, churchData);
      return response.data;
    } catch (error) {
      console.error('Error updating church:', error);
      throw error;
    }
  },

  /**
   * Eliminar iglesia
   */
  deleteChurch: async (id) => {
    try {
      const response = await apiClient.delete(`/churches/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting church:', error);
      throw error;
    }
  },

  /**
   * Eliminar múltiples iglesias
   */
  deleteMultipleChurches: async (ids) => {
    try {
      const response = await apiClient.delete('/churches/bulk', {
        data: { ids }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple churches:', error);
      throw error;
    }
  },

  // ===================== GESTIÓN DE ESTADOS =====================

  /**
   * Activar iglesia
   */
  activateChurch: async (id) => {
    try {
      const response = await apiClient.patch(`/churches/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating church:', error);
      throw error;
    }
  },

  /**
   * Desactivar iglesia
   */
  deactivateChurch: async (id) => {
    try {
      const response = await apiClient.patch(`/churches/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating church:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de iglesia
   */
  updateChurchStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/churches/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating church status:', error);
      throw error;
    }
  },

  // ===================== LIDERAZGO Y PERSONAL =====================

  /**
   * Obtener líderes de una iglesia
   */
  getChurchLeaders: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/leaders`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church leaders:', error);
      throw error;
    }
  },

  /**
   * Asignar líder a iglesia
   */
  assignLeaderToChurch: async (churchId, leaderData) => {
    try {
      const response = await apiClient.post(`/churches/${churchId}/leaders`, leaderData);
      return response.data;
    } catch (error) {
      console.error('Error assigning leader to church:', error);
      throw error;
    }
  },

  /**
   * Remover líder de iglesia
   */
  removeLeaderFromChurch: async (churchId, leaderId) => {
    try {
      const response = await apiClient.delete(`/churches/${churchId}/leaders/${leaderId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing leader from church:', error);
      throw error;
    }
  },

  /**
   * Actualizar rol de líder en iglesia
   */
  updateLeaderRole: async (churchId, leaderId, roleData) => {
    try {
      const response = await apiClient.put(`/churches/${churchId}/leaders/${leaderId}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating leader role:', error);
      throw error;
    }
  },

  /**
   * Obtener pastor principal de una iglesia
   */
  getChurchPastor: async (churchId) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/pastor`);
      return response.data;
    } catch (error) {
      console.error('Error fetching church pastor:', error);
      throw error;
    }
  },

  /**
   * Asignar pastor principal
   */
  assignPastor: async (churchId, pastorId) => {
    try {
      const response = await apiClient.post(`/churches/${churchId}/pastor`, { pastorId });
      return response.data;
    } catch (error) {
      console.error('Error assigning pastor:', error);
      throw error;
    }
  },

  // ===================== MIEMBROS Y GRUPOS =====================

  /**
   * Obtener miembros de una iglesia
   */
  getChurchMembers: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/members`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church members:', error);
      throw error;
    }
  },

  /**
   * Obtener grupos de una iglesia
   */
  getChurchGroups: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/groups`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church groups:', error);
      throw error;
    }
  },

  /**
   * Obtener estudiantes bíblicos de una iglesia
   */
  getChurchStudents: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/students`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church students:', error);
      throw error;
    }
  },

  /**
   * Transferir miembro entre iglesias
   */
  transferMember: async (memberId, fromChurchId, toChurchId, transferData) => {
    try {
      const response = await apiClient.post('/churches/transfer-member', {
        memberId,
        fromChurchId,
        toChurchId,
        ...transferData
      });
      return response.data;
    } catch (error) {
      console.error('Error transferring member:', error);
      throw error;
    }
  },

  // ===================== ESTADÍSTICAS E INFORMES =====================

  /**
   * Obtener estadísticas generales de una iglesia
   */
  getChurchStatistics: async (churchId, period = 'month') => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/statistics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching church statistics:', error);
      throw error;
    }
  },

  /**
   * Obtener métricas de crecimiento de una iglesia
   */
  getChurchGrowthMetrics: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/growth-metrics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church growth metrics:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de asistencia de una iglesia
   */
  getChurchAttendanceStats: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/attendance-stats`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church attendance stats:', error);
      throw error;
    }
  },

  /**
   * Obtener reporte de bautismos de una iglesia
   */
  getChurchBaptismReport: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/baptism-report`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church baptism report:', error);
      throw error;
    }
  },

  /**
   * Obtener comparativa entre iglesias
   */
  getChurchesComparison: async (churchIds, metrics = [], period = 'month') => {
    try {
      const response = await apiClient.post('/churches/comparison', {
        churchIds,
        metrics,
        period
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching churches comparison:', error);
      throw error;
    }
  },

  // ===================== CONFIGURACIONES Y PREFERENCIAS =====================

  /**
   * Obtener configuración de una iglesia
   */
  getChurchConfiguration: async (churchId) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/configuration`);
      return response.data;
    } catch (error) {
      console.error('Error fetching church configuration:', error);
      throw error;
    }
  },

  /**
   * Actualizar configuración de una iglesia
   */
  updateChurchConfiguration: async (churchId, configData) => {
    try {
      const response = await apiClient.put(`/churches/${churchId}/configuration`, configData);
      return response.data;
    } catch (error) {
      console.error('Error updating church configuration:', error);
      throw error;
    }
  },

  /**
   * Obtener horarios de servicios de una iglesia
   */
  getChurchSchedules: async (churchId) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/schedules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching church schedules:', error);
      throw error;
    }
  },

  /**
   * Actualizar horarios de servicios
   */
  updateChurchSchedules: async (churchId, schedules) => {
    try {
      const response = await apiClient.put(`/churches/${churchId}/schedules`, { schedules });
      return response.data;
    } catch (error) {
      console.error('Error updating church schedules:', error);
      throw error;
    }
  },

  // ===================== CONTACTO E INFORMACIÓN =====================

  /**
   * Actualizar información de contacto
   */
  updateChurchContact: async (churchId, contactData) => {
    try {
      const response = await apiClient.put(`/churches/${churchId}/contact`, contactData);
      return response.data;
    } catch (error) {
      console.error('Error updating church contact:', error);
      throw error;
    }
  },

  /**
   * Subir logo de iglesia
   */
  uploadChurchLogo: async (churchId, logoFile) => {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await apiClient.post(`/churches/${churchId}/logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading church logo:', error);
      throw error;
    }
  },

  /**
   * Eliminar logo de iglesia
   */
  deleteChurchLogo: async (churchId) => {
    try {
      const response = await apiClient.delete(`/churches/${churchId}/logo`);
      return response.data;
    } catch (error) {
      console.error('Error deleting church logo:', error);
      throw error;
    }
  },

  // ===================== EVENTOS Y ACTIVIDADES =====================

  /**
   * Obtener eventos de una iglesia
   */
  getChurchEvents: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/events`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church events:', error);
      throw error;
    }
  },

  /**
   * Crear evento para una iglesia
   */
  createChurchEvent: async (churchId, eventData) => {
    try {
      const response = await apiClient.post(`/churches/${churchId}/events`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating church event:', error);
      throw error;
    }
  },

  /**
   * Actualizar evento de iglesia
   */
  updateChurchEvent: async (churchId, eventId, eventData) => {
    try {
      const response = await apiClient.put(`/churches/${churchId}/events/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      console.error('Error updating church event:', error);
      throw error;
    }
  },

  /**
   * Eliminar evento de iglesia
   */
  deleteChurchEvent: async (churchId, eventId) => {
    try {
      const response = await apiClient.delete(`/churches/${churchId}/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting church event:', error);
      throw error;
    }
  },

  // ===================== FINANZAS Y OFRENDAS =====================

  /**
   * Obtener resumen financiero de una iglesia
   */
  getChurchFinancialSummary: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/financial-summary`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching church financial summary:', error);
      throw error;
    }
  },

  /**
   * Registrar ofrenda
   */
  recordOffering: async (churchId, offeringData) => {
    try {
      const response = await apiClient.post(`/churches/${churchId}/offerings`, offeringData);
      return response.data;
    } catch (error) {
      console.error('Error recording offering:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de ofrendas
   */
  getOfferingsHistory: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/offerings`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching offerings history:', error);
      throw error;
    }
  },

  // ===================== ADMINISTRACIÓN Y PERMISOS =====================

  /**
   * Obtener permisos de usuario para una iglesia
   */
  getUserChurchPermissions: async (churchId, userId) => {
    try {
      const response = await apiClient.get(`/churches/${churchId}/permissions/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user church permissions:', error);
      throw error;
    }
  },

  /**
   * Actualizar permisos de usuario para una iglesia
   */
  updateUserChurchPermissions: async (churchId, userId, permissions) => {
    try {
      const response = await apiClient.put(`/churches/${churchId}/permissions/${userId}`, {
        permissions
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user church permissions:', error);
      throw error;
    }
  },

  /**
   * Obtener iglesias a las que tiene acceso un usuario
   */
  getUserChurches: async (userId = null) => {
    try {
      const endpoint = userId ? `/churches/user/${userId}` : '/churches/my-churches';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching user churches:', error);
      throw error;
    }
  },

  // ===================== EXPORTACIÓN E IMPORTACIÓN =====================

  /**
   * Exportar datos de iglesia a Excel
   */
  exportChurchData: async (churchId, exportType = 'complete', filters = {}) => {
    try {
      const response = await apiClient.post(`/churches/${churchId}/export/excel`, {
        type: exportType,
        filters
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting church data:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte de iglesia a PDF
   */
  exportChurchReport: async (churchId, reportType = 'summary', params = {}) => {
    try {
      const response = await apiClient.post(`/churches/${churchId}/export/pdf`, {
        reportType,
        ...params
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting church report:', error);
      throw error;
    }
  },

  /**
   * Importar datos masivos para una iglesia
   */
  importChurchData: async (churchId, file, importType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', importType);

      const response = await apiClient.post(`/churches/${churchId}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing church data:', error);
      throw error;
    }
  },

  // ===================== BÚSQUEDA Y FILTROS =====================

  /**
   * Buscar iglesias por criterios
   */
  searchChurches: async (searchParams) => {
    try {
      const response = await apiClient.post('/churches/search', searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching churches:', error);
      throw error;
    }
  },

  /**
   * Obtener iglesias cercanas por geolocalización
   */
  getNearbyChurches: async (latitude, longitude, radius = 10) => {
    try {
      const response = await apiClient.get('/churches/nearby', {
        params: { latitude, longitude, radius }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby churches:', error);
      throw error;
    }
  },

  /**
   * Obtener filtros disponibles para iglesias
   */
  getChurchFilters: async () => {
    try {
      const response = await apiClient.get('/churches/filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching church filters:', error);
      throw error;
    }
  },

  // ===================== ESTADÍSTICAS GLOBALES =====================

  /**
   * Obtener estadísticas globales de todas las iglesias
   */
  getGlobalChurchStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/churches/global-statistics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching global church statistics:', error);
      throw error;
    }
  },

  /**
   * Obtener ranking de iglesias por métricas
   */
  getChurchRanking: async (metric = 'members', period = 'month', limit = 10) => {
    try {
      const response = await apiClient.get('/churches/ranking', {
        params: { metric, period, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching church ranking:', error);
      throw error;
    }
  }
};