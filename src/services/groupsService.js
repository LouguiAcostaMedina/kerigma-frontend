/**
 * Servicio para la gestión de Grupos
 * Maneja todas las operaciones CRUD de grupos de la iglesia
 */

import apiClient from './apiClient';

export const groupsService = {
  // Obtener todos los grupos con filtros y paginación
  getGroups: async (params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        church: params.church || '',
        leader: params.leader || '',
        status: params.status || '',
        type: params.type || '',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      }).toString();

      const response = await apiClient.get(`/groups?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    }
  },

  // Obtener un grupo por ID
  getGroupById: async (id) => {
    try {
      const response = await apiClient.get(`/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group:', error);
      throw error;
    }
  },

  // Crear un nuevo grupo
  createGroup: async (groupData) => {
    try {
      const response = await apiClient.post('/groups', groupData);
      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  // Actualizar un grupo existente
  updateGroup: async (id, groupData) => {
    try {
      const response = await apiClient.put(`/groups/${id}`, groupData);
      return response.data;
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  },

  // Eliminar un grupo
  deleteGroup: async (id) => {
    try {
      const response = await apiClient.delete(`/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  },

  // Eliminar múltiples grupos
  deleteMultipleGroups: async (ids) => {
    try {
      const response = await apiClient.delete('/groups/bulk', { data: { ids } });
      return response.data;
    } catch (error) {
      console.error('Error deleting multiple groups:', error);
      throw error;
    }
  },

  // Obtener miembros de un grupo
  getGroupMembers: async (id, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        search: params.search || ''
      }).toString();

      const response = await apiClient.get(`/groups/${id}/members?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group members:', error);
      throw error;
    }
  },

  // Agregar miembro a grupo
  addMemberToGroup: async (groupId, memberId) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/members`, {
        memberId
      });
      return response.data;
    } catch (error) {
      console.error('Error adding member to group:', error);
      throw error;
    }
  },

  // Remover miembro de grupo
  removeMemberFromGroup: async (groupId, memberId) => {
    try {
      const response = await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing member from group:', error);
      throw error;
    }
  },

  // Obtener estadísticas de grupos
  getGroupsStats: async () => {
    try {
      const response = await apiClient.get('/groups/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching groups stats:', error);
      throw error;
    }
  },

  // Obtener estadísticas de un grupo específico
  getGroupStats: async (id) => {
    try {
      const response = await apiClient.get(`/groups/${id}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group stats:', error);
      throw error;
    }
  },

  // Actualizar estado de un grupo
  updateGroupStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/groups/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating group status:', error);
      throw error;
    }
  },

  // Asignar líder a grupo
  assignLeader: async (groupId, leaderId) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/assign-leader`, {
        leaderId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning leader to group:', error);
      throw error;
    }
  },

  // Obtener reuniones de un grupo
  getGroupMeetings: async (id, params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        startDate: params.startDate || '',
        endDate: params.endDate || ''
      }).toString();

      const response = await apiClient.get(`/groups/${id}/meetings?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching group meetings:', error);
      throw error;
    }
  },

  // Crear reunión de grupo
  createGroupMeeting: async (groupId, meetingData) => {
    try {
      const response = await apiClient.post(`/groups/${groupId}/meetings`, meetingData);
      return response.data;
    } catch (error) {
      console.error('Error creating group meeting:', error);
      throw error;
    }
  },

  // Exportar grupos a Excel
  exportToExcel: async (filters = {}) => {
    try {
      const response = await apiClient.get('/groups/export/excel', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting groups to Excel:', error);
      throw error;
    }
  },

  // Exportar grupos a PDF
  exportToPDF: async (filters = {}) => {
    try {
      const response = await apiClient.get('/groups/export/pdf', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting groups to PDF:', error);
      throw error;
    }
  },

  // Duplicar grupo
  duplicateGroup: async (id) => {
    try {
      const response = await apiClient.post(`/groups/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating group:', error);
      throw error;
    }
  },

  // Obtener tipos de grupos disponibles
  getGroupTypes: async () => {
    try {
      const response = await apiClient.get('/groups/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching group types:', error);
      throw error;
    }
  }
};