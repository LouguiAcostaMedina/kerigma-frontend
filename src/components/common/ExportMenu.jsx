import React, { useState, useRef, useEffect } from 'react';
import { FaDownload, FaFileCsv, FaFileExcel, FaFilePdf, FaFileCode } from 'react-icons/fa';
import Button from './Button';
import './ExportMenu.css';

const FORMAT_CONFIG = {
  csv: { label: 'CSV', icon: FaFileCsv, mime: 'text/csv' },
  xlsx: { label: 'Excel', icon: FaFileExcel, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
  pdf: { label: 'PDF', icon: FaFilePdf, mime: 'application/pdf' },
  json: { label: 'JSON', icon: FaFileCode, mime: 'application/json' },
};

/**
 * Menú desplegable de exportación.
 * @param {object} props
 * @param {string[]} props.formats - Lista de formatos soportados ('csv'|'xlsx'|'pdf'|'json')
 * @param {(format: string) => void} props.onExport - Callback al seleccionar un formato
 * @param {string} [props.filename] - Nombre base del archivo (sin extensión)
 * @param {'small'|'medium'} [props.size='medium']
 */
export function ExportMenu({ formats = ['csv', 'xlsx', 'pdf', 'json'], onExport, size = 'medium' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="export-menu" ref={ref} onKeyDown={handleKeyDown}>
      <Button
        variant="outline"
        size={size}
        icon={<FaDownload />}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        Exportar
      </Button>
      {open && (
        <ul className="export-menu__list" role="listbox" aria-label="Formatos de exportación">
          {formats.map((fmt) => {
            const cfg = FORMAT_CONFIG[fmt];
            if (!cfg) return null;
            const Icon = cfg.icon;
            return (
              <li key={fmt} role="option" tabIndex={0}>
                <button
                  type="button"
                  className="export-menu__item"
                  onClick={() => { onExport(fmt); setOpen(false); }}
                  aria-label={`Exportar como ${cfg.label}`}
                >
                  <Icon className="export-menu__icon" />
                  <span>{cfg.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ExportMenu;
