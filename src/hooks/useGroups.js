/**
 * Hook personalizado para la gestión de Grupos
 * Maneja el estado y operaciones CRUD de grupos
 */

import { useState, useCallback, useRef } from 'react';
import { groupsService } from '@/services/groupsService';
import { showNotification } from '@/utils/notifications';

export const useGroups = () => {
  const [groups, setGroups] = useState([]);
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    from: 0,
    to: 0
  });

  // Referencias para evitar llamadas duplicadas
  const abortControllerRef = useRef(null);
  const lastParamsRef = useRef(null);

  // Obtener lista de grupos con filtros y paginación
  const fetchGroups = useCallback(async (params = {}) => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controlador de cancelación
    abortControllerRef.current = new AbortController();

    // Evitar llamadas duplicadas con los mismos parámetros
    const paramsString = JSON.stringify(params);
    if (paramsString === lastParamsRef.current) {
      return;
    }
    lastParamsRef.current = paramsString;

    setLoading(true);
    setError(null);

    try {
      const response = await groupsService.getGroups({
        ...params,
        signal: abortControllerRef.current.signal
      });

      setGroups(response.data || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0
      });

      return response;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching groups:', err);
        setError(err.message || 'Error al cargar los grupos');
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los grupos'
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un grupo específico
  const fetchGroup = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await groupsService.getGroupById(id);
      setGroup(response);
      return response;
    } catch (err) {
      console.error('Error fetching group:', err);
      setError(err.message || 'Error al cargar el grupo');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar el grupo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo grupo
  const createGroup = useCallback(async (groupData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await groupsService.createGroup(groupData);
      
      // Actualizar lista local
      setGroups(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Grupo creado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Error al crear el grupo');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al crear el grupo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar grupo existente
  const updateGroup = useCallback(async (id, groupData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await groupsService.updateGroup(id, groupData);
      
      // Actualizar lista local
      setGroups(current =>
        current.map(group => group.id === id ? response : group)
      );
      
      // Actualizar grupo individual si está cargado
      if (group?.id === id) {
        setGroup(response);
      }

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Grupo actualizado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error updating group:', err);
      setError(err.message || 'Error al actualizar el grupo');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al actualizar el grupo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [group]);

  // Eliminar grupo
  const deleteGroup = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await groupsService.deleteGroup(id);
      
      // Actualizar lista local
      setGroups(current => current.filter(group => group.id !== id));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Grupo eliminado correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error deleting group:', err);
      setError(err.message || 'Error al eliminar el grupo');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al eliminar el grupo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar múltiples grupos
  const deleteMultipleGroups = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      await groupsService.deleteMultipleGroups(ids);
      
      // Actualizar lista local
      setGroups(current => current.filter(group => !ids.includes(group.id)));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${ids.length} grupo(s) eliminado(s) correctamente`
      });

      return true;
    } catch (err) {
      console.error('Error deleting multiple groups:', err);
      setError(err.message || 'Error al eliminar los grupos');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar los grupos seleccionados'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener miembros de un grupo
  const fetchGroupMembers = useCallback(async (id, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await groupsService.getGroupMembers(id, params);
      setGroupMembers(response.data || []);
      return response;
    } catch (err) {
      console.error('Error fetching group members:', err);
      setError(err.message || 'Error al cargar los miembros del grupo');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar los miembros del grupo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Agregar miembro a grupo
  const addMemberToGroup = useCallback(async (groupId, memberId) => {
    try {
      const response = await groupsService.addMemberToGroup(groupId, memberId);
      
      // Actualizar lista local de miembros
      setGroupMembers(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro agregado al grupo correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error adding member to group:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al agregar el miembro al grupo'
      });
      throw err;
    }
  }, []);

  // Remover miembro de grupo
  const removeMemberFromGroup = useCallback(async (groupId, memberId) => {
    try {
      await groupsService.removeMemberFromGroup(groupId, memberId);
      
      // Actualizar lista local de miembros
      setGroupMembers(current => current.filter(member => member.id !== memberId));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro removido del grupo correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error removing member from group:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al remover el miembro del grupo'
      });
      throw err;
    }
  }, []);

  // Actualizar estado de grupo
  const updateGroupStatus = useCallback(async (id, status) => {
    try {
      const response = await groupsService.updateGroupStatus(id, status);
      
      // Actualizar lista local
      setGroups(current =>
        current.map(group => 
          group.id === id ? { ...group, status } : group
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `Estado del grupo actualizado a ${status}`
      });

      return response;
    } catch (err) {
      console.error('Error updating group status:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el estado del grupo'
      });
      throw err;
    }
  }, []);

  // Asignar líder a grupo
  const assignLeader = useCallback(async (groupId, leaderId) => {
    try {
      const response = await groupsService.assignLeader(groupId, leaderId);
      
      // Actualizar lista local
      setGroups(current =>
        current.map(group => 
          group.id === groupId ? { ...group, leaderId } : group
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Líder asignado al grupo correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error assigning leader to group:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar el líder al grupo'
      });
      throw err;
    }
  }, []);

  // Exportar a Excel
  const exportToExcel = useCallback(async (filters = {}) => {
    setLoading(true);
    
    try {
      const blob = await groupsService.exportToExcel(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grupos_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Archivo Excel descargado correctamente'
      });
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar a Excel'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Exportar a PDF
  const exportToPDF = useCallback(async (filters = {}) => {
    setLoading(true);
    
    try {
      const blob = await groupsService.exportToPDF(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grupos_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Archivo PDF descargado correctamente'
      });
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar a PDF'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicar grupo
  const duplicateGroup = useCallback(async (id) => {
    setLoading(true);
    
    try {
      const response = await groupsService.duplicateGroup(id);
      
      // Actualizar lista local
      setGroups(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Grupo duplicado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error duplicating group:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al duplicar el grupo'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar estado
  const clearGroup = useCallback(() => {
    setGroup(null);
  }, []);

  const clearGroupMembers = useCallback(() => {
    setGroupMembers([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cancelar peticiones pendientes
  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    // Estado
    groups,
    group,
    groupMembers,
    loading,
    error,
    pagination,
    
    // Acciones CRUD
    fetchGroups,
    fetchGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    deleteMultipleGroups,
    
    // Gestión de miembros
    fetchGroupMembers,
    addMemberToGroup,
    removeMemberFromGroup,
    
    // Acciones específicas
    updateGroupStatus,
    assignLeader,
    duplicateGroup,
    
    // Importar/Exportar
    exportToExcel,
    exportToPDF,
    
    // Utilidades
    clearGroup,
    clearGroupMembers,
    clearError,
    cancelRequests,
    
    // Estados derivados
    hasGroups: groups.length > 0,
    isEmpty: groups.length === 0 && !loading,
    isLoading: loading,
    hasError: !!error
  };
};