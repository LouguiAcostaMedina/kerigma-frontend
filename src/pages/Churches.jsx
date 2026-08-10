/**
 * Página de gestión de iglesias del sistema
 * Permite CRUD completo, gestión de líderes, estadísticas y configuraciones
 *
 * Notas de implementación:
 * - Este archivo reemplaza y completa la versión parcial que se detuvo cerca de la
 *   definición de columnas (members). Se incluyó la tabla, vista de tarjetas,
 *   filtros avanzados, exportaciones (CSV, JSON, PDF placeholder), atajos de
 *   teclado, selección múltiple, acciones en lote y soporte para vistas guardadas.
 * - Mantiene compatibilidad con los hooks y componentes existentes:
 *   useChurches, useAuth, DataTable, Modal, Button, Loading, ChurchForm,
 *   ChurchStats, ChurchDashboard.
 * - No elimina nada de tu lógica anterior: solo añade y robustece.
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  FaChurch,
  FaPlus,
  FaFilter,
  FaDownload,
  FaEdit,
  FaEye,
  FaTrash,
  FaUsers,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaChartBar,
  FaSearch,
  FaCog,
  FaUser,
  FaTimes,
  FaSync,
  FaSave,
  FaFolderOpen,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
} from 'react-icons/fa';
import { useChurches } from '../hooks/useChurches';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import {ChurchForm} from '../components/forms/ChurchForm';
import {ChurchStats} from '../components/forms/ChurchStats';
import {ChurchDashboard} from '../components/dashboard/ChurchDashboard';
import styles from './Churches.module.css';

/**
 * Util: formateo de fecha seguro
 */
const fmtDate = (d) => {
  try {
    if (!d) return 'No especificada';
    const dt = typeof d === 'string' || typeof d === 'number' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return 'No especificada';
    return dt.toLocaleDateString();
  } catch {
    return 'No especificada';
  }
};

/**
 * Util: etiqueta por estado
 */
const getStatusLabel = (status) => {
  const statusLabels = {
    active: 'Activa',
    inactive: 'Inactiva',
    construction: 'En construcción',
    suspended: 'Suspendida',
  };
  return statusLabels[status] || status || '—';
};

/**
 * Util: debounce de cambios (para búsqueda)
 */
const useDebounced = (value, delay = 400) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
};

/**
 * Util: exportar a CSV
 */
