/**
 * Página de Gestión de Grupos
 * Lista, crea, edita y elimina grupos de la iglesia
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { ROLES } from '@/constants';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import BulkImportModal from '@/components/common/BulkImportModal';
import GroupForm from '@/components/forms/GroupForm';
import { 
  FaPlus, 
  FaDownload, 
  FaUpload, 
  FaSearch, 
  FaUsers,
  FaTrash,
  FaCopy,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa';
import { PageHeader } from '@/components/common/PageHeader';
import { showNotification } from '@/utils/notifications';
import styles from './Groups.module.css';

const Groups = () => {
  const { hasRole } = useAuth();
  const {
    groups,
    loading,
    pagination,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    deleteMultipleGroups,
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
  const [, setShowMembersModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCreateGroup = async (data) => {
    try {
      await createGroup(data);
      setShowCreateModal(false);
      await loadGroups(1);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleUpdateGroup = async (data) => {
    try {
      await updateGroup(selectedGroup.id, data);
      setShowEditModal(false);
      setSelectedGroup(null);
      await loadGroups(pagination.currentPage);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  // Verificar permisos
  const canCreate = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER].some(r => hasRole(r));
  const canEdit = [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER].some(r => hasRole(r));
  const canDelete = [ROLES.ADMIN, ROLES.DIRECTOR].some(r => hasRole(r));
  const canExport = true; // Todos pueden exportar
  const canImport = [ROLES.ADMIN, ROLES.DIRECTOR].some(r => hasRole(r));
  const canDuplicate = [ROLES.ADMIN, ROLES.DIRECTOR].some(r => hasRole(r));

  return (
    <div className={styles.groupsPage}>
      {/* Header */}
      <PageHeader
        title="Gestión de Grupos"
        subtitle="Administra los grupos de la iglesia y sus actividades"
        icon={<FaUsers />}
      />

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

          {/* Importar */}
          {canImport && (
            <Button
              variant="outline"
              size="small"
              onClick={() => setShowImportModal(true)}
            >
              <FaUpload /> Importar
            </Button>
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

      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        entity="groups"
        onImported={() => loadGroups(1)}
      />

      {/* Modal crear grupo */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Grupo"
        size="large"
      >
        <GroupForm
          mode="create"
          onSubmit={handleCreateGroup}
          onCancel={() => setShowCreateModal(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Modal editar grupo */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedGroup(null); }}
        title="Editar Grupo"
        size="large"
      >
        {selectedGroup && (
          <GroupForm
            mode="edit"
            initialData={selectedGroup}
            onSubmit={handleUpdateGroup}
            onCancel={() => { setShowEditModal(false); setSelectedGroup(null); }}
            isLoading={loading}
          />
        )}
      </Modal>

      {/* Modal ver grupo */}
      <Modal
        isOpen={showViewModal}
        onClose={() => { setShowViewModal(false); setSelectedGroup(null); }}
        title="Detalles del Grupo"
        size="large"
      >
        {selectedGroup && (
          <GroupForm
            mode="view"
            initialData={selectedGroup}
            onCancel={() => { setShowViewModal(false); setSelectedGroup(null); }}
            isLoading={loading}
          />
        )}
      </Modal>
    </div>
  );
};

export default Groups;