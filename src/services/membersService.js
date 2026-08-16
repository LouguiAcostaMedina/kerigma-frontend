/**
 * Servicio para la gestión de Miembros
 * Maneja todas las operaciones CRUD de miembros de la iglesia
 */

import api from './api';

export const membersService = {
  // Obtener todos los miembros con filtros y paginación
  getMembers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        church: params.church || '',
        group: params.group || '',
        status: params.status || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }).toString();

      const response = await api.get(`/members?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Obtener un miembro por ID
  getMemberById: async (id) => {
    try {
      const response = await api.get(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  // Crear un nuevo miembro
  createMember: async (memberData) => {
    try {
      const response = await api.post('/members', memberData);
      return response.data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  // Actualizar un miembro existente
  updateMember: async (id, memberData) => {
    try {
      const response = await api.put(`/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  // Eliminar un miembro
  deleteMember: async (id) => {
    try {
      const response = await api.delete(`/members/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  // Eliminar múltiples miembros
  deleteMultipleMembers: async (ids) => {
    try {
      const response = await api.delete('/members/bulk', { data: { ids } });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple members:', error);
      throw error;
    }
  },

  // Exportar miembros a Excel
  exportToExcel: async (filters = {}) => {
    try {
      const response = await api.get('/members/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting members to Excel:', error);
      throw error;
    }
  },

  // Exportar miembros a PDF
  exportToPDF: async (filters = {}) => {
    try {
      const response = await api.get('/members/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting members to PDF:', error);
      throw error;
    }
  },

  // Actualizar el estado de un miembro (activo/inactivo)
  updateMemberStatus: async (id, status) => {
    try {
      const response = await api.patch(`/members/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  },

  // Asignar miembro a un grupo
  assignToGroup: async (memberId, groupId) => {
    try {
      const response = await api.post(`/members/${memberId}/assign-group`, {
        groupId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning member to group:', error);
      throw error;
    }
  }
};