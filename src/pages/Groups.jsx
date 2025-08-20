/**
 * Página de Gestión de Grupos
 * Lista, crea, edita y elimina grupos de la iglesia
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { 
  FaPlus, 
  FaDownload, 
  FaSearch, 
  FaUsers,
  FaTrash,
  FaCopy,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa';
import { showNotification } from '@/utils/notifications';
import styles from './Groups.module.css';

const Groups = () => {
  const { user } = useAuth();
  const {
    groups,
    loading,
    pagination,
    fetchGroups,
    deleteGroup,
    deleteMultipleGroups,
    updateGroupStatus,
    duplicateGroup,
    exportToExcel,
    exportToPDF
  } = useGroups();

  // Estados locales
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    church: '',
    leader: '',
    status: 'active',
    type: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadGroups();
  }, [filters, sortConfig]);

  // Función para cargar grupos
  const loadGroups = async (page = 1) => {
    const params = {
      page,
      limit: 20,
      search: searchTerm,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.order,
      ...filters
    };

    try {
      await fetchGroups(params);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  // Configuración de columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'name',
      title: 'Nombre del Grupo',
      sortable: true,
      render: (value, item) => (
        <div className={styles.groupName}>
          <span className={styles.name}>{value}</span>
          <span className={styles.groupType}>{item.type || 'General'}</span>
        </div>
      )
    },
    {
      key: 'churchName',
      title: 'Iglesia',
      sortable: true,
      render: (value) => value || 'Sin asignar'
    },
    {
      key: 'leaderName',
      title: 'Líder',
      sortable: true,
      render: (value, item) => (
        <div className={styles.leaderInfo}>
          <span className={styles.leaderName}>{value || 'Sin asignar'}</span>
          {item.leaderPhone && (
            <span className={styles.leaderPhone}>{item.leaderPhone}</span>
          )}
        </div>
      )
    },
    {
      key: 'membersCount',
      title: 'Miembros',
      sortable: true,
      render: (value) => (
        <div className={styles.membersCount}>
          <FaUsers className={styles.membersIcon} />
          <span>{value || 0}</span>
        </div>
      )
    },
    {
      key: 'meetingDay',
      title: 'Día de Reunión',
      render: (value) => value || 'No definido'
    },
    {
      key: 'meetingTime',
      title: 'Hora',
      render: (value) => value || 'No definida'
    },
    {
      key: 'status',
      title: 'Estado',
      sortable: true,
      render: (value) => (
        <span className={`${styles.statusBadge} ${styles[value]}`}>
          {value === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Fecha Creación',
      sortable: true,
      type: 'date'
    }
  ], []);

  // Manejadores de eventos
  const handleSearch = () => {
    loadGroups(1);
  };

  const handleSort = (field, order) => {
    setSortConfig({ field, order });
  };

  const handlePageChange = (page) => {
    loadGroups(page);
  };

  const handleView = (group) => {
    setSelectedGroup(group);
    setShowViewModal(true);
  };

  const handleEdit = (group) => {
    setSelectedGroup(group);
    setShowEditModal(true);
  };

  const handleDelete = (group) => {
    setDeleteTarget({ type: 'single', group });
    setShowDeleteModal(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedGroups.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Advertencia',
        message: 'Selecciona al menos un grupo para eliminar'
      });
      return;
    }

    setDeleteTarget({ type: 'multiple', groups: selectedGroups });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'single') {
        await deleteGroup(deleteTarget.group.id);
      } else {
        await deleteMultipleGroups(deleteTarget.groups);
        setSelectedGroups([]);
      }
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await loadGroups(pagination.currentPage);
    } catch (error) {
      console.error('Error deleting group(s):', error);
    }
  };

  const handleStatusChange = async (group, newStatus) => {
    try {
      await updateGroupStatus(group.id, newStatus);
      await loadGroups(pagination.currentPage);
    } catch (error) {
      console.error('Error updating group status:', error);
    }
  };

  const handleDuplicate = async (group) => {
    try {
      await duplicateGroup(group.id);
      await loadGroups(1); // Ir a la primera página para ver el nuevo grupo
      showNotification({
        type: 'success',
        title: 'Éxito',
        message: `Grupo "${group.name}" duplicado correctamente`
      });
    } catch (error) {
      console.error('Error duplicating group:', error);
    }
  };

  const handleViewMembers = (group) => {
    setSelectedGroup(group);
    setShowMembersModal(true);
  };

  const handleExportExcel = async () => {
    try {
      await exportToExcel({ ...filters, search: searchTerm });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF({ ...filters, search: searchTerm });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  // Verificar permisos
  const canCreate = ['administrador', 'director', 'lider'].includes(user?.role);
  const canEdit = ['administrador', 'director', 'lider'].includes(user?.role);
  const canDelete = ['administrador', 'director'].includes(user?.role);
  const canExport = true; // Todos pueden exportar
  const canDuplicate = ['administrador', 'director'].includes(user?.role);

  return (
    <div className={styles.groupsPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>
            <FaUsers className={styles.titleIcon} />
            Gestión de Grupos
          </h1>
          <p className={styles.pageDescription}>
            Administra los grupos de la iglesia y sus actividades
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{pagination.total}</span>
            <span className={styles.statLabel}>Total Grupos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {groups.filter(g => g.status === 'active').length}
            </span>
            <span className={styles.statLabel}>Activos</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {groups.reduce((sum, g) => sum + (g.membersCount || 0), 0)}
            </span>
            <span className={styles.statLabel}>Miembros Total</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Búsqueda */}
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className={styles.searchInput}
            />
            <Button
              variant="primary"
              size="small"
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actionsSection}>
          {/* Filtros */}
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className={styles.filterSelect}
          >
            <option value="">Todos los tipos</option>
            <option value="Célula">Célula</option>
            <option value="Ministerio">Ministerio</option>
            <option value="Departamento">Departamento</option>
            <option value="Escuela">Escuela</option>
          </select>

          {/* Acciones de exportación */}
          {canExport && (
            <>
              <Button
                variant="outline"
                size="small"
                onClick={handleExportExcel}
                disabled={loading}
              >
                <FaDownload /> Excel
              </Button>
              <Button
                variant="outline"
                size="small"
                onClick={handleExportPDF}
                disabled={loading}
              >
                <FaDownload /> PDF
              </Button>
            </>
          )}

          {/* Eliminar múltiples */}
          {canDelete && selectedGroups.length > 0 && (
            <Button
              variant="danger"
              size="small"
              onClick={handleDeleteMultiple}
            >
              <FaTrash /> Eliminar ({selectedGroups.length})
            </Button>
          )}

          {/* Crear nuevo */}
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Nuevo Grupo
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={groups}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onView={handleView}
        selectedRows={selectedGroups}
        onRowSelect={setSelectedGroups}
        selectable={canDelete}
        actions={[
          'view',
          ...(canEdit ? ['edit'] : []),
          ...(canDelete ? ['delete'] : [])
        ]}
        customActions={(group) => (
          <div className={styles.customActions}>
            <Button
              variant="outline"
              size="small"
              onClick={() => handleViewMembers(group)}
              title="Ver miembros"
            >
              <FaUser />
            </Button>
            {canDuplicate && (
              <Button
                variant="outline"
                size="small"
                onClick={() => handleDuplicate(group)}
                title="Duplicar grupo"
              >
                <FaCopy />
              </Button>
            )}
          </div>
        )}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
        >
          <div className={styles.deleteModalContent}>
            <p>
              {deleteTarget?.type === 'single' 
                ? `¿Estás seguro de que quieres eliminar el grupo "${deleteTarget.group.name}"?`
                : `¿Estás seguro de que quieres eliminar ${deleteTarget?.groups?.length} grupo(s) seleccionado(s)?`
              }
            </p>
            <p className={styles.warningText}>
              Esta acción no se puede deshacer. Los miembros del grupo no serán eliminados.
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                loading={loading}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Aquí irían los otros modales: Create, Edit, View, Members */}
      {/* Los implementaremos en el siguiente paso */}
    </div>
  );
};

export default Groups;