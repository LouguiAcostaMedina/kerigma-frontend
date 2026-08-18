/**
 * Página de Bitácora de Auditoría
 * Muestra el historial de acciones del sistema con filtros, stats y detalle expandible
 */

import { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaSearch, FaFilter, FaEye, FaCalendarAlt, FaUser, FaCog, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import DataTable from '@/components/common/DataTable';
import Loading from '@/components/common/Loading';
import PageHeader from '@/components/common/PageHeader';
import { auditService } from '@/services/auditService';
import { showToast } from '@/utils/notifications';
import styles from './AuditLog.module.css';

const ACTION_LABELS = {
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  status_change: 'Cambio de estado',
  assign: 'Asignación',
  bulk: 'Operación masiva',
  import: 'Importación',
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  invite: 'Invitación',
  reset_password: 'Restablecimiento de contraseña',
};

const ACTION_COLORS = {
  create: '#22c55e',
  update: '#3b82f6',
  delete: '#ef4444',
  status_change: '#f59e0b',
  assign: '#8b5cf6',
  bulk: '#ec4899',
  import: '#06b6d4',
  login: '#10b981',
  logout: '#6b7280',
  invite: '#f97316',
  reset_password: '#ef4444',
};

const ENTITY_LABELS = {
  users: 'Usuarios',
  members: 'Miembros',
  groups: 'Grupos',
  students: 'Estudiantes',
  churches: 'Iglesias',
  reports: 'Reportes',
  attendance: 'Asistencia',
  'weekly-metrics': 'Métricas semanales',
  quarterlygoals: 'Metas trimestrales',
  'audit-logs': 'Auditoría',
};

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20,
  });
  const [showFilters, setShowFilters] = useState(false);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.entity) params.entity = filters.entity;
      if (filters.action) params.action = filters.action;
      if (filters.search) params.search = filters.search;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      params.page = filters.page;
      params.limit = filters.limit;

      const response = await auditService.getAuditLogs(params);
      setLogs(response.data || []);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        total: response.total,
        from: response.from,
        to: response.to,
      });
    } catch (error) {
      console.error('Error loading audit logs:', error);
      showToast('Error al cargar la bitácora de auditoría', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const data = await auditService.getAuditStats(30);
      setStats(data);
    } catch (error) {
      console.error('Error loading audit stats:', error);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ entity: '', action: '', search: '', dateFrom: '', dateTo: '', page: 1, limit: 20 });
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const toggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderChanges = (changes) => {
    if (!changes || Object.keys(changes).length === 0) {
      return <span className={styles.noChanges}>Sin cambios registrados</span>;
    }
    return (
      <div className={styles.changesGrid}>
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} className={styles.changeItem}>
            <span className={styles.changeKey}>{key}:</span>
            <span className={styles.changeValue}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'createdAt',
      title: 'Fecha',
      sortable: true,
      type: 'date',
      render: (value) => (
        <div className={styles.dateCell}>
          <FaCalendarAlt className={styles.dateIcon} />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
    {
      key: 'action',
      title: 'Acción',
      sortable: true,
      render: (value) => (
        <span
          className={styles.actionBadge}
          style={{ backgroundColor: `${ACTION_COLORS[value] || '#6b7280'}20`, color: ACTION_COLORS[value] || '#6b7280' }}
        >
          {ACTION_LABELS[value] || value}
        </span>
      ),
    },
    {
      key: 'entity',
      title: 'Entidad',
      sortable: true,
      render: (value) => (
        <span className={styles.entityBadge}>
          <FaCog className={styles.entityIcon} />
          {ENTITY_LABELS[value] || value}
        </span>
      ),
    },
    {
      key: 'actorName',
      title: 'Actor',
      sortable: false,
      render: (value, item) => (
        <div className={styles.actorCell}>
          <FaUser className={styles.actorIcon} />
          <div>
            <div className={styles.actorName}>{value || 'Sistema'}</div>
            {item.actorEmail && <div className={styles.actorEmail}>{item.actorEmail}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'entityId',
      title: 'ID',
      sortable: false,
      render: (value) => (
        <code className={styles.entityId}>{value ? value.substring(0, 8) + '...' : '-'}</code>
      ),
    },
  ];

  if (loading && logs.length === 0) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Bitácora de Auditoría"
          subtitle="Historial de acciones del sistema"
          icon={<FaHistory />}
        />
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        title="Bitácora de Auditoría"
        subtitle="Historial de acciones del sistema"
        icon={<FaHistory />}
        actionButton={
          <button
            className={styles.filterToggle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filtros
          </button>
        }
      />

      {/* Estadísticas */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalLogs.toLocaleString()}</div>
            <div className={styles.statLabel}>Total registros</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.recentLogs24h}</div>
            <div className={styles.statLabel}>Últimas 24 horas</div>
          </div>
          {stats.byAction.slice(0, 3).map((item) => (
            <div key={item.action} className={styles.statCard}>
              <div className={styles.statValue}>{item.count}</div>
              <div className={styles.statLabel}>{ACTION_LABELS[item.action] || item.action}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Buscar</label>
              <div className={styles.searchInput}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Nombre o email del actor..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Entidad</label>
              <select
                value={filters.entity}
                onChange={(e) => handleFilterChange('entity', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas</option>
                {Object.entries(ENTITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Acción</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas</option>
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Desde</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Hasta</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className={styles.filterInput}
              />
            </div>
            <button className={styles.clearButton} onClick={clearFilters}>
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className={styles.tableContainer}>
        <DataTable
          data={logs}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          actions={['view']}
          onView={(item) => toggleExpand(item.id)}
          searchable={false}
        />
      </div>

      {/* Detalle expandido */}
      {expandedRow && (
        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <h3>Detalle del evento de auditoría</h3>
            <button className={styles.closeButton} onClick={() => setExpandedRow(null)}>
              Cerrar
            </button>
          </div>
          {(() => {
            const log = logs.find((l) => l.id === expandedRow);
            if (!log) return null;
            return (
              <div className={styles.detailContent}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Fecha:</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Acción:</span>
                  <span
                    className={styles.actionBadge}
                    style={{ backgroundColor: `${ACTION_COLORS[log.action] || '#6b7280'}20`, color: ACTION_COLORS[log.action] || '#6b7280' }}
                  >
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Entidad:</span>
                  <span>{ENTITY_LABELS[log.entity] || log.entity}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>ID Entidad:</span>
                  <code className={styles.entityIdFull}>{log.entityId}</code>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Actor:</span>
                  <span>{log.actorName} ({log.actorEmail})</span>
                </div>
                <div className={styles.detailSection}>
                  <h4>Cambios registrados</h4>
                  {renderChanges(log.changes)}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AuditLog;
