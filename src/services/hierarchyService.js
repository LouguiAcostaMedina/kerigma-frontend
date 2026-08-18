import { apiClient } from './apiClient';

export const hierarchyService = {
  async getAssociations(params = {}) {
    const response = await apiClient.get('/hierarchy', { params });
    return response?.data ?? null;
  },
  async getAssociation(id) {
    const response = await apiClient.get(`/hierarchy/${id}`);
    return response?.data ?? null;
  },
  async createAssociation(data) {
    const response = await apiClient.post('/hierarchy', data);
    return response?.data ?? null;
  },
  async updateAssociation(id, data) {
    const response = await apiClient.put(`/hierarchy/${id}`, data);
    return response?.data ?? null;
  },
  async deleteAssociation(id) {
    const response = await apiClient.delete(`/hierarchy/${id}`);
    return response?.data ?? null;
  },
  async getDistricts(params = {}) {
    const response = await apiClient.get('/hierarchy/districts', { params });
    return response?.data ?? null;
  },
  async getDistrict(id) {
    const response = await apiClient.get(`/hierarchy/districts/${id}`);
    return response?.data ?? null;
  },
  async createDistrict(data) {
    const response = await apiClient.post('/hierarchy/districts', data);
    return response?.data ?? null;
  },
  async updateDistrict(id, data) {
    const response = await apiClient.put(`/hierarchy/districts/${id}`, data);
    return response?.data ?? null;
  },
  async deleteDistrict(id) {
    const response = await apiClient.delete(`/hierarchy/districts/${id}`);
    return response?.data ?? null;
  },
};
