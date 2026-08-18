/**
 * Servicio de actividades / calendario
 */

import { apiClient } from './apiClient';

export const activityService = {
  async getActivities(params = {}) {
    const response = await apiClient.get('/activities', { params });
    return response?.data ?? null;
  },

  async getActivity(id) {
    const response = await apiClient.get(`/activities/${id}`);
    return response?.data ?? null;
  },

  async createActivity(data) {
    const response = await apiClient.post('/activities', data);
    return response?.data ?? null;
  },

  async updateActivity(id, data) {
    const response = await apiClient.put(`/activities/${id}`, data);
    return response?.data ?? null;
  },

  async deleteActivity(id) {
    const response = await apiClient.delete(`/activities/${id}`);
    return response?.data ?? null;
  },
};
