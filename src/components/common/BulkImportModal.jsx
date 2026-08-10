import React, { useState, useRef } from 'react';
import Modal from '@/components/common/Modal';
import api from '@/services/api';
import { showNotification } from '@/utils/notifications';
import PropTypes from 'prop-types';
import './BulkImportModal.css';

const ENTITY_LABELS = {
  members: 'Miembros',
  students: 'Estudiantes Bíblicos',
  groups: 'Grupos',
  users: 'Usuarios',
};

const ENTITY_FIELDS = {
  members: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'maritalStatus', 'address', 'city', 'district', 'baptized', 'spiritualStatus', 'occupation', 'education', 'notes'],
  students: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'district', 'program', 'level', 'isBeliever', 'baptized', 'notes'],
  groups: ['name', 'description', 'type', 'category', 'meetingDay', 'meetingTime', 'meetingLocation', 'maxCapacity', 'isOpenToNewMembers'],
  users: ['firstName', 'lastName', 'email', 'password', 'role'],
};

const BulkImportModal = ({ isOpen, onClose, entity, groupId, onImported }) => {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState('select');
  const fileInputRef = useRef(null);

  const resetState = () => {
    setFile(null);
    setPreviewRows([]);
    setHeaders([]);
    setIsImporting(false);
    setResult(null);
    setStep('select');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (inQuotes) {
          if (ch === '"') {
            if (i + 1 < line.length && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            current += ch;
          }
        } else {
          if (ch === '"') {
            inQuotes = true;
          } else if (ch === ',') {
            result.push(current.trim());
            current = '';
          } else {
            current += ch;
          }
        }
      }
      result.push(current.trim());
      return result;
    };

    const parsedHeaders = parseLine(lines[0]);
    const parsedRows = lines.slice(1).map(line => {
      const values = parseLine(line);
      const obj = {};
      parsedHeaders.forEach((h, i) => {
        obj[h] = values[i] ?? '';
      });
      return obj;
    });

    return { headers: parsedHeaders, rows: parsedRows };
  };

  const parseExcel = async (arrayBuffer) => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    if (data.length === 0) return { headers: [], rows: [] };
    const cols = Object.keys(data[0]);
    return { headers: cols, rows: data };
  };

  const handleFileSelect = async (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);

    try {
      const ext = selected.name.split('.').pop().toLowerCase();
      let parsed;

      if (ext === 'csv' || ext === 'txt') {
        const text = await selected.text();
        parsed = parseCSV(text);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await selected.arrayBuffer();
        parsed = await parseExcel(buffer);
      } else {
        showNotification({ type: 'error', title: 'Formato no soportado', message: 'Use archivos .csv, .xlsx o .xls' });
        return;
      }

      setHeaders(parsed.headers);
      setPreviewRows(parsed.rows.slice(0, 5));
      setStep('preview');
    } catch {
      showNotification({ type: 'error', title: 'Error al leer el archivo', message: 'El archivo está dañado o tiene un formato incorrecto' });
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    try {
      const ext = file.name.split('.').pop().toLowerCase();
      let allRows;

      if (ext === 'csv' || ext === 'txt') {
        const text = await file.text();
        const parsed = parseCSV(text);
        allRows = parsed.rows;
      } else {
        const buffer = await file.arrayBuffer();
        const parsed = await parseExcel(buffer);
        allRows = parsed.rows;
      }

      const payload = {
        entity,
        rows: allRows,
      };

      if (groupId) {
        payload.groupId = groupId;
      }

      const response = await api.post('/import', payload);
      const data = response.data?.data ?? response.data;

      setResult(data);
      setStep('result');

      if (data.imported > 0) {
        showNotification({
          type: 'success',
          title: 'Importación completada',
          message: `${data.imported} registro(s) importado(s) correctamente`,
        });
        onImported?.();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error durante la importación';
      showNotification({ type: 'error', title: 'Error de importación', message: msg });
    } finally {
      setIsImporting(false);
    }
  };

  const requiredFields = ENTITY_FIELDS[entity] || [];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Importar ${ENTITY_LABELS[entity]}`} size="large">
      {step === 'select' && (
        <div className="bulk-import-select">
          <div className="import-info">
            <h4>Formato esperado</h4>
            <p>El archivo debe contener las siguientes columnas:</p>
            <div className="field-tags">
              {requiredFields.map(f => (
                <span key={f} className="field-tag">{f}</span>
              ))}
            </div>
            <p className="import-hint">Archivos soportados: <strong>.csv</strong>, <strong>.xlsx</strong>, <strong>.xls</strong></p>
          </div>

          <div
            className="drop-zone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped && fileInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(dropped);
                fileInputRef.current.files = dt.files;
                handleFileSelect({ target: { files: [dropped] } });
              }
            }}
          >
            <div className="drop-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="18" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="9,15 12,12 15,15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="drop-text">Arrastra un archivo aquí o haz clic para seleccionar</p>
            <p className="drop-sub">Máximo 500 filas por importación</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,.txt"
            onChange={handleFileSelect}
            className="file-input-hidden"
          />
        </div>
      )}

      {step === 'preview' && (
        <div className="bulk-import-preview">
          <div className="preview-header">
            <div className="preview-file-info">
              <span className="preview-file-name">{file?.name}</span>
              <span className="preview-row-count">{previewRows.length} de filas (vista previa)</span>
            </div>
            <div className="preview-actions">
              <button className="btn-secondary" onClick={() => { setStep('select'); setFile(null); }}>
                Cambiar archivo
              </button>
              <button className="btn-primary" onClick={handleImport} disabled={isImporting}>
                {isImporting ? 'Importando...' : `Importar ${previewRows.length}+ filas`}
              </button>
            </div>
          </div>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th className="row-num-col">#</th>
                  {headers.map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, i) => (
                  <tr key={i}>
                    <td className="row-num-col">{i + 1}</td>
                    {headers.map(h => (
                      <td key={h}>{String(row[h] ?? '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 'result' && result && (
        <div className="bulk-import-result">
          <div className="result-summary">
            <div className="result-stat result-stat--success">
              <span className="result-number">{result.imported}</span>
              <span className="result-label">Importados</span>
            </div>
            <div className="result-stat result-stat--skipped">
              <span className="result-number">{result.skipped}</span>
              <span className="result-label">Omitidos</span>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="result-errors">
              <h4>Errores encontrados:</h4>
              <div className="error-list">
                {result.errors.map((err, i) => (
                  <div key={i} className="error-item">
                    <span className="error-row">Fila {err.row}:</span>
                    <span className="error-message">{err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-actions">
            <button className="btn-primary" onClick={handleClose}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

BulkImportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entity: PropTypes.oneOf(['members', 'students', 'groups', 'users']).isRequired,
  groupId: PropTypes.string,
  onImported: PropTypes.func,
};

export default BulkImportModal;