const exportToCSV = (rows, filename = 'iglesias.csv') => {
  if (!Array.isArray(rows) || rows.length === 0) {
    // Generar CSV vacío con encabezados mínimos
    const blob = new Blob(['name,code,city,state,status,memberCount,activeMembers\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  const headers = [
    'name',
    'code',
    'address',
    'city',
    'state',
    'phone',
    'email',
    'status',
    'memberCount',
    'activeMembers',
    'foundedDate',
  ];
  const esc = (s) => {
    if (s === undefined || s === null) return '';
    const str = String(s).replaceAll('"', '""');
    if (str.includes(',') || str.includes('\n')) return `"${str}"`;
    return str;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    const row = headers.map((h) => esc(h === 'foundedDate' ? fmtDate(r[h]) : r[h]));
    lines.push(row.join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Util: exportar a JSON
 */
const exportToJSON = (rows, filename = 'iglesias.json') => {
  const pretty = JSON.stringify(rows ?? [], null, 2);
  const blob = new Blob([pretty], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Util: placeholder para exportar a PDF.
 * Si ya tienes un servicio backend que genera PDF, reemplaza esta función
 * por la llamada al servicio y descarga el archivo.
 */
const exportToPDF = async (rows, filename = 'iglesias.pdf') => {
  // Placeholder: crea un PDF mínimo como blob (texto plano). Sustituir por lib real.
  const content = `IGLESIAS (RESUMEN)\n\n${(rows || [])
    .map((r, i) => `${i + 1}. ${r.name} — ${r.city}, ${r.state} — ${getStatusLabel(r.status)} — ${r.memberCount || 0} miembros`)
    .join('\n')}`;
  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Vistas guardadas en localStorage (filtros + orden + vista)
 */
const SAVED_VIEWS_KEY = 'churches.savedViews.v1';
const loadSavedViews = () => {
  try {
    const raw = localStorage.getItem(SAVED_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const saveSavedViews = (views) => {
  try {
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(views || []));
  } catch {
    // ignore
  }
};

const Churches = () => {
  const {
    churches,
    pagination,
    filters,
    sortConfig,
    loading,
    error,
    showModal,
    modalMode,
    formData,
    canCreate,
    canUpdate,
    canDelete,
    fetchChurches,
    createChurch,
    updateChurch,
    deleteChurch,
    applyFilters,
    clearFilters,
    changePage,
    changePageSize,
    sort,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    refreshData,
  } = useChurches();

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedView, setSelectedView] = useState('list'); // list | cards
  const [exportLoading, setExportLoading] = useState(false);
  const [showDashboard, setShowDashboard] = useState(null); // churchId | null
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [savedViews, setSavedViews] = useState(loadSavedViews());
  const [viewName, setViewName] = useState('');
  const [quickSearch, setQuickSearch] = useState(filters?.search ?? '');
  const debouncedSearch = useDebounced(quickSearch, 400);
  const tableRef = useRef(null);

  // Cargar datos iniciales
  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  // Aplica búsqueda debounced al store de filtros
  useEffect(() => {
    if (debouncedSearch !== (filters?.search ?? '')) {
      applyFilters({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Deriva listas únicas para filtros de ciudad/estado
  const { cityOptions, stateOptions } = useMemo(() => {
    const cities = new Set();
    const states = new Set();
    (churches || []).forEach((c) => {
      if (c?.city) cities.add(String(c.city));
      if (c?.state) states.add(String(c.state));
    });
    return {
      cityOptions: Array.from(cities).sort((a, b) => a.localeCompare(b)),
      stateOptions: Array.from(states).sort((a, b) => a.localeCompare(b)),
    };
  }, [churches]);

  // Handlers selección múltiple
  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const toggleSelectAllCurrentPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = (churches || []).map((c) => c.id);
      const allSelected = pageIds.every((id) => next.has(id));
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }, [churches]);
  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Acciones en lote (placeholder: activar/desactivar/eliminar)
  const bulkActivate = useCallback(() => {
    // Si hay un endpoint/batch en tu API, colócalo aquí.
    // Como fallback: iterar por updateChurch
    (churches || [])
      .filter((c) => selectedIds.has(c.id))
      .forEach((c) => updateChurch(c.id, { status: 'active' }));
    clearSelection();
  }, [churches, selectedIds, updateChurch, clearSelection]);

  const bulkDeactivate = useCallback(() => {
    (churches || [])
      .filter((c) => selectedIds.has(c.id))
      .forEach((c) => updateChurch(c.id, { status: 'inactive' }));
    clearSelection();
  }, [churches, selectedIds, updateChurch, clearSelection]);

  const bulkDelete = useCallback(() => {
    setConfirmDeleteOpen(true);
  }, []);

  const confirmBulkDelete = useCallback(() => {
    (churches || [])
      .filter((c) => selectedIds.has(c.id))
      .forEach((c) => deleteChurch(c.id));
    setConfirmDeleteOpen(false);
    clearSelection();
  }, [churches, selectedIds, deleteChurch, clearSelection]);

  // Exportaciones
  const handleExport = async (format) => {
    setExportLoading(true);
    try {
      const rows = churches || [];
      if (format === 'csv') exportToCSV(rows);
      else if (format === 'json') exportToJSON(rows);
      else if (format === 'pdf') await exportToPDF(rows);
      else if (format === 'excel') {
        // Si tienes un exportador a Excel en el backend, inviértelo aquí.
        // Por ahora, exportamos CSV como alternativa.
        exportToCSV(rows, 'iglesias_excel.csv');
      }
    } catch (e) {
      console.error('Error exporting churches:', e);
    } finally {
      setExportLoading(false);
    }
  };

  // Gestión de configuraciones (placeholder)
  const handleManageSettings = (church) => {
    // Aquí se abriría un modal o página para configuraciones específicas
    // Puedes conectar con un componente <ChurchSettings/> si lo creas.
    console.log('Managing settings for:', church);
  };

  // Vistas guardadas
  const handleSaveView = () => {
    if (!viewName.trim()) return;
    const snapshot = {
      name: viewName.trim(),
      date: Date.now(),
      view: selectedView,
      filters: { ...(filters || {}) },
      sort: { ...(sortConfig || {}) },
    };
    const next = [snapshot, ...savedViews.filter((v) => v.name !== snapshot.name)].slice(0, 20);
    setSavedViews(next);
    saveSavedViews(next);
    setViewName('');
  };

  const applySavedView = (sv) => {
    if (!sv) return;
    setSelectedView(sv.view || 'list');
    if (sv.filters) applyFilters({ ...sv.filters });
    if (sv.sort && sv.sort.key) sort(sv.sort.key, sv.sort.direction);
  };

  const deleteSavedView = (name) => {
    const next = savedViews.filter((v) => v.name !== name);
    setSavedViews(next);
    saveSavedViews(next);
  };

  // Columnas de la tabla
  const columns = useMemo(() => {
    /** @type {import('../components/common/DataTable').Column[]} */
    return [
      {
        key: 'select',
        title: (
          <input
            type="checkbox"
            aria-label="Seleccionar página"
            onChange={toggleSelectAllCurrentPage}
            checked={(churches || []).length > 0 && (churches || []).every((c) => selectedIds.has(c.id))}
          />
        ),
        render: (_, row) => (
          <input
            type="checkbox"
            checked={isSelected(row.id)}
            onChange={() => toggleSelect(row.id)}
            aria-label={`Seleccionar ${row.name}`}
          />
        ),
        width: 32,
        sticky: 'left',
      },
      {
        key: 'logo',
        title: '',
        render: (_, church) => (
          <div className={styles.churchLogo}>
            {church.logo ? (
              <img src={church.logo} alt={church.name} />
            ) : (
              <div className={styles.logoPlaceholder}>
                <FaChurch />
              </div>
            )}
          </div>
        ),
        width: 60,
        sticky: 'left',
        sortable: false,
      },
      {
        key: 'name',
        title: 'Iglesia',
        render: (_, church) => (
          <div className={styles.churchInfo}>
            <div className={styles.churchName}>{church.name}</div>
            <div className={styles.churchCode}>{church.code}</div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'pastor',
        title: 'Pastor',
        render: (_, church) => (
          <div className={styles.pastorInfo}>
            <div className={styles.pastorName}>{church.pastor?.name || 'Sin asignar'}</div>
            {church.pastor?.phone && (
              <div className={styles.pastorContact}>
                <FaPhone className={styles.icon} />
                {church.pastor.phone}
              </div>
            )}
          </div>
        ),
        sortable: true,
      },
      {
        key: 'location',
        title: 'Ubicación',
        render: (_, church) => (
          <div className={styles.locationInfo}>
            <div className={styles.address}>
              <FaMapMarkerAlt className={styles.icon} />
              {church.address}
            </div>
            <div className={styles.cityState}>
              {church.city}{church.city && church.state ? ', ' : ''}{church.state}
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'members',
        title: 'Miembros',
        render: (_, church) => (
          <div className={styles.membersInfo}>
            <div className={styles.memberCount}>
              <FaUsers className={styles.icon} />
              {church.memberCount || 0} miembros
            </div>
            <div className={styles.activeMembers}>
              {church.activeMembers || 0} activos
            </div>
          </div>
        ),
        sortable: true,
      },
      {
        key: 'contact',
        title: 'Contacto',
        render: (_, church) => (
          <div className={styles.contactInfo}>
            {church.phone && (
              <div className={styles.contactItem}>
                <FaPhone className={styles.icon} />
                {church.phone}
              </div>
            )}
            {church.email && (
              <div className={styles.contactItem}>
                <FaEnvelope className={styles.icon} />
                {church.email}
              </div>
            )}
          </div>
        ),
        sortable: false,
      },
      {
        key: 'status',
        title: 'Estado',
        render: (_, church) => (
          <span className={`${styles.status} ${styles[church.status]}`}>
            {getStatusLabel(church.status)}
          </span>
        ),
        sortable: true,
      },
      {
        key: 'foundedDate',
        title: 'Fundada',
        render: (_, church) => fmtDate(church.foundedDate),
        sortable: true,
      },
      {
        key: 'actions',
        title: 'Acciones',
        render: (_, church) => (
          <div className={styles.actions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openViewModal(church)}
              icon={<FaEye />}
              title="Ver detalles"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDashboard(church.id)}
              icon={<FaChartBar />}
              title="Dashboard"
            />
            {canUpdate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditModal(church)}
                icon={<FaEdit />}
                title="Editar"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleManageSettings(church)}
              icon={<FaCog />}
              title="Configuraciones"
            />
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteChurch(church.id)}
                icon={<FaTrash />}
                title="Eliminar"
                className={styles.deleteButton}
              />
            )}
          </div>
        ),
        width: 220,
        sticky: 'right',
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [churches, selectedIds, canUpdate, canDelete]);

  // Vista de tarjetas
  const renderCardsView = () => (
    <div className={styles.churchCards}>
      {(churches || []).map((church) => (
        <div key={church.id} className={styles.churchCard}>
          <div className={styles.cardHeader}>
            <div className={styles.cardLogo}>
              {church.logo ? (
                <img src={church.logo} alt={church.name} />
              ) : (
                <div className={styles.logoPlaceholder}>
                  <FaChurch />
                </div>
              )}
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>{church.name}</h3>
              <p className={styles.cardCode}>{church.code}</p>
              <span className={`${styles.cardStatus} ${styles[church.status]}`}>
                {getStatusLabel(church.status)}
              </span>
            </div>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.cardDetail}>
              <FaMapMarkerAlt className={styles.cardIcon} />
              <span>
                {church.city}
                {church.city && church.state ? ', ' : ''}
                {church.state}
              </span>
            </div>

            <div className={styles.cardDetail}>
              <FaUsers className={styles.cardIcon} />
              <span>{church.memberCount || 0} miembros</span>
            </div>

            {church.pastor && (
              <div className={styles.cardDetail}>
                <FaUser className={styles.cardIcon} />
                <span>{church.pastor.name}</span>
              </div>
            )}

            {church.phone && (
              <div className={styles.cardDetail}>
                <FaPhone className={styles.cardIcon} />
                <span>{church.phone}</span>
              </div>
            )}

            {church.email && (
              <div className={styles.cardDetail}>
                <FaEnvelope className={styles.cardIcon} />
                <span>{church.email}</span>
              </div>
            )}
          </div>

          <div className={styles.cardActions}>
            <label className={styles.selectCard}>
              <input
                type="checkbox"
                checked={isSelected(church.id)}
                onChange={() => toggleSelect(church.id)}
              />
              <span>Seleccionar</span>
            </label>
            <div className={styles.cardButtons}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openViewModal(church)}
                icon={<FaEye />}
              >
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDashboard(church.id)}
                icon={<FaChartBar />}
              >
                Dashboard
              </Button>
              {canUpdate && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openEditModal(church)}
                  icon={<FaEdit />}
                >
                  Editar
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Atajos de teclado
  useEffect(() => {
    const handler = (e) => {
      // Ctrl/Cmd + K => foco búsqueda
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const input = document.getElementById('churches-quick-search');
        input?.focus();
      }
      // Ctrl/Cmd + N => nueva iglesia
      if (ctrlOrCmd && e.key.toLowerCase() === 'n' && canCreate) {
        e.preventDefault();
        openCreateModal();
      }
      // ESC => cerrar modal
      if (e.key === 'Escape' && showModal) {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, canCreate]);

  // Estado de carga inicial
  if (loading && (churches?.length ?? 0) === 0) {
    return <Loading message="Cargando iglesias..." />;
  }

  // Dashboard específico de una iglesia
  if (showDashboard) {
    return (
      <ChurchDashboard
        churchId={showDashboard}
        onBack={() => setShowDashboard(null)}
      />
    );
  }

  // Filtros render
  const renderFilters = () => (
    <div className={styles.filtersPanel}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label htmlFor="churches-quick-search">Buscar</label>
          <div className={styles.searchInput}>
            <FaSearch className={styles.searchIcon} />
            <input
              id="churches-quick-search"
              type="text"
              placeholder="Nombre, código o dirección... (Ctrl/Cmd + K)"
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label>Estado</label>
          <select
            value={filters.status || ''}
            onChange={(e) => applyFilters({ status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activa</option>
            <option value="inactive">Inactiva</option>
            <option value="construction">En construcción</option>
            <option value="suspended">Suspendida</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Ciudad</label>
          <select
            value={filters.city || ''}
            onChange={(e) => applyFilters({ city: e.target.value })}
          >
            <option value="">Todas las ciudades</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Estado/Provincia</label>
          <select
            value={filters.state || ''}
            onChange={(e) => applyFilters({ state: e.target.value })}
          >
            <option value="">Todos los estados</option>
            {stateOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Miembros mínimo</label>
          <input
            type="number"
            min="0"
            placeholder="0"
            value={filters.minMembers || ''}
            onChange={(e) => applyFilters({ minMembers: e.target.value })}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Miembros máximo</label>
          <input
            type="number"
            min="0"
            placeholder="Sin límite"
            value={filters.maxMembers || ''}
            onChange={(e) => applyFilters({ maxMembers: e.target.value })}
          />
        </div>

        <div className={styles.filterActions}>
          <Button variant="outline" onClick={clearFilters} icon={<FaTimes />}> 
            Limpiar Filtros
          </Button>
          <Button variant="ghost" onClick={refreshData} icon={<FaSync />}> 
            Actualizar
          </Button>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Guardar vista</label>
          <div className={styles.savedViewRow}>
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="Ej. Iglesias activas Lima"
            />
            <Button size="sm" variant="outline" onClick={handleSaveView} icon={<FaSave />}>Guardar</Button>
          </div>
        </div>
        {savedViews.length > 0 && (
          <div className={styles.filterGroup}>
            <label>Vistas guardadas</label>
            <div className={styles.savedViews}>
              {savedViews.map((sv) => (
                <div key={sv.name} className={styles.savedViewItem}>
                  <Button size="sm" variant="ghost" onClick={() => applySavedView(sv)} icon={<FaFolderOpen />}>{sv.name}</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteSavedView(sv.name)} title="Eliminar vista" icon={<FaTrash />} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.churchesPage} ref={tableRef}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <FaChurch className={styles.headerIcon} />
            Gestión de Iglesias
          </h1>
          <p>Administra iglesias, líderes y configuraciones</p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <Button
              variant={selectedView === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('list')}
            >
              Lista
            </Button>
            <Button
              variant={selectedView === 'cards' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedView('cards')}
            >
              Tarjetas
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FaFilter />}
            className={showFilters ? styles.active : ''}
          >
            Filtros
          </Button>

          <div className={styles.exportButtons}>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={exportLoading}
              icon={<FaDownload />}
              title="Exportar CSV"
            >
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={exportLoading}
              icon={<FaDownload />}
              title="Exportar Excel (CSV alternativo)"
            >
              Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              disabled={exportLoading}
              icon={<FaDownload />}
              title="Exportar JSON"
            >
              JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={exportLoading}
              icon={<FaDownload />}
              title="Exportar PDF"
            >
              PDF
            </Button>
          </div>

          {canCreate && (
            <Button
              variant="primary"
              onClick={openCreateModal}
              icon={<FaPlus />}
              title="Nueva Iglesia (Ctrl/Cmd + N)"
            >
              Nueva Iglesia
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <ChurchStats churches={churches} />

      {/* Filtros */}
      {showFilters && renderFilters()}

      {/* Acciones en lote si hay selección */}
      {selectedIds.size > 0 && (
        <div className={styles.bulkBar}>
          <div className={styles.bulkLeft}>
            <strong>{selectedIds.size}</strong> seleccionada(s)
            <Button size="sm" variant="ghost" onClick={clearSelection} icon={<FaTimes />}>Quitar selección</Button>
          </div>
          <div className={styles.bulkActions}>
            <Button size="sm" variant="outline" onClick={bulkActivate}><FaCheck /> Activar</Button>
            <Button size="sm" variant="outline" onClick={bulkDeactivate}>Desactivar</Button>
            {canDelete && (
              <Button size="sm" variant="danger" onClick={bulkDelete} icon={<FaTrash />}>Eliminar</Button>
            )}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className={styles.mainContent}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <Button variant="outline" onClick={refreshData} icon={<FaSync />}>Reintentar</Button>
          </div>
        )}

        {selectedView === 'list' ? (
          <div className={styles.tableContainer}>
            <DataTable
              data={churches}
              columns={columns}
              loading={loading}
              pagination={pagination}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
              sortConfig={sortConfig}
              onSort={sort}
              emptyMessage="No se encontraron iglesias"
              stickyHeader
            />
            {/* Navegación simple adicional (opcional) */}
            <div className={styles.paginationLite}>
              <Button size="sm" variant="ghost" onClick={() => changePage(Math.max(1, (pagination?.currentPage || 1) - 1))} icon={<FaChevronLeft />}>Anterior</Button>
              <span>
                Página {pagination?.currentPage || 1} de {pagination?.totalPages || 1}
              </span>
              <Button size="sm" variant="ghost" onClick={() => changePage(Math.min(pagination?.totalPages || 1, (pagination?.currentPage || 1) + 1))} icon={<FaChevronRight />}>Siguiente</Button>
            </div>
          </div>
        ) : (
          renderCardsView()
        )}
      </div>

      {/* Modal de confirmación de eliminación masiva */}
      <Modal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Eliminar iglesias seleccionadas"
      >
        <div className={styles.confirmDelete}>
          <p>¿Seguro que deseas eliminar <strong>{selectedIds.size}</strong> iglesia(s)? Esta acción no se puede deshacer.</p>
          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancelar</Button>
            <Button variant="danger" onClick={confirmBulkDelete} icon={<FaTrash />}>Eliminar</Button>
          </div>
        </div>
      </Modal>

      {/* Modal de iglesia (crear/editar/ver) */}
      <ChurchForm
        church={modalMode === 'create' ? null : formData}
        isOpen={showModal}
        onClose={closeModal}
        onSave={modalMode === 'create' ? createChurch : (data) => updateChurch(formData.id, data)}
        isLoading={loading}
      />
    </div>
  );
};

export default Churches;
