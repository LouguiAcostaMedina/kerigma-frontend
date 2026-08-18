import { apiClient } from './apiClient';

const unwrap = (response) => response?.data ?? response;

const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, val]) => val !== '' && val !== null && val !== undefined));

export const financialService = {
  getContributions: async (params = {}) => {
    try {
      const response = await apiClient.get('/financial-contributions', { params: cleanParams(params) });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching contributions:', error);
      throw error;
    }
  },

  createContribution: async (data) => {
    try {
      const response = await apiClient.post('/financial-contributions', data);
      return unwrap(response);
    } catch (error) {
      console.error('Error creating contribution:', error);
      throw error;
    }
  },

  getContributionById: async (id) => {
    try {
      const response = await apiClient.get(`/financial-contributions/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching contribution:', error);
      throw error;
    }
  },

  deleteContribution: async (id) => {
    try {
      const response = await apiClient.delete(`/financial-contributions/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error deleting contribution:', error);
      throw error;
    }
  },

  getSummaryByCategory: async (params = {}) => {
    try {
      const response = await apiClient.get('/financial-contributions/summary/by-category', { params: cleanParams(params) });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching category summary:', error);
      throw error;
    }
  },

  getSummaryByPeriod: async (params = {}) => {
    try {
      const response = await apiClient.get('/financial-contributions/summary/by-period', { params: cleanParams(params) });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching period summary:', error);
      throw error;
    }
  },

  getMemberHistory: async (memberId) => {
    try {
      const response = await apiClient.get(`/financial-contributions/member/${memberId}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching member history:', error);
      throw error;
    }
  },
};
