/**
 * Servicio para la administración de usuarios del sistema misionero
 * Maneja las operaciones CRUD y acciones disponibles en el frontend
 */

import { apiClient } from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, val]) => val !== "" && val !== null && val !== undefined));

export const usersService = {
  // ===================== OPERACIONES CRUD BÁSICAS =====================

  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params: cleanParams(params) });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return unwrap(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario existente
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return unwrap(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de usuario (activo/inactivo)
   */
  updateUserStatus: async (id, status, reason = null) => {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { status, reason });
      return unwrap(response);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  /**
   * Operación en lote genérica (delete, activate, deactivate, suspend, reactivate)
   */
  bulkOperation: async (operation, userIds, data = {}) => {
    try {
      const response = await apiClient.post('/users/bulk', {
        operation,
        userIds,
        ...data
      });
      return unwrap(response);
    } catch (error) {
      console.error('Error in bulk operation:', error);
      throw error;
    }
  },

  /**
   * Enviar email de invitación
   */
  sendInvitation: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/invite`);
      return unwrap(response);
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  /**
   * Enviar email de recuperación de contraseña
   */
  resetPassword: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/reset-password`);
      return unwrap(response);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};
