import { apiClient } from './apiClient';

export const baptismPipelineService = {
  async getMetrics(params = {}) {
    const response = await apiClient.get('/baptism-pipeline/metrics', { params });
    return response?.data ?? null;
  },
  async getLessonStats(params = {}) {
    const response = await apiClient.get('/baptism-pipeline/lesson-stats', { params });
    return response?.data ?? null;
  },
};
