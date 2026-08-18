import { apiClient } from './apiClient';

export const documentService = {
  async getDocuments(params = {}) {
    const response = await apiClient.get('/documents', { params });
    return response?.data ?? null;
  },
  async getDocument(id) {
    const response = await apiClient.get(`/documents/${id}`);
    return response?.data ?? null;
  },
  async createDocument(data) {
    const response = await apiClient.post('/documents', data);
    return response?.data ?? null;
  },
  async updateDocument(id, data) {
    const response = await apiClient.put(`/documents/${id}`, data);
    return response?.data ?? null;
  },
  async deleteDocument(id) {
    const response = await apiClient.delete(`/documents/${id}`);
    return response?.data ?? null;
  },
};
