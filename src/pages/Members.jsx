/**
 * Página de Gestión de Miembros
 * Lista, crea, edita y elimina miembros de la iglesia
 */

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { 
  FaPlus, 
  FaDownload, 
  FaUpload, 
  FaSearch, 
  FaFilter,
  FaUsers,
  FaTrash
} from 'react-icons/fa';
import { showNotification } from '@/utils/notifications';
import styles from './Members.module.css';

const Members = () => {
  const { user } = useAuth();
  const {
    members,
    loading,
    pagination,
    fetchMembers,
    deleteMember,
    deleteMultipleMembers,
    updateMemberStatus,
    exportToExcel,
    exportToPDF,
    importFromExcel
  } = useMembers();

  // Estados locales
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    church: '',
    group: '',
    status: 'active',
    gender: '',
    ageRange: ''
  });
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    order: 'desc'
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadMembers();
  }, [filters, sortConfig]);

  // Función para cargar miembros
  const loadMembers = async (page = 1) => {
    const params = {
      page,
      limit: 20,
      search: searchTerm,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.order,
      ...filters
    };

    try {
      await fetchMembers(params);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  // Configuración de columnas de la tabla
  const columns = useMemo(() => [
    {
      key: 'photo',
      title: 'Foto',
      render: (value) => (
        <img 
          src={value || '/default-avatar.png'} 
          alt="Foto del miembro"
          className={styles.memberPhoto}
        />
      )
    },
    {
      key: 'firstName',
      title: 'Nombre',
      sortable: true,
      render: (value, item) => (
        <div className={styles.memberName}>
          <span className={styles.fullName}>
            {`${item.firstName} ${item.lastName}`}
          </span>
          <span className={styles.memberCode}>
            {item.memberCode}
          </span>
        </div>
      )
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true
    },
    {
      key: 'phone',
      title: 'Teléfono',
      render: (value) => value || 'No especificado'
    },
    {
      key: 'churchName',
      title: 'Iglesia',
      sortable: true,
      render: (value) => value || 'Sin asignar'
    },
    {
      key: 'groupName',
      title: 'Grupo',
      sortable: true,
      render: (value) => value || 'Sin asignar'
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
      key: 'joinDate',
      title: 'Fecha Ingreso',
      sortable: true,
      type: 'date'
    }
  ], []);

  // Manejadores de eventos
  const handleSearch = () => {
    loadMembers(1);
  };

  const handleSort = (field, order) => {
    setSortConfig({ field, order });
  };

  const handlePageChange = (page) => {
    loadMembers(page);
  };

  const handleView = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleDelete = (member) => {
    setDeleteTarget({ type: 'single', member });
    setShowDeleteModal(true);
  };

  const handleDeleteMultiple = () => {
    if (selectedMembers.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Advertencia',
        message: 'Selecciona al menos un miembro para eliminar'
      });
      return;
    }

    setDeleteTarget({ type: 'multiple', members: selectedMembers });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'single') {
        await deleteMember(deleteTarget.member.id);
      } else {
        await deleteMultipleMembers(deleteTarget.members);
        setSelectedMembers([]);
      }
      
      setShowDeleteModal(false);
      setDeleteTarget(null);
      await loadMembers(pagination.currentPage);
    } catch (error) {
      console.error('Error deleting member(s):', error);
    }
  };

  const handleStatusChange = async (member, newStatus) => {
    try {
      await updateMemberStatus(member.id, newStatus);
      await loadMembers(pagination.currentPage);
    } catch (error) {
      console.error('Error updating member status:', error);
    }
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

  const handleImport = async (file) => {
    try {
      await importFromExcel(file);
      setShowImportModal(false);
      await loadMembers(1);
    } catch (error) {
      console.error('Error importing members:', error);
    }
  };

  // Verificar permisos
  const canCreate = ['administrador', 'director', 'lider'].includes(user?.role);
  const canEdit = ['administrador', 'director', 'lider'].includes(user?.role);
  const canDelete = ['administrador', 'director'].includes(user?.role);
  const canExport = true; // Todos pueden exportar
  const canImport = ['administrador', 'director'].includes(user?.role);

  return (
    <div className={styles.membersPage}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h1 className={styles.pageTitle}>
            <FaUsers className={styles.titleIcon} />
            Gestión de Miembros
          </h1>
          <p className={styles.pageDescription}>
            Administra los miembros de la iglesia y sus datos
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className={styles.quickStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{pagination.total}</span>
            <span className={styles.statLabel}>Total Miembros</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>
              {members.filter(m => m.status === 'active').length}
            </span>
            <span className={styles.statLabel}>Activos</span>
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
              placeholder="Buscar miembros..."
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
          {canDelete && selectedMembers.length > 0 && (
            <Button
              variant="danger"
              size="small"
              onClick={handleDeleteMultiple}
            >
              <FaTrash /> Eliminar ({selectedMembers.length})
            </Button>
          )}

          {/* Crear nuevo */}
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Nuevo Miembro
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de datos */}
      <DataTable
        data={members}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onSort={handleSort}
        onPageChange={handlePageChange}
        onEdit={canEdit ? handleEdit : null}
        onDelete={canDelete ? handleDelete : null}
        onView={handleView}
        selectedRows={selectedMembers}
        onRowSelect={setSelectedMembers}
        selectable={canDelete}
        actions={[
          'view',
          ...(canEdit ? ['edit'] : []),
          ...(canDelete ? ['delete'] : [])
        ]}
      />

      {/* Modales */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmar Eliminación"
        >
          <div className={styles.deleteModalContent}>
            <p>
              {deleteTarget?.type === 'single' 
                ? `¿Estás seguro de que quieres eliminar al miembro "${deleteTarget.member.firstName} ${deleteTarget.member.lastName}"?`
                : `¿Estás seguro de que quieres eliminar ${deleteTarget?.members?.length} miembro(s) seleccionado(s)?`
              }
            </p>
            <p className={styles.warningText}>
              Esta acción no se puede deshacer.
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

      {/* Aquí irían los otros modales: Create, Edit, View, Import */}
      {/* Los implementaremos en el siguiente paso */}
    </div>
  );
};

export default Members;