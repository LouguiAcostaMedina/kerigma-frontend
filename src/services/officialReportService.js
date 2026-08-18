/**
 * Servicio de reportes oficiales de membresía
 * Consumo de datos de miembros para generación de certificados
 */

import { apiClient } from './apiClient';

export const officialReportService = {
  async searchMembers(params = {}) {
    const response = await apiClient.get('/members', { params });
    return response?.data ?? null;
  },

  async getMemberById(memberId) {
    const response = await apiClient.get(`/members/${memberId}`);
    return response?.data ?? null;
  },

  async getMemberList(params = {}) {
    const response = await apiClient.get('/members', { params });
    return response?.data ?? null;
  },
};
