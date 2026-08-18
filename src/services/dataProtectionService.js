import { apiClient } from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const dataProtectionService = {
  getConsentStatus: async (memberId) => {
    try {
      const response = await apiClient.get(`/data-protection/${memberId}/consent`);
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching consent status:', error);
      throw error;
    }
  },

  recordConsent: async (memberId, consentGiven) => {
    try {
      const response = await apiClient.post(`/data-protection/${memberId}/consent`, { consentGiven });
      return unwrap(response);
    } catch (error) {
      console.error('Error recording consent:', error);
      throw error;
    }
  },

  exportMemberData: async (memberId) => {
    try {
      const response = await apiClient.get(`/data-protection/${memberId}/data-export`);
      return unwrap(response);
    } catch (error) {
      console.error('Error exporting member data:', error);
      throw error;
    }
  },

  anonymizeMemberData: async (memberId) => {
    try {
      const response = await apiClient.post(`/data-protection/${memberId}/anonymize`);
      return unwrap(response);
    } catch (error) {
      console.error('Error anonymizing member data:', error);
      throw error;
    }
  },

  hardDeleteMember: async (memberId) => {
    try {
      const response = await apiClient.delete(`/data-protection/${memberId}/hard-delete`);
      return unwrap(response);
    } catch (error) {
      console.error('Error hard deleting member:', error);
      throw error;
    }
  },
};
