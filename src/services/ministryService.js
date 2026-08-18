import { apiClient } from './apiClient';

export const ministryService = {
  async getMinistries(params = {}) {
    const response = await apiClient.get('/ministries', { params });
    return response?.data ?? null;
  },
  async getMinistry(id) {
    const response = await apiClient.get(`/ministries/${id}`);
    return response?.data ?? null;
  },
  async createMinistry(data) {
    const response = await apiClient.post('/ministries', data);
    return response?.data ?? null;
  },
  async updateMinistry(id, data) {
    const response = await apiClient.put(`/ministries/${id}`, data);
    return response?.data ?? null;
  },
  async deleteMinistry(id) {
    const response = await apiClient.delete(`/ministries/${id}`);
    return response?.data ?? null;
  },
  async assignMember(id, data) {
    const response = await apiClient.post(`/ministries/${id}/assign`, data);
    return response?.data ?? null;
  },
  async removeAssignment(id, assignmentId) {
    const response = await apiClient.delete(`/ministries/${id}/assign/${assignmentId}`);
    return response?.data ?? null;
  },
  async getAssignments(id, params = {}) {
    const response = await apiClient.get(`/ministries/${id}/assignments`, { params });
    return response?.data ?? null;
  },
};
