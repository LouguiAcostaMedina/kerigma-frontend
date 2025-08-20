/**
 * Hook personalizado para la gestión de reportes avanzados
 * Maneja el estado y operaciones de reportes personalizados y predefinidos
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { reportsService } from '@/services/reportsService';
import { showNotification } from '@/utils/notifications';

export const useReports = () => {
  // ===================== ESTADO PRINCIPAL =====================
  const [predefinedReports, setPredefinedReports] = useState([]);
  const [customReports, setCustomReports] = useState([]);
  const [sharedReports, setSharedReports] = useState([]);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [reportTemplates, setReportTemplates] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportPreview, setReportPreview] = useState(null);

  // ===================== ESTADO DE UI =====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // ===================== CONFIGURACIÓN Y DATOS AUXILIARES =====================
  const [availableFields, setAvailableFields] = useState({});
  const [aggregationFunctions, setAggregationFunctions] = useState([]);
  const [reportConfig, setReportConfig] = useState({});
  const [usageStats, setUsageStats] = useState(null);
  const [popularReports, setPopularReports] = useState([]);

  // ===================== REFERENCIAS Y CACHE =====================
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef({});

  // ===================== REPORTES PREDEFINIDOS =====================

  /**
   * Cargar reportes predefinidos
   */
  const fetchPredefinedReports = useCallback(async () => {
    // Evitar llamadas duplicadas
    const cacheKey = 'predefined_reports';
    const cached = cacheRef.current.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutos
      setPredefinedReports(cached.data);
      return cached.data;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.getPredefinedReports();
      setPredefinedReports(response);
      
      // Guardar en cache
      cacheRef.current.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });

      return response;
    } catch (err) {
      console.error('Error fetching predefined reports:', err);
      setError(err.message || 'Error al cargar los reportes predefinidos');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar los reportes predefinidos'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ejecutar reporte predefinido
   */
  const executePredefinedReport = useCallback(async (reportId, params = {}) => {
    setExecuting(true);
    setError(null);

    try {
      const response = await reportsService.executePredefinedReport(reportId, params);
      setReportData(response);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte ejecutado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error executing predefined report:', err);
      setError(err.message || 'Error al ejecutar el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al ejecutar el reporte'
      });
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  // ===================== REPORTES PERSONALIZADOS =====================

  /**
   * Cargar reportes personalizados
   */
  const fetchCustomReports = useCallback(async (params = {}) => {
    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.getCustomReports({
        ...params,
        signal: abortControllerRef.current.signal
      });
      
      setCustomReports(response.data || []);
      return response;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching custom reports:', err);
        setError(err.message || 'Error al cargar los reportes personalizados');
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'Error al cargar los reportes personalizados'
        });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear reporte personalizado
   */
  const createCustomReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.createCustomReport(reportData);
      
      // Actualizar lista local
      setCustomReports(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte creado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error creating custom report:', err);
      setError(err.message || 'Error al crear el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al crear el reporte'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar reporte personalizado
   */
  const updateCustomReport = useCallback(async (id, reportData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.updateCustomReport(id, reportData);
      
      // Actualizar lista local
      setCustomReports(current =>
        current.map(report => report.id === id ? response : report)
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte actualizado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error updating custom report:', err);
      setError(err.message || 'Error al actualizar el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al actualizar el reporte'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar reporte personalizado
   */
  const deleteCustomReport = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await reportsService.deleteCustomReport(id);
      
      // Actualizar lista local
      setCustomReports(current => current.filter(report => report.id !== id));
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte eliminado correctamente'
      });

      return true;
    } catch (err) {
      console.error('Error deleting custom report:', err);
      setError(err.message || 'Error al eliminar el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al eliminar el reporte'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Ejecutar reporte personalizado
   */
  const executeCustomReport = useCallback(async (id, params = {}) => {
    setExecuting(true);
    setError(null);

    try {
      const response = await reportsService.executeCustomReport(id, params);
      setReportData(response);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte ejecutado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error executing custom report:', err);
      setError(err.message || 'Error al ejecutar el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al ejecutar el reporte'
      });
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  // ===================== CONSTRUCTOR DE REPORTES =====================

  /**
   * Cargar campos disponibles para una entidad
   */
  const fetchAvailableFields = useCallback(async (entity) => {
    try {
      const response = await reportsService.getAvailableFields(entity);
      setAvailableFields(current => ({
        ...current,
        [entity]: response
      }));
      return response;
    } catch (err) {
      console.error('Error fetching available fields:', err);
      throw err;
    }
  }, []);

  /**
   * Cargar funciones de agregación
   */
  const fetchAggregationFunctions = useCallback(async () => {
    try {
      const response = await reportsService.getAggregationFunctions();
      setAggregationFunctions(response);
      return response;
    } catch (err) {
      console.error('Error fetching aggregation functions:', err);
      throw err;
    }
  }, []);

  /**
   * Previsualizar reporte
   */
  const previewReport = useCallback(async (reportConfig) => {
    setPreviewing(true);
    setError(null);

    try {
      const response = await reportsService.previewReport(reportConfig);
      setReportPreview(response);
      return response;
    } catch (err) {
      console.error('Error previewing report:', err);
      setError(err.message || 'Error al previsualizar el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al previsualizar el reporte'
      });
      throw err;
    } finally {
      setPreviewing(false);
    }
  }, []);

  // ===================== REPORTES DE MÉTRICAS =====================

  /**
   * Obtener reporte de crecimiento de membresía
   */
  const getMembershipGrowthReport = useCallback(async (params = {}) => {
    setExecuting(true);
    try {
      const response = await reportsService.getMembershipGrowthReport(params);
      setReportData(response);
      return response;
    } catch (err) {
      console.error('Error fetching membership growth report:', err);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  /**
   * Obtener reporte de actividad de grupos
   */
  const getGroupActivityReport = useCallback(async (params = {}) => {
    setExecuting(true);
    try {
      const response = await reportsService.getGroupActivityReport(params);
      setReportData(response);
      return response;
    } catch (err) {
      console.error('Error fetching group activity report:', err);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  /**
   * Obtener reporte de progreso de estudiantes bíblicos
   */
  const getBibleStudentProgressReport = useCallback(async (params = {}) => {
    setExecuting(true);
    try {
      const response = await reportsService.getBibleStudentProgressReport(params);
      setReportData(response);
      return response;
    } catch (err) {
      console.error('Error fetching bible student progress report:', err);
      throw err;
    } finally {
      setExecuting(false);
    }
  }, []);

  // ===================== EXPORTACIÓN =====================

  /**
   * Exportar reporte a Excel
   */
  const exportReportToExcel = useCallback(async (reportId, reportType = 'custom', params = {}) => {
    setExporting(true);
    
    try {
      const blob = await reportsService.exportReportToExcel(reportId, reportType, params);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reportId}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte exportado a Excel correctamente'
      });
    } catch (err) {
      console.error('Error exporting report to Excel:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar el reporte a Excel'
      });
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Exportar reporte a PDF
   */
  const exportReportToPDF = useCallback(async (reportId, reportType = 'custom', params = {}) => {
    setExporting(true);
    
    try {
      const blob = await reportsService.exportReportToPDF(reportId, reportType, params);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reportId}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte exportado a PDF correctamente'
      });
    } catch (err) {
      console.error('Error exporting report to PDF:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar el reporte a PDF'
      });
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Exportar gráfico como imagen
   */
  const exportChartAsImage = useCallback(async (chartConfig, format = 'png') => {
    setExporting(true);
    
    try {
      const blob = await reportsService.exportChartAsImage(chartConfig, format);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `grafico_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Gráfico exportado correctamente'
      });
    } catch (err) {
      console.error('Error exporting chart as image:', err);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al exportar el gráfico'
      });
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  // ===================== PROGRAMACIÓN DE REPORTES =====================

  /**
   * Programar reporte automático
   */
  const scheduleReport = useCallback(async (reportId, scheduleConfig) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.scheduleReport(reportId, scheduleConfig);
      
      // Actualizar lista local de reportes programados
      setScheduledReports(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte programado correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error scheduling report:', err);
      setError(err.message || 'Error al programar el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al programar el reporte'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar reportes programados
   */
  const fetchScheduledReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.getScheduledReports();
      setScheduledReports(response);
      return response;
    } catch (err) {
      console.error('Error fetching scheduled reports:', err);
      setError(err.message || 'Error al cargar los reportes programados');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar reporte programado
   */
  const cancelScheduledReport = useCallback(async (scheduleId) => {
    setLoading(true);
    setError(null);

    try {
      await reportsService.cancelScheduledReport(scheduleId);
      
      // Actualizar lista local
      setScheduledReports(current => 
        current.filter(report => report.id !== scheduleId)
      );
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Programación de reporte cancelada'
      });

      return true;
    } catch (err) {
      console.error('Error canceling scheduled report:', err);
      setError(err.message || 'Error al cancelar la programación');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cancelar la programación del reporte'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================== PLANTILLAS DE REPORTES =====================

  /**
   * Cargar plantillas de reportes
   */
  const fetchReportTemplates = useCallback(async (category = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.getReportTemplates(category);
      setReportTemplates(response);
      return response;
    } catch (err) {
      console.error('Error fetching report templates:', err);
      setError(err.message || 'Error al cargar las plantillas');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear reporte desde plantilla
   */
  const createReportFromTemplate = useCallback(async (templateId, customizations = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.createReportFromTemplate(templateId, customizations);
      
      // Actualizar lista de reportes personalizados
      setCustomReports(current => [response, ...current]);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte creado desde plantilla correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error creating report from template:', err);
      setError(err.message || 'Error al crear el reporte desde plantilla');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al crear el reporte desde plantilla'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================== ESTADÍSTICAS Y REPORTES POPULARES =====================

  /**
   * Cargar estadísticas de uso de reportes
   */
  const fetchUsageStats = useCallback(async (params = {}) => {
    try {
      const response = await reportsService.getReportUsageStats(params);
      setUsageStats(response);
      return response;
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      throw err;
    }
  }, []);

  /**
   * Cargar reportes populares
   */
  const fetchPopularReports = useCallback(async (limit = 10) => {
    try {
      const response = await reportsService.getPopularReports(limit);
      setPopularReports(response);
      return response;
    } catch (err) {
      console.error('Error fetching popular reports:', err);
      throw err;
    }
  }, []);

  // ===================== COMPARTIR REPORTES =====================

  /**
   * Compartir reporte con otros usuarios
   */
  const shareReport = useCallback(async (reportId, shareConfig) => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.shareReport(reportId, shareConfig);
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte compartido correctamente'
      });

      return response;
    } catch (err) {
      console.error('Error sharing report:', err);
      setError(err.message || 'Error al compartir el reporte');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al compartir el reporte'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar reportes compartidos conmigo
   */
  const fetchSharedReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.getSharedReports();
      setSharedReports(response);
      return response;
    } catch (err) {
      console.error('Error fetching shared reports:', err);
      setError(err.message || 'Error al cargar los reportes compartidos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================== UTILIDADES Y LIMPIEZA =====================

  /**
   * Limpiar datos de reporte actual
   */
  const clearReportData = useCallback(() => {
    setReportData(null);
    setReportPreview(null);
    setCurrentReport(null);
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
   * Actualizar configuración de reporte
   */
  const updateReportConfig = useCallback((newConfig) => {
    setReportConfig(current => ({
      ...current,
      ...newConfig
    }));
  }, []);

  // ===================== COMPUTED VALUES =====================

  /**
   * Valores computados para la UI
   */
  const computedValues = useMemo(() => ({
    // Estado general
    hasReports: customReports.length > 0 || predefinedReports.length > 0,
    isEmpty: customReports.length === 0 && predefinedReports.length === 0 && !loading,
    isLoading: loading,
    isExecuting: executing,
    isExporting: exporting,
    isPreviewing: previewing,
    hasError: !!error,
    
    // Contadores
    totalCustomReports: customReports.length,
    totalPredefinedReports: predefinedReports.length,
    totalSharedReports: sharedReports.length,
    totalScheduledReports: scheduledReports.length,
    totalTemplates: reportTemplates.length,
    
    // Estados específicos
    hasReportData: !!reportData,
    hasPreview: !!reportPreview,
    hasCurrentReport: !!currentReport,
    hasUsageStats: !!usageStats,
    hasPopularReports: popularReports.length > 0,
    
    // Configuración
    reportConfigComplete: reportConfig.title && reportConfig.fields && reportConfig.fields.length > 0
  }), [
    customReports, predefinedReports, sharedReports, scheduledReports, reportTemplates,
    loading, executing, exporting, previewing, error,
    reportData, reportPreview, currentReport, usageStats, popularReports, reportConfig
  ]);

  // ===================== RETURN HOOK =====================

  return {
    // ===================== ESTADO =====================
    predefinedReports,
    customReports,
    sharedReports,
    scheduledReports,
    reportTemplates,
    currentReport,
    reportData,
    reportPreview,
    availableFields,
    aggregationFunctions,
    reportConfig,
    usageStats,
    popularReports,
    
    // ===================== ESTADOS DE CARGA =====================
    loading,
    error,
    executing,
    exporting,
    previewing,
    
    // ===================== REPORTES PREDEFINIDOS =====================
    fetchPredefinedReports,
    executePredefinedReport,
    
    // ===================== REPORTES PERSONALIZADOS =====================
    fetchCustomReports,
    createCustomReport,
    updateCustomReport,
    deleteCustomReport,
    executeCustomReport,
    
    // ===================== CONSTRUCTOR DE REPORTES =====================
    fetchAvailableFields,
    fetchAggregationFunctions,
    previewReport,
    updateReportConfig,
    
    // ===================== REPORTES DE MÉTRICAS =====================
    getMembershipGrowthReport,
    getGroupActivityReport,
    getBibleStudentProgressReport,
    
    // ===================== EXPORTACIÓN =====================
    exportReportToExcel,
    exportReportToPDF,
    exportChartAsImage,
    
    // ===================== PROGRAMACIÓN =====================
    scheduleReport,
    fetchScheduledReports,
    cancelScheduledReport,
    
    // ===================== PLANTILLAS =====================
    fetchReportTemplates,
    createReportFromTemplate,
    
    // ===================== ESTADÍSTICAS =====================
    fetchUsageStats,
    fetchPopularReports,
    
    // ===================== COMPARTIR =====================
    shareReport,
    fetchSharedReports,
    
    // ===================== UTILIDADES =====================
    clearReportData,
    clearError,
    cancelRequests,
    
    // ===================== VALORES COMPUTADOS =====================
    ...computedValues
  };
};