/**
 * Constructor de Reportes - Permite crear reportes personalizados mediante interfaz drag & drop
 * Componente avanzado con visualización en tiempo real y configuraciones granulares
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useReports } from '@/hooks/useReports';
import  Button  from '@/components/common/Button';
import  Loading  from '@/components/common/Loading';
import { showNotification } from '@/utils/notifications';
import {
  FiPlus, FiTrash2, FiEye, FiSave, FiSettings, FiMove,
  FiBarChart, FiPieChart, FiTrendingUp, FiTable,
  FiFilter, FiCalendar, FiDatabase, FiLayers
} from 'react-icons/fi';
import styles from './ReportBuilder.module.css';

export const ReportBuilder = ({ reportId = null, onSave, onCancel }) => {
  // ===================== HOOKS =====================
  const {
    availableFields,
    aggregationFunctions,
    reportPreview,
    previewing,
    fetchAvailableFields,
    fetchAggregationFunctions,
    previewReport,
    createCustomReport,
    updateCustomReport
  } = useReports();

  // ===================== ESTADO PRINCIPAL =====================
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    category: 'custom',
    entity: 'members',
    fields: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    aggregations: [],
    chartType: 'table',
    chartConfig: {},
    layout: 'vertical',
    pageSize: 50,
    exportFormats: ['excel', 'pdf']
  });

  const [selectedEntity, setSelectedEntity] = useState('members');
  const [draggedField, setDraggedField] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ===================== ENTIDADES DISPONIBLES =====================
  const entities = [
    { key: 'members', label: 'Miembros', icon: <FiDatabase /> },
    { key: 'groups', label: 'Grupos', icon: <FiLayers /> },
    { key: 'students', label: 'Estudiantes Bíblicos', icon: <FiDatabase /> },
    { key: 'baptisms', label: 'Bautismos', icon: <FiDatabase /> },
    { key: 'metrics', label: 'Métricas', icon: <FiTrendingUp /> }
  ];

  // ===================== TIPOS DE GRÁFICO =====================
  const chartTypes = [
    { key: 'table', label: 'Tabla', icon: <FiTable /> },
    { key: 'bar', label: 'Barras', icon: <FiBarChart3 /> },
    { key: 'line', label: 'Líneas', icon: <FiTrendingUp /> },
    { key: 'pie', label: 'Circular', icon: <FiPieChart /> },
    { key: 'area', label: 'Área', icon: <FiTrendingUp /> },
    { key: 'donut', label: 'Donut', icon: <FiPieChart /> }
  ];

  // ===================== PASOS DEL CONSTRUCTOR =====================
  const steps = [
    { key: 'basic', label: 'Información Básica', icon: <FiSettings /> },
    { key: 'data', label: 'Selección de Datos', icon: <FiDatabase /> },
    { key: 'filters', label: 'Filtros', icon: <FiFilter /> },
    { key: 'visualization', label: 'Visualización', icon: <FiBarChart3 /> },
    { key: 'preview', label: 'Vista Previa', icon: <FiEye /> }
  ];

  // ===================== EFECTOS =====================
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedEntity) {
      fetchAvailableFields(selectedEntity);
    }
  }, [selectedEntity, fetchAvailableFields]);

  useEffect(() => {
    fetchAggregationFunctions();
  }, [fetchAggregationFunctions]);

  useEffect(() => {
    setHasChanges(true);
  }, [reportConfig]);

  // ===================== FUNCIONES PRINCIPALES =====================
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchAvailableFields('members'),
        fetchAggregationFunctions()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar los datos iniciales'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigChange = useCallback((key, value) => {
    setReportConfig(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handleFieldAdd = useCallback((field, category) => {
    if (!reportConfig[category].find(f => f.key === field.key)) {
      handleConfigChange(category, [...reportConfig[category], field]);
    }
  }, [reportConfig, handleConfigChange]);

  const handleFieldRemove = useCallback((fieldKey, category) => {
    handleConfigChange(category, reportConfig[category].filter(f => f.key !== fieldKey));
  }, [reportConfig, handleConfigChange]);

  const handleFilterAdd = useCallback(() => {
    const newFilter = {
      id: Date.now(),
      field: '',
      operator: 'equals',
      value: '',
      type: 'text'
    };
    handleConfigChange('filters', [...reportConfig.filters, newFilter]);
  }, [reportConfig.filters, handleConfigChange]);

  const handleFilterChange = useCallback((filterId, key, value) => {
    const updatedFilters = reportConfig.filters.map(filter => 
      filter.id === filterId ? { ...filter, [key]: value } : filter
    );
    handleConfigChange('filters', updatedFilters);
  }, [reportConfig.filters, handleConfigChange]);

  const handlePreviewReport = useCallback(async () => {
    if (!reportConfig.name || reportConfig.fields.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Datos Incompletos',
        message: 'Debes completar el nombre y seleccionar al menos un campo'
      });
      return;
    }

    try {
      await previewReport(reportConfig);
    } catch (error) {
      console.error('Error previewing report:', error);
    }
  }, [reportConfig, previewReport]);

  const handleSaveReport = useCallback(async () => {
    if (!reportConfig.name || reportConfig.fields.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Datos Incompletos',
        message: 'Debes completar todos los campos obligatorios'
      });
      return;
    }

    try {
      if (reportId) {
        await updateCustomReport(reportId, reportConfig);
      } else {
        await createCustomReport(reportConfig);
      }
      
      setHasChanges(false);
      onSave?.();
      
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: reportId ? 'Reporte actualizado correctamente' : 'Reporte creado correctamente'
      });
    } catch (error) {
      console.error('Error saving report:', error);
    }
  }, [reportConfig, reportId, updateCustomReport, createCustomReport, onSave]);

  // ===================== DRAG & DROP =====================
  const handleDragStart = useCallback((e, field) => {
    setDraggedField(field);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e, category) => {
    e.preventDefault();
    if (draggedField) {
      handleFieldAdd(draggedField, category);
      setDraggedField(null);
    }
  }, [draggedField, handleFieldAdd]);

  // ===================== COMPONENTES AUXILIARES =====================
  const StepIndicator = () => (
    <div className={styles.stepIndicator}>
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`${styles.step} ${index <= activeStep ? styles.active : ''} ${index === activeStep ? styles.current : ''}`}
          onClick={() => setActiveStep(index)}
        >
          <div className={styles.stepIcon}>
            {step.icon}
          </div>
          <span className={styles.stepLabel}>{step.label}</span>
        </div>
      ))}
    </div>
  );

  const FieldList = ({ title, fields, category, onRemove }) => (
    <div className={styles.fieldList}>
      <div className={styles.fieldListHeader}>
        <h4>{title}</h4>
        <span className={styles.fieldCount}>{fields.length}</span>
      </div>
      <div
        className={styles.dropZone}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, category)}
      >
        {fields.length === 0 ? (
          <div className={styles.emptyDropZone}>
            <FiMove />
            <span>Arrastra campos aquí</span>
          </div>
        ) : (
          fields.map(field => (
            <div key={field.key} className={styles.fieldItem}>
              <span className={styles.fieldName}>{field.label || field.key}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(field.key, category)}
                icon={<FiTrash2 />}
                className={styles.removeButton}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ===================== RENDERIZADO POR PASOS =====================
  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Información Básica
        return (
          <div className={styles.stepContent}>
            <h3>Información Básica del Reporte</h3>
            
            <div className={styles.formGroup}>
              <label>Nombre del Reporte *</label>
              <input
                type="text"
                value={reportConfig.name}
                onChange={(e) => handleConfigChange('name', e.target.value)}
                placeholder="Ej: Reporte de Crecimiento Mensual"
                className={styles.formControl}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Descripción</label>
              <textarea
                value={reportConfig.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                placeholder="Describe el propósito y contenido del reporte..."
                className={styles.formControl}
                rows={3}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Categoría</label>
                <select
                  value={reportConfig.category}
                  onChange={(e) => handleConfigChange('category', e.target.value)}
                  className={styles.formControl}
                >
                  <option value="custom">Personalizado</option>
                  <option value="membership">Membresía</option>
                  <option value="groups">Grupos</option>
                  <option value="students">Estudiantes</option>
                  <option value="baptisms">Bautismos</option>
                  <option value="metrics">Métricas</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Entidad Base *</label>
                <select
                  value={selectedEntity}
                  onChange={(e) => {
                    setSelectedEntity(e.target.value);
                    handleConfigChange('entity', e.target.value);
                  }}
                  className={styles.formControl}
                >
                  {entities.map(entity => (
                    <option key={entity.key} value={entity.key}>
                      {entity.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 1: // Selección de Datos
        return (
          <div className={styles.stepContent}>
            <h3>Selección de Campos de Datos</h3>
            
            <div className={styles.dataSelection}>
              <div className={styles.availableFields}>
                <h4>Campos Disponibles</h4>
                <div className={styles.fieldsContainer}>
                  {availableFields[selectedEntity]?.map(field => (
                    <div
                      key={field.key}
                      className={styles.availableField}
                      draggable
                      onDragStart={(e) => handleDragStart(e, field)}
                    >
                      <FiMove className={styles.dragHandle} />
                      <span>{field.label || field.key}</span>
                      <span className={styles.fieldType}>{field.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.selectedFields}>
                <FieldList
                  title="Campos Seleccionados"
                  fields={reportConfig.fields}
                  category="fields"
                  onRemove={handleFieldRemove}
                />

                <FieldList
                  title="Agrupar Por"
                  fields={reportConfig.groupBy}
                  category="groupBy"
                  onRemove={handleFieldRemove}
                />

                <FieldList
                  title="Ordenar Por"
                  fields={reportConfig.orderBy}
                  category="orderBy"
                  onRemove={handleFieldRemove}
                />
              </div>
            </div>
          </div>
        );

      case 2: // Filtros
        return (
          <div className={styles.stepContent}>
            <h3>Configuración de Filtros</h3>
            
            <div className={styles.filtersSection}>
              <div className={styles.filtersHeader}>
                <h4>Filtros Aplicados</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFilterAdd}
                  icon={<FiPlus />}
                >
                  Agregar Filtro
                </Button>
              </div>

              <div className={styles.filtersList}>
                {reportConfig.filters.map(filter => (
                  <div key={filter.id} className={styles.filterItem}>
                    <select
                      value={filter.field}
                      onChange={(e) => handleFilterChange(filter.id, 'field', e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="">Seleccionar campo</option>
                      {availableFields[selectedEntity]?.map(field => (
                        <option key={field.key} value={field.key}>
                          {field.label || field.key}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filter.operator}
                      onChange={(e) => handleFilterChange(filter.id, 'operator', e.target.value)}
                      className={styles.filterSelect}
                    >
                      <option value="equals">Igual a</option>
                      <option value="not_equals">Diferente de</option>
                      <option value="contains">Contiene</option>
                      <option value="starts_with">Empieza con</option>
                      <option value="ends_with">Termina con</option>
                      <option value="greater_than">Mayor que</option>
                      <option value="less_than">Menor que</option>
                      <option value="between">Entre</option>
                      <option value="in">En lista</option>
                    </select>

                    <input
                      type="text"
                      value={filter.value}
                      onChange={(e) => handleFilterChange(filter.id, 'value', e.target.value)}
                      placeholder="Valor del filtro"
                      className={styles.filterInput}
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFieldRemove(filter.id, 'filters')}
                      icon={<FiTrash2 />}
                      className={styles.removeFilterButton}
                    />
                  </div>
                ))}

                {reportConfig.filters.length === 0 && (
                  <div className={styles.noFilters}>
                    <p>No hay filtros configurados</p>
                    <p>Los filtros te permiten refinar los datos mostrados en el reporte</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 3: // Visualización
        return (
          <div className={styles.stepContent}>
            <h3>Configuración de Visualización</h3>
            
            <div className={styles.visualizationConfig}>
              <div className={styles.chartTypeSelection}>
                <h4>Tipo de Gráfico</h4>
                <div className={styles.chartTypes}>
                  {chartTypes.map(type => (
                    <div
                      key={type.key}
                      className={`${styles.chartType} ${reportConfig.chartType === type.key ? styles.selected : ''}`}
                      onClick={() => handleConfigChange('chartType', type.key)}
                    >
                      <div className={styles.chartIcon}>
                        {type.icon}
                      </div>
                      <span>{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.layoutOptions}>
                <div className={styles.formGroup}>
                  <label>Diseño</label>
                  <select
                    value={reportConfig.layout}
                    onChange={(e) => handleConfigChange('layout', e.target.value)}
                    className={styles.formControl}
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="grid">Cuadrícula</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Elementos por página</label>
                  <select
                    value={reportConfig.pageSize}
                    onChange={(e) => handleConfigChange('pageSize', parseInt(e.target.value))}
                    className={styles.formControl}
                  >
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={250}>250</option>
                    <option value={500}>500</option>
                  </select>
                </div>
              </div>

              <div className={styles.exportFormats}>
                <h4>Formatos de Exportación</h4>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={reportConfig.exportFormats.includes('excel')}
                      onChange={(e) => {
                        const formats = e.target.checked 
                          ? [...reportConfig.exportFormats, 'excel']
                          : reportConfig.exportFormats.filter(f => f !== 'excel');
                        handleConfigChange('exportFormats', formats);
                      }}
                    />
                    <span>Excel (.xlsx)</span>
                  </label>
                  
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={reportConfig.exportFormats.includes('pdf')}
                      onChange={(e) => {
                        const formats = e.target.checked 
                          ? [...reportConfig.exportFormats, 'pdf']
                          : reportConfig.exportFormats.filter(f => f !== 'pdf');
                        handleConfigChange('exportFormats', formats);
                      }}
                    />
                    <span>PDF</span>
                  </label>
                  
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={reportConfig.exportFormats.includes('csv')}
                      onChange={(e) => {
                        const formats = e.target.checked 
                          ? [...reportConfig.exportFormats, 'csv']
                          : reportConfig.exportFormats.filter(f => f !== 'csv');
                        handleConfigChange('exportFormats', formats);
                      }}
                    />
                    <span>CSV</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Vista Previa
        return (
          <div className={styles.stepContent}>
            <h3>Vista Previa del Reporte</h3>
            
            <div className={styles.previewSection}>
              <div className={styles.previewHeader}>
                <div className={styles.reportInfo}>
                  <h4>{reportConfig.name}</h4>
                  <p>{reportConfig.description}</p>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handlePreviewReport}
                  disabled={previewing}
                  icon={<FiEye />}
                >
                  {previewing ? 'Generando...' : 'Actualizar Vista Previa'}
                </Button>
              </div>

              <div className={styles.previewContent}>
                {previewing ? (
                  <div className={styles.previewLoading}>
                    <Loading size="large" message="Generando vista previa..." />
                  </div>
                ) : reportPreview ? (
                  <div className={styles.previewData}>
                    {/* Aquí se mostraría el preview real del reporte */}
                    <div className={styles.previewPlaceholder}>
                      <FiBarChart3 />
                      <h4>Vista Previa del Reporte</h4>
                      <p>Configuración completada correctamente</p>
                      <ul>
                        <li>Campos: {reportConfig.fields.length}</li>
                        <li>Filtros: {reportConfig.filters.length}</li>
                        <li>Tipo: {chartTypes.find(t => t.key === reportConfig.chartType)?.label}</li>
                        <li>Entidad: {entities.find(e => e.key === reportConfig.entity)?.label}</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className={styles.noPreview}>
                    <FiEye />
                    <p>Haz clic en "Actualizar Vista Previa" para ver el resultado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ===================== RENDER PRINCIPAL =====================
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" message="Cargando constructor de reportes..." />
      </div>
    );
  }

  return (
    <div className={styles.reportBuilder}>
      <div className={styles.builderHeader}>
        <h2>{reportId ? 'Editar Reporte' : 'Nuevo Reporte Personalizado'}</h2>
        <div className={styles.headerActions}>
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveReport}
            icon={<FiSave />}
            disabled={!reportConfig.name || reportConfig.fields.length === 0}
          >
            {reportId ? 'Actualizar' : 'Guardar'} Reporte
          </Button>
        </div>
      </div>

      <StepIndicator />

      <div className={styles.builderContent}>
        {renderStepContent()}
      </div>

      <div className={styles.builderFooter}>
        <div className={styles.stepNavigation}>
          <Button
            variant="ghost"
            onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
            disabled={activeStep === 0}
          >
            Anterior
          </Button>
          
          <span className={styles.stepCounter}>
            Paso {activeStep + 1} de {steps.length}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
            disabled={activeStep === steps.length - 1}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};