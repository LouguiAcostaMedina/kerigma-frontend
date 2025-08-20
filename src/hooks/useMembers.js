/**
 * Hook personalizado para la gestión de Miembros
 * Maneja el estado y operaciones CRUD de miembros
 */

import { useState, useCallback, useRef } from 'react';
import { membersService } from '@/services/membersService';
import { showNotification } from '@/utils/notifications';

export const useMembers = () => {
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState(null);
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

  // Obtener lista de miembros con filtros y paginación
  const fetchMembers = useCallback(async (params = {}) => {
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
      const response = await membersService.getMembers({
        ...params,
        signal: abortControllerRef.current.signal
      });

      setMembers(response.data || []);
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
        console.error('Error fetching members:', err);
        setError(err.message || 'Error al cargar los miembros');
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los miembros'
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener un miembro específico
  const fetchMember = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await membersService.getMemberById(id);
      setMember(response);
      return response;
    } catch (err) {
      console.error('Error fetching member:', err);
      setError(err.message || 'Error al cargar el miembro');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar el miembro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear nuevo miembro
  const createMember = useCallback(async (memberData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await membersService.createMember(memberData);
      
      // Actualizar lista local
      setMembers(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro creado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error creating member:', err);
      setError(err.message || 'Error al crear el miembro');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al crear el miembro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar miembro existente
  const updateMember = useCallback(async (id, memberData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await membersService.updateMember(id, memberData);
      
      // Actualizar lista local
      setMembers(current =>
        current.map(member => member.id === id ? response : member)
      );
      
      // Actualizar miembro individual si está cargado
      if (member?.id === id) {
        setMember(response);
      }

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro actualizado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error updating member:', err);
      setError(err.message || 'Error al actualizar el miembro');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al actualizar el miembro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [member]);

  // Eliminar miembro
  const deleteMember = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await membersService.deleteMember(id);
      
      // Actualizar lista local
      setMembers(current => current.filter(member => member.id !== id));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro eliminado correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error deleting member:', err);
      setError(err.message || 'Error al eliminar el miembro');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al eliminar el miembro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Eliminar múltiples miembros
  const deleteMultipleMembers = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      await membersService.deleteMultipleMembers(ids);
      
      // Actualizar lista local
      setMembers(current => current.filter(member => !ids.includes(member.id)));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${ids.length} miembro(s) eliminado(s) correctamente`
      });

      return true;
    } catch (err) {
      console.error('Error deleting multiple members:', err);
      setError(err.message || 'Error al eliminar los miembros');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar los miembros seleccionados'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de miembro
  const updateMemberStatus = useCallback(async (id, status) => {
    try {
      const response = await membersService.updateMemberStatus(id, status);
      
      // Actualizar lista local
      setMembers(current =>
        current.map(member => 
          member.id === id ? { ...member, status } : member
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `Estado del miembro actualizado a ${status}`
      });

      return response;
    } catch (err) {
      console.error('Error updating member status:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el estado del miembro'
      });
      throw err;
    }
  }, []);

  // Asignar miembro a grupo
  const assignToGroup = useCallback(async (memberId, groupId) => {
    try {
      const response = await membersService.assignToGroup(memberId, groupId);
      
      // Actualizar lista local
      setMembers(current =>
        current.map(member => 
          member.id === memberId ? { ...member, groupId } : member
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro asignado al grupo correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error assigning member to group:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar el miembro al grupo'
      });
      throw err;
    }
  }, []);

  // Exportar a Excel
  const exportToExcel = useCallback(async (filters = {}) => {
    setLoading(true);
    
    try {
      const blob = await membersService.exportToExcel(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `miembros_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      const blob = await membersService.exportToPDF(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `miembros_${new Date().toISOString().split('T')[0]}.pdf`;
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

  // Importar desde Excel
  const importFromExcel = useCallback(async (file) => {
    setLoading(true);
    
    try {
      const response = await membersService.importFromExcel(file);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${response.imported} miembro(s) importado(s) correctamente`
      });

      // Recargar datos
      await fetchMembers();

      return response;
    } catch (err) {
      console.error('Error importing from Excel:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al importar desde Excel'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  // Limpiar estado
  const clearMember = useCallback(() => {
    setMember(null);
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
    members,
    member,
    loading,
    error,
    pagination,
    
    // Acciones CRUD
    fetchMembers,
    fetchMember,
    createMember,
    updateMember,
    deleteMember,
    deleteMultipleMembers,
    
    // Acciones específicas
    updateMemberStatus,
    assignToGroup,
    
    // Importar/Exportar
    exportToExcel,
    exportToPDF,
    importFromExcel,
    
    // Utilidades
    clearMember,
    clearError,
    cancelRequests,
    
    // Estados derivados
    hasMembers: members.length > 0,
    isEmpty: members.length === 0 && !loading,
    isLoading: loading,
    hasError: !!error
  };
};