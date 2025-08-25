/**
 * Página principal del sistema de reportes avanzados
 * Permite visualizar, crear, ejecutar y gestionar reportes personalizados y predefinidos
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import  Button  from '@/components/common/Button';
import DataTable from '@/components/common/DataTable';
import Modal  from '@/components/common/Modal';
import Loading  from '@/components/common/Loading';
import { ReportBuilder } from '@/components/common/reports/ReportBuilder';
import  ChartExporter  from '@/components/common/reports/ChartExporter';
import { showNotification } from '@/utils/notifications';
import {
  FiFileText, FiPlus, FiPlay, FiDownload, FiCalendar, FiShare2,
  FiTrendingUp, FiBarChart, FiPieChart, FiActivity, FiClock,
  FiFilter, FiSearch, FiRefreshCw, FiLayers, FiBookOpen
} from 'react-icons/fi';
import styles from './Reports.module.css';

export const Reports = () => {
  // ===================== HOOKS =====================
  const {
    predefinedReports,
    customReports,
    sharedReports,
    scheduledReports,
    reportTemplates,
    reportData,
    loading,
    executing,
    exporting,
    hasReports,
    isEmpty,
    fetchPredefinedReports,
    fetchCustomReports,
    fetchSharedReports,
    fetchScheduledReports,
    fetchReportTemplates,
    executePredefinedReport,
    executeCustomReport,
    deleteCustomReport,
    exportReportToExcel,
    exportReportToPDF,
    scheduleReport,
    shareReport,
    clearReportData
  } = useReports();

  const { user, hasPermission } = useAuth();

  // ===================== ESTADO LOCAL =====================
  const [activeTab, setActiveTab] = useState('predefined');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateRange: '',
    author: ''
  });
  const [reportParams, setReportParams] = useState({});

  // ===================== EFECTOS =====================
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'predefined') {
      fetchPredefinedReports();
    } else if (activeTab === 'custom') {
      fetchCustomReports();
    } else if (activeTab === 'shared') {
      fetchSharedReports();
    } else if (activeTab === 'scheduled') {
      fetchScheduledReports();
    } else if (activeTab === 'templates') {
      fetchReportTemplates();
    }
  }, [activeTab]);

  // ===================== FUNCIONES =====================
  const loadInitialData = async () => {
    try {
      await Promise.all([
        fetchPredefinedReports(),
        fetchCustomReports()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleExecuteReport = useCallback(async (report, params = {}) => {
    try {
      setSelectedReport(report);
      setReportParams(params);
      
      if (report.type === 'predefined') {
        await executePredefinedReport(report.id, params);
      } else {
        await executeCustomReport(report.id, params);
      }
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte ejecutado correctamente'
      });
    } catch (error) {
      console.error('Error executing report:', error);
    }
  }, [executePredefinedReport, executeCustomReport]);

  const handleExportReport = useCallback(async (report, format) => {
    try {
      const reportType = report.type || 'custom';
      
      if (format === 'excel') {
        await exportReportToExcel(report.id, reportType, reportParams);
      } else if (format === 'pdf') {
        await exportReportToPDF(report.id, reportType, reportParams);
      }
      
      setShowExportOptions(false);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  }, [exportReportToExcel, exportReportToPDF, reportParams]);

  const handleDeleteReport = useCallback(async (reportId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este reporte?')) {
      return;
    }

    try {
      await deleteCustomReport(reportId);
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte eliminado correctamente'
      });
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  }, [deleteCustomReport]);

  const handleScheduleReport = useCallback(async (report, scheduleConfig) => {
    try {
      await scheduleReport(report.id, scheduleConfig);
      setShowScheduleModal(false);
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte programado correctamente'
      });
    } catch (error) {
      console.error('Error scheduling report:', error);
    }
  }, [scheduleReport]);

  const handleShareReport = useCallback(async (report, shareConfig) => {
    try {
      await shareReport(report.id, shareConfig);
      setShowShareModal(false);
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Reporte compartido correctamente'
      });
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  }, [shareReport]);

  // ===================== CONFIGURACIÓN DE TABLAS =====================
  const predefinedReportsColumns = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value, report) => (
        <div className={styles.reportName}>
          <div className={styles.reportIcon}>
            {getReportIcon(report.category)}
          </div>
          <div>
            <div className={styles.name}>{value}</div>
            <div className={styles.description}>{report.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Categoría',
      sortable: true,
      render: (value) => (
        <span className={`${styles.category} ${styles[value?.toLowerCase()]}`}>
          {value}
        </span>
      )
    },
    {
      key: 'lastExecuted',
      label: 'Última Ejecución',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Nunca'
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, report) => (
        <div className={styles.actionButtons}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExecuteReport(report)}
            disabled={executing}
            icon={<FiPlay />}
            title="Ejecutar reporte"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedReport(report);
              setShowExportOptions(true);
            }}
            disabled={exporting}
            icon={<FiDownload />}
            title="Exportar reporte"
          />
          {hasPermission(['admin', 'director']) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedReport(report);
                setShowScheduleModal(true);
              }}
              icon={<FiCalendar />}
              title="Programar reporte"
            />
          )}
        </div>
      )
    }
  ];

  const customReportsColumns = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value, report) => (
        <div className={styles.reportName}>
          <div className={styles.reportIcon}>
            <FiFileText />
          </div>
          <div>
            <div className={styles.name}>{value}</div>
            <div className={styles.description}>{report.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Creado por',
      sortable: true,
      render: (value) => value?.name || 'Usuario'
    },
    {
      key: 'createdAt',
      label: 'Creado',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'lastExecuted',
      label: 'Última Ejecución',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Nunca'
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_, report) => (
        <div className={styles.actionButtons}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleExecuteReport(report)}
            disabled={executing}
            icon={<FiPlay />}
            title="Ejecutar reporte"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedReport(report);
              setShowExportOptions(true);
            }}
            disabled={exporting}
            icon={<FiDownload />}
            title="Exportar reporte"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedReport(report);
              setShowShareModal(true);
            }}
            icon={<FiShare2 />}
            title="Compartir reporte"
          />
          {(report.author?.id === user?.id || hasPermission(['admin'])) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteReport(report.id)}
              icon={<FiTrash2 />}
              title="Eliminar reporte"
              className={styles.deleteButton}
            />
          )}
        </div>
      )
    }
  ];

  // ===================== UTILIDADES =====================
  const getReportIcon = (category) => {
    const icons = {
      'membership': <FiTrendingUp />,
      'groups': <FiBarChart3 />,
      'students': <FiBookOpen />,
      'baptisms': <FiActivity />,
      'metrics': <FiPieChart />
    };
    return icons[category] || <FiFileText />;
  };

  const getActiveReports = () => {
    switch (activeTab) {
      case 'predefined':
        return predefinedReports;
      case 'custom':
        return customReports;
      case 'shared':
        return sharedReports;
      case 'scheduled':
        return scheduledReports;
      case 'templates':
        return reportTemplates;
      default:
        return [];
    }
  };

  const getActiveColumns = () => {
    switch (activeTab) {
      case 'predefined':
        return predefinedReportsColumns;
      case 'custom':
        return customReportsColumns;
      default:
        return customReportsColumns;
    }
  };

  // ===================== RENDER =====================
  return (
    <div className={styles.reportsPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              <FiFileText className={styles.titleIcon} />
              Sistema de Reportes
            </h1>
            <p className={styles.subtitle}>
              Genera, personaliza y programa reportes avanzados para tu organización
            </p>
          </div>
          
          <div className={styles.headerActions}>
            <Button
              variant="ghost"
              icon={<FiRefreshCw />}
              onClick={loadInitialData}
              disabled={loading}
            >
              Actualizar
            </Button>
            
            {hasPermission(['admin', 'director', 'leader']) && (
              <Button
                variant="primary"
                icon={<FiPlus />}
                onClick={() => setShowReportBuilder(true)}
              >
                Crear Reporte
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={styles.navigation}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'predefined' ? styles.active : ''}`}
            onClick={() => setActiveTab('predefined')}
          >
            <FiTemplate />
            Predefinidos
            <span className={styles.badge}>{predefinedReports.length}</span>
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <FiFileText />
            Personalizados
            <span className={styles.badge}>{customReports.length}</span>
          </button>
          
          <button
            className={`${styles.tab} ${activeTab === 'shared' ? styles.active : ''}`}
            onClick={() => setActiveTab('shared')}
          >
            <FiShare2 />
            Compartidos
            <span className={styles.badge}>{sharedReports.length}</span>
          </button>
          
          {hasPermission(['admin', 'director']) && (
            <button
              className={`${styles.tab} ${activeTab === 'scheduled' ? styles.active : ''}`}
              onClick={() => setActiveTab('scheduled')}
            >
              <FiClock />
              Programados
              <span className={styles.badge}>{scheduledReports.length}</span>
            </button>
          )}
          
          <button
            className={`${styles.tab} ${activeTab === 'templates' ? styles.active : ''}`}
            onClick={() => setActiveTab('templates')}
          >
            <FiTemplate />
            Plantillas
            <span className={styles.badge}>{reportTemplates.length}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar reportes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className={styles.searchInput}
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="">Todas las categorías</option>
            <option value="membership">Membresía</option>
            <option value="groups">Grupos</option>
            <option value="students">Estudiantes</option>
            <option value="baptisms">Bautismos</option>
            <option value="metrics">Métricas</option>
          </select>
          
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="">Todos los períodos</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
            <option value="quarter">Este trimestre</option>
            <option value="year">Este año</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loading size="large" message="Cargando reportes..." />
          </div>
        ) : isEmpty ? (
          <div className={styles.emptyState}>
            <FiFileText className={styles.emptyIcon} />
            <h3>No hay reportes disponibles</h3>
            <p>Comienza creando tu primer reporte personalizado</p>
            {hasPermission(['admin', 'director', 'leader']) && (
              <Button
                variant="primary"
                icon={<FiPlus />}
                onClick={() => setShowReportBuilder(true)}
              >
                Crear Primer Reporte
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            data={getActiveReports()}
            columns={getActiveColumns()}
            searchable
            sortable
            pagination={{
              enabled: true,
              pageSize: 10
            }}
            className={styles.reportsTable}
          />
        )}
      </div>

      {/* Report Data Viewer */}
      {reportData && (
        <div className={styles.reportViewer}>
          <div className={styles.reportViewerHeader}>
            <h3>Resultado del Reporte: {selectedReport?.name}</h3>
            <Button
              variant="ghost"
              onClick={clearReportData}
              icon={<FiX />}
            />
          </div>
          
          <div className={styles.reportViewerContent}>
            <ChartExporter
              reportData={reportData}
              reportConfig={selectedReport}
              onExport={handleExportReport}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      {showReportBuilder && (
        <Modal
          isOpen={showReportBuilder}
          onClose={() => setShowReportBuilder(false)}
          title="Constructor de Reportes"
          size="xl"
        >
          <ReportBuilder
            onSave={() => {
              setShowReportBuilder(false);
              fetchCustomReports();
            }}
            onCancel={() => setShowReportBuilder(false)}
          />
        </Modal>
      )}

      {showExportOptions && selectedReport && (
        <Modal
          isOpen={showExportOptions}
          onClose={() => setShowExportOptions(false)}
          title="Exportar Reporte"
          size="sm"
        >
          <div className={styles.exportOptions}>
            <h4>Selecciona el formato de exportación:</h4>
            <div className={styles.exportButtons}>
              <Button
                variant="outline"
                icon={<FiDownload />}
                onClick={() => handleExportReport(selectedReport, 'excel')}
                disabled={exporting}
                className={styles.exportButton}
              >
                Exportar a Excel
              </Button>
              <Button
                variant="outline"
                icon={<FiDownload />}
                onClick={() => handleExportReport(selectedReport, 'pdf')}
                disabled={exporting}
                className={styles.exportButton}
              >
                Exportar a PDF
              </Button>
            </div>
            
            <div className={styles.exportActions}>
              <Button
                variant="ghost"
                onClick={() => setShowExportOptions(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showScheduleModal && selectedReport && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Programar Reporte"
          size="md"
        >
          <ScheduleReportForm
            report={selectedReport}
            onSchedule={handleScheduleReport}
            onCancel={() => setShowScheduleModal(false)}
          />
        </Modal>
      )}

      {showShareModal && selectedReport && (
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="Compartir Reporte"
          size="md"
        >
          <ShareReportForm
            report={selectedReport}
            onShare={handleShareReport}
            onCancel={() => setShowShareModal(false)}
          />
        </Modal>
      )}
    </div>
  );
};

// ===================== COMPONENTES AUXILIARES =====================

/**
 * Formulario para programar reportes automáticos
 */
const ScheduleReportForm = ({ report, onSchedule, onCancel }) => {
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    timezone: 'America/Lima',
    recipients: '',
    format: 'excel',
    active: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSchedule(report, scheduleConfig);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.scheduleForm}>
      <div className={styles.formGroup}>
        <label>Frecuencia</label>
        <select
          value={scheduleConfig.frequency}
          onChange={(e) => setScheduleConfig({ ...scheduleConfig, frequency: e.target.value })}
          className={styles.formControl}
        >
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensual</option>
          <option value="quarterly">Trimestral</option>
        </select>
      </div>

      {scheduleConfig.frequency === 'weekly' && (
        <div className={styles.formGroup}>
          <label>Día de la semana</label>
          <select
            value={scheduleConfig.dayOfWeek}
            onChange={(e) => setScheduleConfig({ ...scheduleConfig, dayOfWeek: parseInt(e.target.value) })}
            className={styles.formControl}
          >
            <option value={1}>Lunes</option>
            <option value={2}>Martes</option>
            <option value={3}>Miércoles</option>
            <option value={4}>Jueves</option>
            <option value={5}>Viernes</option>
            <option value={6}>Sábado</option>
            <option value={0}>Domingo</option>
          </select>
        </div>
      )}

      {scheduleConfig.frequency === 'monthly' && (
        <div className={styles.formGroup}>
          <label>Día del mes</label>
          <input
            type="number"
            min="1"
            max="28"
            value={scheduleConfig.dayOfMonth}
            onChange={(e) => setScheduleConfig({ ...scheduleConfig, dayOfMonth: parseInt(e.target.value) })}
            className={styles.formControl}
          />
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Hora</label>
        <input
          type="time"
          value={scheduleConfig.time}
          onChange={(e) => setScheduleConfig({ ...scheduleConfig, time: e.target.value })}
          className={styles.formControl}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Destinatarios (emails separados por comas)</label>
        <textarea
          value={scheduleConfig.recipients}
          onChange={(e) => setScheduleConfig({ ...scheduleConfig, recipients: e.target.value })}
          placeholder="email1@ejemplo.com, email2@ejemplo.com"
          className={styles.formControl}
          rows={3}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Formato</label>
        <select
          value={scheduleConfig.format}
          onChange={(e) => setScheduleConfig({ ...scheduleConfig, format: e.target.value })}
          className={styles.formControl}
        >
          <option value="excel">Excel</option>
          <option value="pdf">PDF</option>
        </select>
      </div>

      <div className={styles.formActions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Programar Reporte
        </Button>
      </div>
    </form>
  );
};

/**
 * Formulario para compartir reportes con otros usuarios
 */
const ShareReportForm = ({ report, onShare, onCancel }) => {
  const [shareConfig, setShareConfig] = useState({
    users: '',
    permissions: 'read',
    expiresAt: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onShare(report, shareConfig);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.shareForm}>
      <div className={styles.formGroup}>
        <label>Usuarios (emails separados por comas)</label>
        <textarea
          value={shareConfig.users}
          onChange={(e) => setShareConfig({ ...shareConfig, users: e.target.value })}
          placeholder="usuario1@ejemplo.com, usuario2@ejemplo.com"
          className={styles.formControl}
          rows={3}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Permisos</label>
        <select
          value={shareConfig.permissions}
          onChange={(e) => setShareConfig({ ...shareConfig, permissions: e.target.value })}
          className={styles.formControl}
        >
          <option value="read">Solo lectura</option>
          <option value="execute">Lectura y ejecución</option>
          <option value="edit">Lectura, ejecución y edición</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Fecha de expiración (opcional)</label>
        <input
          type="date"
          value={shareConfig.expiresAt}
          onChange={(e) => setShareConfig({ ...shareConfig, expiresAt: e.target.value })}
          className={styles.formControl}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Mensaje (opcional)</label>
        <textarea
          value={shareConfig.message}
          onChange={(e) => setShareConfig({ ...shareConfig, message: e.target.value })}
          placeholder="Mensaje personalizado para los usuarios..."
          className={styles.formControl}
          rows={3}
        />
      </div>

      <div className={styles.formActions}>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button variant="primary" type="submit">
          Compartir Reporte
        </Button>
      </div>
    </form>
  );
};
export default Reports;