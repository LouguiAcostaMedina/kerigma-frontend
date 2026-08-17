/**
 * Servicio para la gestión de iglesias del sistema misionero
 * Maneja las operaciones CRUD disponibles en el frontend
 */

import { apiClient } from './apiClient';

export const churchesService = {
  // ===================== OPERACIONES CRUD BÁSICAS =====================

  /**
   * Obtener lista de iglesias con filtros y paginación
   */
  getChurches: async (params = {}, signal) => {
    try {
      const response = await apiClient.get('/churches', { params, signal });
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError' || error.message?.includes('cancelada')) return;
      console.error('Error fetching churches:', error);
      throw error;
    }
  },

  /**
   * Obtener iglesias públicas (sin auth) para el registro
   */
  getPublicChurches: async (signal) => {
    try {
      const response = await apiClient.get('/churches/public', { signal });
      return response.data;
    } catch (error) {
      console.error('Error fetching public churches:', error);
      throw error;
    }
  },

  /**
   * Crear nueva iglesia
   */
  createChurch: async (churchData) => {
    try {
      const response = await apiClient.post('/churches', churchData);
      return response.data;
    } catch (error) {
      console.error('Error creating church:', error);
      throw error;
    }
  },

  /**
   * Actualizar iglesia existente
   */
  updateChurch: async (id, churchData) => {
    try {
      const response = await apiClient.put(`/churches/${id}`, churchData);
      return response.data;
    } catch (error) {
      console.error('Error updating church:', error);
      throw error;
    }
  },

  /**
   * Obtener iglesias cercanas por coordenadas
   */
  getNearbyChurches: async ({ latitude, longitude, radiusKm = 10, limit = 5 } = {}) => {
    try {
      const response = await apiClient.get('/churches/nearby', {
        params: { latitude, longitude, radiusKm, limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby churches:', error);
      throw error;
    }
  },

  /**
   * Eliminar iglesia
   */
  deleteChurch: async (id) => {
    try {
      const response = await apiClient.delete(`/churches/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting church:', error);
      throw error;
    }
  }
};
