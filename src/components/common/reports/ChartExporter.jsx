/**
 * Componente para exportar gráficos en múltiples formatos
 * Soporta PNG, JPEG, SVG, PDF y configuraciones avanzadas
 */

import React, { useState, useRef } from 'react';
import { FaDownload, FaImage, FaFilePdf, FaCog, FaPalette, FaRuler } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Button from '@/components/common/Button';;
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { showNotification } from '@/utils/notifications';
import styles from './ChartExporter.module.css';

const ChartExporter = ({ 
  chartRef, 
  chartTitle = 'Gráfico',
  defaultFormat = 'png',
  onExportComplete,
  buttonVariant = 'outline',
  buttonSize = 'sm',
  showLabel = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    format: defaultFormat,
    quality: 0.9,
    width: 800,
    height: 600,
    background: 'white',
    includeLogo: false,
    includeTimestamp: true,
    filename: chartTitle.toLowerCase().replace(/\s+/g, '-'),
    dpi: 300
  });

  const canvasRef = useRef(null);

  // Formatos de exportación disponibles
  const exportFormats = [
    { value: 'png', label: 'PNG', description: 'Imagen con transparencia' },
    { value: 'jpeg', label: 'JPEG', description: 'Imagen comprimida' },
    { value: 'svg', label: 'SVG', description: 'Gráfico vectorial' },
    { value: 'pdf', label: 'PDF', description: 'Documento portable' }
  ];

  const backgroundOptions = [
    { value: 'white', label: 'Blanco', color: '#ffffff' },
    { value: 'transparent', label: 'Transparente', color: 'transparent' },
    { value: 'dark', label: 'Oscuro', color: '#1f2937' },
    { value: 'custom', label: 'Personalizado', color: exportConfig.customBackground || '#ffffff' }
  ];

  const presetSizes = [
    { label: 'HD (1280x720)', width: 1280, height: 720 },
    { label: 'Full HD (1920x1080)', width: 1920, height: 1080 },
    { label: 'Presentación (1024x768)', width: 1024, height: 768 },
    { label: 'Cuadrado (800x800)', width: 800, height: 800 },
    { label: 'Social Media (1200x630)', width: 1200, height: 630 },
    { label: 'Personalizado', width: exportConfig.width, height: exportConfig.height }
  ];

  // Exportar gráfico
  const exportChart = async (customConfig = {}) => {
    if (!chartRef?.current) {
      showNotification('No se encontró el gráfico para exportar', 'error');
      return;
    }

    setIsExporting(true);

    try {
      const config = { ...exportConfig, ...customConfig };
      const element = chartRef.current;

      // Preparar elemento para exportación
      const originalStyles = prepareElementForExport(element, config);

      let result;

      switch (config.format) {
        case 'png':
        case 'jpeg':
          result = await exportAsImage(element, config);
          break;
        case 'svg':
          result = await exportAsSVG(element, config);
          break;
        case 'pdf':
          result = await exportAsPDF(element, config);
          break;
        default:
          throw new Error('Formato no soportado');
      }

      // Restaurar estilos originales
      restoreElementStyles(element, originalStyles);

      // Descargar archivo
      downloadFile(result.data, result.filename, result.mimeType);

      showNotification('Gráfico exportado exitosamente', 'success');
      onExportComplete && onExportComplete(result);
      
    } catch (error) {
      console.error('Error exporting chart:', error);
      showNotification(error.message || 'Error al exportar gráfico', 'error');
    } finally {
      setIsExporting(false);
      setShowModal(false);
    }
  };

  // Preparar elemento para exportación
  const prepareElementForExport = (element, config) => {
    const originalStyles = {
      width: element.style.width,
      height: element.style.height,
      backgroundColor: element.style.backgroundColor
    };

    // Aplicar configuraciones temporales
    if (config.width && config.height) {
      element.style.width = `${config.width}px`;
      element.style.height = `${config.height}px`;
    }

    if (config.background && config.background !== 'transparent') {
      const bgColor = config.background === 'custom' ? config.customBackground : 
                     backgroundOptions.find(opt => opt.value === config.background)?.color;
      if (bgColor) {
        element.style.backgroundColor = bgColor;
      }
    }

    return originalStyles;
  };

  // Restaurar estilos del elemento
  const restoreElementStyles = (element, originalStyles) => {
    element.style.width = originalStyles.width;
    element.style.height = originalStyles.height;
    element.style.backgroundColor = originalStyles.backgroundColor;
  };

  // Exportar como imagen
  const exportAsImage = async (element, config) => {
    const canvas = await html2canvas(element, {
      width: config.width,
      height: config.height,
      scale: config.dpi / 96, // Convertir DPI a escala
      backgroundColor: config.background === 'transparent' ? null : 
                      config.background === 'custom' ? config.customBackground :
                      backgroundOptions.find(opt => opt.value === config.background)?.color,
      useCORS: true,
      allowTaint: true,
      logging: false
    });

    const dataUrl = canvas.toDataURL(
      `image/${config.format}`,
      config.format === 'jpeg' ? config.quality : undefined
    );

    const timestamp = config.includeTimestamp ? `-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}` : '';
    const filename = `${config.filename}${timestamp}.${config.format}`;

    return {
      data: dataUrl,
      filename,
      mimeType: `image/${config.format}`
    };
  };

  // Exportar como SVG
  const exportAsSVG = async (element, config) => {
    // Para SVG necesitaríamos una implementación más compleja
    // Por ahora, convertiremos a SVG a través de canvas
    const canvas = await html2canvas(element, {
      width: config.width,
      height: config.height,
      backgroundColor: config.background === 'transparent' ? null : 
                      backgroundOptions.find(opt => opt.value === config.background)?.color
    });

    // Crear SVG básico con la imagen
    const svgString = `
      <svg width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">
        <image href="${canvas.toDataURL()}" width="${config.width}" height="${config.height}"/>
      </svg>
    `;

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const dataUrl = URL.createObjectURL(blob);

    const timestamp = config.includeTimestamp ? `-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}` : '';
    const filename = `${config.filename}${timestamp}.svg`;

    return {
      data: dataUrl,
      filename,
      mimeType: 'image/svg+xml'
    };
  };

  // Exportar como PDF
  const exportAsPDF = async (element, config) => {
    const canvas = await html2canvas(element, {
      width: config.width,
      height: config.height,
      scale: 2,
      backgroundColor: config.background === 'transparent' ? 'white' : 
                      backgroundOptions.find(opt => opt.value === config.background)?.color
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Crear PDF
    const pdf = new jsPDF({
      orientation: config.width > config.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [config.width, config.height]
    });

    // Agregar título si se especifica
    if (config.includeTimestamp) {
      pdf.setFontSize(16);
      pdf.text(chartTitle, 20, 30);
      pdf.text(`Generado: ${new Date().toLocaleString()}`, 20, 50);
      pdf.addImage(imgData, 'PNG', 0, 70, config.width, config.height - 70);
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, config.width, config.height);
    }

    const pdfBlob = pdf.output('blob');
    const dataUrl = URL.createObjectURL(pdfBlob);

    const timestamp = config.includeTimestamp ? `-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}` : '';
    const filename = `${config.filename}${timestamp}.pdf`;

    return {
      data: dataUrl,
      filename,
      mimeType: 'application/pdf'
    };
  };

  // Descargar archivo
  const downloadFile = (dataUrl, filename, mimeType) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar URL si es blob
    if (dataUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(dataUrl), 1000);
    }
  };

  // Exportación rápida
  const quickExport = (format) => {
    exportChart({ format });
  };

  // Manejar cambio de configuración
  const handleConfigChange = (key, value) => {
    setExportConfig(prev => ({ ...prev, [key]: value }));
  };

  // Aplicar tamaño predefinido
  const applyPresetSize = (preset) => {
    if (preset.label === 'Personalizado') return;
    
    setExportConfig(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height
    }));
  };

  return (
    <>
      <div className={styles.chartExporter}>
        {/* Botón principal de exportación */}
        <div className={styles.exportButtons}>
          <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={() => quickExport('png')}
            icon={<FaImage />}
            disabled={isExporting}
            title="Exportar como PNG"
          >
            {showLabel && 'PNG'}
          </Button>

          <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={() => quickExport('pdf')}
            icon={<FaFilePdf />}
            disabled={isExporting}
            title="Exportar como PDF"
          >
            {showLabel && 'PDF'}
          </Button>

          <Button
            variant={buttonVariant}
            size={buttonSize}
            onClick={() => setShowModal(true)}
            icon={<FaCog />}
            disabled={isExporting}
            title="Configuración avanzada"
          >
            {showLabel && 'Más opciones'}
          </Button>
        </div>

        {isExporting && <Loading size="sm" />}
      </div>

      {/* Modal de configuración avanzada */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Configuración de Exportación"
        size="medium"
      >
        <div className={styles.exportConfig}>
          {/* Formato */}
          <div className={styles.configSection}>
            <h4>Formato de Exportación</h4>
            <div className={styles.formatGrid}>
              {exportFormats.map((format) => (
                <label key={format.value} className={styles.formatOption}>
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportConfig.format === format.value}
                    onChange={(e) => handleConfigChange('format', e.target.value)}
                  />
                  <div className={styles.formatCard}>
                    <div className={styles.formatLabel}>{format.label}</div>
                    <div className={styles.formatDesc}>{format.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensiones */}
          <div className={styles.configSection}>
            <h4><FaRuler /> Dimensiones</h4>
            <div className={styles.presetsGrid}>
              {presetSizes.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className={`${styles.presetButton} ${
                    exportConfig.width === preset.width && exportConfig.height === preset.height
                      ? styles.active : ''
                  }`}
                  onClick={() => applyPresetSize(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className={styles.dimensionsInputs}>
              <div className={styles.inputGroup}>
                <label>Ancho (px)</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={exportConfig.width}
                  onChange={(e) => handleConfigChange('width', parseInt(e.target.value))}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Alto (px)</label>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  value={exportConfig.height}
                  onChange={(e) => handleConfigChange('height', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Fondo */}
          <div className={styles.configSection}>
            <h4><FaPalette /> Fondo</h4>
            <div className={styles.backgroundOptions}>
              {backgroundOptions.map((bg) => (
                <label key={bg.value} className={styles.backgroundOption}>
                  <input
                    type="radio"
                    name="background"
                    value={bg.value}
                    checked={exportConfig.background === bg.value}
                    onChange={(e) => handleConfigChange('background', e.target.value)}
                  />
                  <div className={styles.backgroundPreview}>
                    <div 
                      className={styles.backgroundColor}
                      style={{ 
                        backgroundColor: bg.color,
                        backgroundImage: bg.value === 'transparent' ? 
                          'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 
                          'none',
                        backgroundSize: '10px 10px',
                        backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px'
                      }}
                    />
                    <span>{bg.label}</span>
                  </div>
                </label>
              ))}
            </div>

            {exportConfig.background === 'custom' && (
              <div className={styles.customColorInput}>
                <label>Color personalizado:</label>
                <input
                  type="color"
                  value={exportConfig.customBackground || '#ffffff'}
                  onChange={(e) => handleConfigChange('customBackground', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Configuraciones adicionales */}
          <div className={styles.configSection}>
            <h4>Configuraciones Adicionales</h4>
            
            {(exportConfig.format === 'png' || exportConfig.format === 'jpeg') && (
              <>
                <div className={styles.inputGroup}>
                  <label>DPI</label>
                  <select
                    value={exportConfig.dpi}
                    onChange={(e) => handleConfigChange('dpi', parseInt(e.target.value))}
                  >
                    <option value="72">72 DPI (Web)</option>
                    <option value="150">150 DPI (Estándar)</option>
                    <option value="300">300 DPI (Alta calidad)</option>
                  </select>
                </div>

                {exportConfig.format === 'jpeg' && (
                  <div className={styles.inputGroup}>
                    <label>Calidad ({Math.round(exportConfig.quality * 100)}%)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={exportConfig.quality}
                      onChange={(e) => handleConfigChange('quality', parseFloat(e.target.value))}
                    />
                  </div>
                )}
              </>
            )}

            <div className={styles.inputGroup}>
              <label>Nombre del archivo</label>
              <input
                type="text"
                value={exportConfig.filename}
                onChange={(e) => handleConfigChange('filename', e.target.value)}
                placeholder="nombre-del-archivo"
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={exportConfig.includeTimestamp}
                  onChange={(e) => handleConfigChange('includeTimestamp', e.target.checked)}
                />
                Incluir fecha y hora en el nombre del archivo
              </label>
            </div>

            {exportConfig.format === 'pdf' && (
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={exportConfig.includeLogo}
                    onChange={(e) => handleConfigChange('includeLogo', e.target.checked)}
                  />
                  Incluir logo y metadatos en el PDF
                </label>
              </div>
            )}
          </div>

          {/* Vista previa */}
          <div className={styles.configSection}>
            <h4>Vista Previa</h4>
            <div className={styles.preview}>
              <div className={styles.previewInfo}>
                <div><strong>Formato:</strong> {exportConfig.format.toUpperCase()}</div>
                <div><strong>Dimensiones:</strong> {exportConfig.width} × {exportConfig.height}px</div>
                <div><strong>Nombre:</strong> {exportConfig.filename}{exportConfig.includeTimestamp ? '-YYYY-MM-DD-HH-mm-ss' : ''}.{exportConfig.format}</div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className={styles.modalActions}>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => exportChart()}
              disabled={isExporting}
              loading={isExporting}
              icon={<FaDownload />}
            >
              Exportar Gráfico
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ChartExporter;