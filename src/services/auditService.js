import { apiClient } from './apiClient';

const unwrap = (response) => response?.data ?? response;

const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, val]) => val !== '' && val !== null && val !== undefined));

export const auditService = {
  getAuditLogs: async (params = {}) => {
    try {
      const response = await apiClient.get('/audit-logs', { params: cleanParams(params) });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      throw error;
    }
  },

  getAuditLogById: async (id) => {
    try {
      const response = await apiClient.get(`/audit-logs/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    }
  },

  getAuditStats: async (days = 30) => {
    try {
      const response = await apiClient.get('/audit-logs/stats', { params: { days } });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  },
};
