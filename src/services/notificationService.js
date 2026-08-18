/**
 * Servicio de notificaciones
 */

import { apiClient } from './apiClient';

export const notificationService = {
  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response?.data ?? null;
  },

  async getNotification(id) {
    const response = await apiClient.get(`/notifications/${id}`);
    return response?.data ?? null;
  },

  async sendNotification(data) {
    const response = await apiClient.post('/notifications', data);
    return response?.data ?? null;
  },

  async cancelNotification(id) {
    const response = await apiClient.patch(`/notifications/${id}/cancel`);
    return response?.data ?? null;
  },

  async getStats() {
    const response = await apiClient.get('/notifications/stats');
    return response?.data ?? null;
  },
};
