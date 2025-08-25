/**
 * Hook personalizado para la gestión de iglesias
 * Maneja el estado y operaciones CRUD de iglesias, estadísticas y configuraciones
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { churchesService } from '@/services/churchesService';
import { showNotification } from '@/utils/notifications';

export const useChurches = () => {
  // ===================== ESTADO PRINCIPAL =====================
  const [churches, setChurches] = useState([]);
  const [church, setChurch] = useState(null);
  const [churchLeaders, setChurchLeaders] = useState([]);
  const [churchMembers, setChurchMembers] = useState([]);
  const [churchGroups, setChurchGroups] = useState([]);
  const [churchStudents, setChurchStudents] = useState([]);
  const [churchEvents, setChurchEvents] = useState([]);
  const [userChurches, setUserChurches] = useState([]);

  // ===================== ESTADO DE ESTADÍSTICAS =====================
  const [churchStatistics, setChurchStatistics] = useState(null);
  const [growthMetrics, setGrowthMetrics] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [baptismReport, setBaptismReport] = useState(null);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [globalStatistics, setGlobalStatistics] = useState(null);
  const [churchRanking, setChurchRanking] = useState([]);

  // ===================== ESTADO DE CONFIGURACIÓN =====================
  const [churchConfiguration, setChurchConfiguration] = useState(null);
  const [churchSchedules, setChurchSchedules] = useState([]);
  const [churchFilters, setChurchFilters] = useState(null);
  const [userPermissions, setUserPermissions] = useState({});

  // ===================== ESTADO DE UI =====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  // ===================== PAGINACIÓN =====================
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    from: 0,
    to: 0
  });

  // ===================== REFERENCIAS Y CACHE =====================
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastParamsRef = useRef(null);

  // ===================== OPERACIONES CRUD BÁSICAS =====================

  /**
   * Obtener lista de iglesias con filtros
   */
  const fetchChurches = useCallback(async (params = {}) => {
    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Evitar llamadas duplicadas
    const paramsString = JSON.stringify(params);
    if (paramsString === lastParamsRef.current) {
      return;
    }
    lastParamsRef.current = paramsString;

    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurches({
        ...params,
        signal: abortControllerRef.current.signal
      });

      setChurches(response.data || []);
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
        console.error('Error fetching churches:', err);
        setError(err.message || 'Error al cargar las iglesias');
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar las iglesias'
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una iglesia específica
   */
  const fetchChurch = useCallback(async (id) => {
    // Verificar cache
    const cacheKey = `church_${id}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) {
      setChurch(cached.data);
      return cached.data;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurchById(id);
      setChurch(response);

      // Guardar en cache
      cacheRef.current.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (err) {
      console.error('Error fetching church:', err);
      setError(err.message || 'Error al cargar la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva iglesia
   */
  const createChurch = useCallback(async (churchData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.createChurch(churchData);
      
      // Actualizar lista local
      setChurches(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia creada correctamente'
      });

      // Limpiar cache
      cacheRef.current.clear();

      return response;
    } catch (err) {
      console.error('Error creating church:', err);
      setError(err.message || 'Error al crear la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al crear la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar iglesia existente
   */
  const updateChurch = useCallback(async (id, churchData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.updateChurch(id, churchData);
      
      // Actualizar lista local
      setChurches(current =>
        current.map(church => church.id === id ? response : church)
      );
      
      // Actualizar iglesia individual si está cargada
      if (church?.id === id) {
        setChurch(response);
      }

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia actualizada correctamente'
      });

      // Limpiar cache
      cacheRef.current.delete(`church_${id}`);

      return response;
    } catch (err) {
      console.error('Error updating church:', err);
      setError(err.message || 'Error al actualizar la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al actualizar la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [church]);

  /**
   * Eliminar iglesia
   */
  const deleteChurch = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await churchesService.deleteChurch(id);
      
      // Actualizar lista local
      setChurches(current => current.filter(church => church.id !== id));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia eliminada correctamente'
      });

      // Limpiar cache
      cacheRef.current.delete(`church_${id}`);

      return true;
    } catch (err) {
      console.error('Error deleting church:', err);
      setError(err.message || 'Error al eliminar la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al eliminar la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar múltiples iglesias
   */
  const deleteMultipleChurches = useCallback(async (ids) => {
    setLoading(true);
    setError(null);

    try {
      await churchesService.deleteMultipleChurches(ids);
      
      // Actualizar lista local
      setChurches(current => current.filter(church => !ids.includes(church.id)));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${ids.length} iglesia(s) eliminada(s) correctamente`
      });

      // Limpiar cache
      ids.forEach(id => cacheRef.current.delete(`church_${id}`));

      return true;
    } catch (err) {
      console.error('Error deleting multiple churches:', err);
      setError(err.message || 'Error al eliminar las iglesias');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar las iglesias seleccionadas'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================== GESTIÓN DE ESTADOS =====================

  /**
   * Activar iglesia
   */
  const activateChurch = useCallback(async (id) => {
    try {
      const response = await churchesService.activateChurch(id);
      
      // Actualizar lista local
      setChurches(current =>
        current.map(church => 
          church.id === id ? { ...church, status: 'active' } : church
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia activada correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error activating church:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al activar la iglesia'
      });
      throw err;
    }
  }, []);

  /**
   * Desactivar iglesia
   */
  const deactivateChurch = useCallback(async (id) => {
    try {
      const response = await churchesService.deactivateChurch(id);
      
      // Actualizar lista local
      setChurches(current =>
        current.map(church => 
          church.id === id ? { ...church, status: 'inactive' } : church
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia desactivada correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error deactivating church:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al desactivar la iglesia'
      });
      throw err;
    }
  }, []);

  /**
   * Actualizar estado de iglesia
   */
  const updateChurchStatus = useCallback(async (id, status) => {
    try {
      const response = await churchesService.updateChurchStatus(id, status);
      
      // Actualizar lista local
      setChurches(current =>
        current.map(church => 
          church.id === id ? { ...church, status } : church
        )
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `Estado de la iglesia actualizado a ${status}`
      });

      return response;
    } catch (err) {
      console.error('Error updating church status:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar el estado de la iglesia'
      });
      throw err;
    }
  }, []);

  // ===================== LIDERAZGO Y PERSONAL =====================

  /**
   * Obtener líderes de una iglesia
   */
  const fetchChurchLeaders = useCallback(async (churchId, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurchLeaders(churchId, params);
      setChurchLeaders(response.data || []);
      return response;
    } catch (err) {
      console.error('Error fetching church leaders:', err);
      setError(err.message || 'Error al cargar los líderes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Asignar líder a iglesia
   */
  const assignLeaderToChurch = useCallback(async (churchId, leaderData) => {
    try {
      const response = await churchesService.assignLeaderToChurch(churchId, leaderData);
      
      // Actualizar lista local
      setChurchLeaders(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Líder asignado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error assigning leader:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al asignar el líder'
      });
      throw err;
    }
  }, []);

  /**
   * Remover líder de iglesia
   */
  const removeLeaderFromChurch = useCallback(async (churchId, leaderId) => {
    try {
      await churchesService.removeLeaderFromChurch(churchId, leaderId);
      
      // Actualizar lista local
      setChurchLeaders(current => 
        current.filter(leader => leader.id !== leaderId)
      );
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Líder removido correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error removing leader:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al remover el líder'
      });
      throw err;
    }
  }, []);

  // ===================== ESTADÍSTICAS =====================

  /**
   * Obtener estadísticas de una iglesia
   */
  const fetchChurchStatistics = useCallback(async (churchId, period = 'month') => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurchStatistics(churchId, period);
      setChurchStatistics(response);
      return response;
    } catch (err) {
      console.error('Error fetching church statistics:', err);
      setError(err.message || 'Error al cargar las estadísticas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener métricas de crecimiento
   */
  const fetchGrowthMetrics = useCallback(async (churchId, params = {}) => {
    try {
      const response = await churchesService.getChurchGrowthMetrics(churchId, params);
      setGrowthMetrics(response);
      return response;
    } catch (err) {
      console.error('Error fetching growth metrics:', err);
      throw err;
    }
  }, []);

  /**
   * Obtener estadísticas globales
   */
  const fetchGlobalStatistics = useCallback(async (params = {}) => {
    try {
      const response = await churchesService.getGlobalChurchStatistics(params);
      setGlobalStatistics(response);
      return response;
    } catch (err) {
      console.error('Error fetching global statistics:', err);
      throw err;
    }
  }, []);

  /**
   * Obtener ranking de iglesias
   */
  const fetchChurchRanking = useCallback(async (metric = 'members', period = 'month', limit = 10) => {
    try {
      const response = await churchesService.getChurchRanking(metric, period, limit);
      setChurchRanking(response);
      return response;
    } catch (err) {
      console.error('Error fetching church ranking:', err);
      throw err;
    }
  }, []);

  // ===================== MIEMBROS Y GRUPOS =====================

  /**
   * Obtener miembros de una iglesia
   */
  const fetchChurchMembers = useCallback(async (churchId, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurchMembers(churchId, params);
      setChurchMembers(response.data || []);
      return response;
    } catch (err) {
      console.error('Error fetching church members:', err);
      setError(err.message || 'Error al cargar los miembros');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener grupos de una iglesia
   */
  const fetchChurchGroups = useCallback(async (churchId, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurchGroups(churchId, params);
      setChurchGroups(response.data || []);
      return response;
    } catch (err) {
      console.error('Error fetching church groups:', err);
      setError(err.message || 'Error al cargar los grupos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Transferir miembro entre iglesias
   */
  const transferMember = useCallback(async (memberId, fromChurchId, toChurchId, transferData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.transferMember(memberId, fromChurchId, toChurchId, transferData);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Miembro transferido correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error transferring member:', err);
      setError(err.message || 'Error al transferir el miembro');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al transferir el miembro'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================== CONFIGURACIONES =====================

  /**
   * Obtener configuración de una iglesia
   */
  const fetchChurchConfiguration = useCallback(async (churchId) => {
    try {
      const response = await churchesService.getChurchConfiguration(churchId);
      setChurchConfiguration(response);
      return response;
    } catch (err) {
      console.error('Error fetching church configuration:', err);
      throw err;
    }
  }, []);

  /**
   * Actualizar configuración de iglesia
   */
  const updateChurchConfiguration = useCallback(async (churchId, configData) => {
    try {
      const response = await churchesService.updateChurchConfiguration(churchId, configData);
      setChurchConfiguration(response);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Configuración actualizada correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error updating church configuration:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar la configuración'
      });
      throw err;
    }
  }, []);

  /**
   * Obtener horarios de iglesia
   */
  const fetchChurchSchedules = useCallback(async (churchId) => {
    try {
      const response = await churchesService.getChurchSchedules(churchId);
      setChurchSchedules(response);
      return response;
    } catch (err) {
      console.error('Error fetching church schedules:', err);
      throw err;
    }
  }, []);

  /**
   * Actualizar horarios de iglesia
   */
  const updateChurchSchedules = useCallback(async (churchId, schedules) => {
    try {
      const response = await churchesService.updateChurchSchedules(churchId, schedules);
      setChurchSchedules(response);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Horarios actualizados correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error updating church schedules:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar los horarios'
      });
      throw err;
    }
  }, []);

  // ===================== ARCHIVOS Y LOGOS =====================

  /**
   * Subir logo de iglesia
   */
  const uploadChurchLogo = useCallback(async (churchId, logoFile) => {
    setUploading(true);
    
    try {
      const response = await churchesService.uploadChurchLogo(churchId, logoFile);
      
      // Actualizar iglesia local si está cargada
      if (church?.id === churchId) {
        setChurch(current => ({
          ...current,
          logoUrl: response.logoUrl
        }));
      }

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Logo subido correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error uploading church logo:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al subir el logo'
      });
      throw err;
    } finally {
      setUploading(false);
    }
  }, [church]);

  /**
   * Eliminar logo de iglesia
   */
  const deleteChurchLogo = useCallback(async (churchId) => {
    try {
      await churchesService.deleteChurchLogo(churchId);
      
      // Actualizar iglesia local si está cargada
      if (church?.id === churchId) {
        setChurch(current => ({
          ...current,
          logoUrl: null
        }));
      }

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Logo eliminado correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error deleting church logo:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al eliminar el logo'
      });
      throw err;
    }
  }, [church]);

  // ===================== EVENTOS =====================

  /**
   * Obtener eventos de una iglesia
   */
  const fetchChurchEvents = useCallback(async (churchId, params = {}) => {
    try {
      const response = await churchesService.getChurchEvents(churchId, params);
      setChurchEvents(response.data || []);
      return response;
    } catch (err) {
      console.error('Error fetching church events:', err);
      throw err;
    }
  }, []);

  /**
   * Crear evento para iglesia
   */
  const createChurchEvent = useCallback(async (churchId, eventData) => {
    try {
      const response = await churchesService.createChurchEvent(churchId, eventData);
      
      // Actualizar lista local
      setChurchEvents(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Evento creado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error creating church event:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al crear el evento'
      });
      throw err;
    }
  }, []);

  // ===================== EXPORTACIÓN E IMPORTACIÓN =====================

  /**
   * Exportar datos de iglesia
   */
  const exportChurchData = useCallback(async (churchId, exportType = 'complete', filters = {}) => {
    setExporting(true);
    
    try {
      const blob = await churchesService.exportChurchData(churchId, exportType, filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iglesia_${churchId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Datos exportados correctamente'
      });
    } catch (err) {
      console.error('Error exporting church data:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar los datos'
      });
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Exportar reporte de iglesia
   */
  const exportChurchReport = useCallback(async (churchId, reportType = 'summary', params = {}) => {
    setExporting(true);
    
    try {
      const blob = await churchesService.exportChurchReport(churchId, reportType, params);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_iglesia_${churchId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte exportado correctamente'
      });
    } catch (err) {
      console.error('Error exporting church report:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar el reporte'
      });
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Importar datos para iglesia
   */
  const importChurchData = useCallback(async (churchId, file, importType) => {
    setImporting(true);
    
    try {
      const response = await churchesService.importChurchData(churchId, file, importType);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `${response.imported} registro(s) importado(s) correctamente`
      });

      return response;
    } catch (err) {
      console.error('Error importing church data:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al importar los datos'
      });
      throw err;
    } finally {
      setImporting(false);
    }
  }, []);

  // ===================== BÚSQUEDA Y FILTROS =====================

  /**
   * Buscar iglesias
   */
  const searchChurches = useCallback(async (searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.searchChurches(searchParams);
      setChurches(response.data || []);
      return response;
    } catch (err) {
      console.error('Error searching churches:', err);
      setError(err.message || 'Error al buscar iglesias');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener iglesias cercanas
   */
  const fetchNearbyChurches = useCallback(async (latitude, longitude, radius = 10) => {
    try {
      const response = await churchesService.getNearbyChurches(latitude, longitude, radius);
      return response;
    } catch (err) {
      console.error('Error fetching nearby churches:', err);
      throw err;
    }
  }, []);

  /**
   * Obtener filtros disponibles
   */
  const fetchChurchFilters = useCallback(async () => {
    try {
      const response = await churchesService.getChurchFilters();
      setChurchFilters(response);
      return response;
    } catch (err) {
      console.error('Error fetching church filters:', err);
      throw err;
    }
  }, []);

  /**
   * Obtener iglesias del usuario
   */
  const fetchUserChurches = useCallback(async (userId = null) => {
    try {
      const response = await churchesService.getUserChurches(userId);
      setUserChurches(response);
      return response;
    } catch (err) {
      console.error('Error fetching user churches:', err);
      throw err;
    }
  }, []);

  // ===================== UTILIDADES Y LIMPIEZA =====================

  /**
   * Limpiar datos de iglesia
   */
  const clearChurch = useCallback(() => {
    setChurch(null);
    setChurchLeaders([]);
    setChurchMembers([]);
    setChurchGroups([]);
    setChurchStudents([]);
    setChurchEvents([]);
    setChurchStatistics(null);
    setChurchConfiguration(null);
    setChurchSchedules([]);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cancelar peticiones pendientes
   */
  const cancelRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Limpiar cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // ===================== VALORES COMPUTADOS =====================
  const computedValues = useMemo(() => ({
    // Estado general
    hasChurches: churches.length > 0,
    isEmpty: churches.length === 0 && !loading,
    isLoading: loading,
    isUploading: uploading,
    isExporting: exporting,
    isImporting: importing,
    hasError: !!error,
    
    // Contadores
    totalChurches: churches.length,
    activeChurches: churches.filter(c => c.status === 'active').length,
    inactiveChurches: churches.filter(c => c.status === 'inactive').length,
    totalLeaders: churchLeaders.length,
    totalMembers: churchMembers.length,
    totalGroups: churchGroups.length,
    totalEvents: churchEvents.length,
    
    // Estados específicos
    hasChurch: !!church,
    hasStatistics: !!churchStatistics,
    hasConfiguration: !!churchConfiguration,
    hasSchedules: churchSchedules.length > 0,
    hasFilters: !!churchFilters,
    hasUserChurches: userChurches.length > 0,
    
    // Datos auxiliares
    churchesWithLogo: churches.filter(c => c.logoUrl).length,
    recentEvents: churchEvents.filter(e => new Date(e.date) > new Date()).slice(0, 5)
  }), [
    churches, church, churchLeaders, churchMembers, churchGroups, churchEvents,
    churchStatistics, churchConfiguration, churchSchedules, churchFilters, userChurches,
    loading, uploading, exporting, importing, error
  ]);

  // ===================== RETURN HOOK =====================
  return {
    // ===================== ESTADO =====================
    churches,
    church,
    churchLeaders,
    churchMembers,
    churchGroups,
    churchStudents,
    churchEvents,
    userChurches,
    churchStatistics,
    growthMetrics,
    attendanceStats,
    baptismReport,
    financialSummary,
    globalStatistics,
    churchRanking,
    churchConfiguration,
    churchSchedules,
    churchFilters,
    userPermissions,
    pagination,
    
    // ===================== ESTADOS DE CARGA =====================
    loading,
    error,
    uploading,
    exporting,
    importing,
    
    // ===================== OPERACIONES CRUD =====================
    fetchChurches,
    fetchChurch,
    createChurch,
    updateChurch,
    deleteChurch,
    deleteMultipleChurches,
    
    // ===================== GESTIÓN DE ESTADOS =====================
    activateChurch,
    deactivateChurch,
    updateChurchStatus,
    
    // ===================== LIDERAZGO =====================
    fetchChurchLeaders,
    assignLeaderToChurch,
    removeLeaderFromChurch,
    
    // ===================== MIEMBROS Y GRUPOS =====================
    fetchChurchMembers,
    fetchChurchGroups,
    transferMember,
    
    // ===================== ESTADÍSTICAS =====================
    fetchChurchStatistics,
    fetchGrowthMetrics,
    fetchGlobalStatistics,
    fetchChurchRanking,
    
    // ===================== CONFIGURACIONES =====================
    fetchChurchConfiguration,
    updateChurchConfiguration,
    fetchChurchSchedules,
    updateChurchSchedules,
    
    // ===================== ARCHIVOS =====================
    uploadChurchLogo,
    deleteChurchLogo,
    
    // ===================== EVENTOS =====================
    fetchChurchEvents,
    createChurchEvent,
    
    // ===================== EXPORTACIÓN/IMPORTACIÓN =====================
    exportChurchData,
    exportChurchReport,
    importChurchData,
    
    // ===================== BÚSQUEDA =====================
    searchChurches,
    fetchNearbyChurches,
    fetchChurchFilters,
    fetchUserChurches,
    
    // ===================== UTILIDADES =====================
    clearChurch,
    clearError,
    cancelRequests,
    clearCache,
    
    // ===================== VALORES COMPUTADOS =====================
    ...computedValues
  };
};