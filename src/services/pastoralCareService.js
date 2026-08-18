import { apiClient } from './apiClient';

export const pastoralCareService = {
  async getPrayerRequests(params = {}) {
    const response = await apiClient.get('/pastoral-care/prayer-requests', { params });
    return response?.data ?? null;
  },
  async getPrayerRequest(id) {
    const response = await apiClient.get(`/pastoral-care/prayer-requests/${id}`);
    return response?.data ?? null;
  },
  async createPrayerRequest(data) {
    const response = await apiClient.post('/pastoral-care/prayer-requests', data);
    return response?.data ?? null;
  },
  async updatePrayerRequest(id, data) {
    const response = await apiClient.put(`/pastoral-care/prayer-requests/${id}`, data);
    return response?.data ?? null;
  },
  async deletePrayerRequest(id) {
    const response = await apiClient.delete(`/pastoral-care/prayer-requests/${id}`);
    return response?.data ?? null;
  },
  async updatePrayerRequestStatus(id, data) {
    const response = await apiClient.patch(`/pastoral-care/prayer-requests/${id}/status`, data);
    return response?.data ?? null;
  },
  async getVisits(params = {}) {
    const response = await apiClient.get('/pastoral-care/visits', { params });
    return response?.data ?? null;
  },
  async getVisit(id) {
    const response = await apiClient.get(`/pastoral-care/visits/${id}`);
    return response?.data ?? null;
  },
  async createVisit(data) {
    const response = await apiClient.post('/pastoral-care/visits', data);
    return response?.data ?? null;
  },
  async updateVisit(id, data) {
    const response = await apiClient.put(`/pastoral-care/visits/${id}`, data);
    return response?.data ?? null;
  },
  async deleteVisit(id) {
    const response = await apiClient.delete(`/pastoral-care/visits/${id}`);
    return response?.data ?? null;
  },
};
