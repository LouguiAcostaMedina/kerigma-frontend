/**
 * Página de administración de usuarios del sistema
 * Permite gestionar usuarios con CRUD completo, roles, permisos y operaciones en lote
 * Incluye filtros avanzados, estadísticas y exportación
 */

import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserPlus, FaFilter, FaDownload, FaUpload, FaTrash, FaEdit, FaEye, FaEnvelope, FaKey, FaToggleOn, FaToggleOff, FaSearch, FaSort } from 'react-icons/fa';
import { useUsers } from '@/hooks/useUsers';
import { useChurches } from '@/hooks/useChurches';
import { useCatalog } from '@/hooks/useCatalog';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import UserForm from '@/components/forms/UserForm';
import UserStats from '@/components/forms/UserStats';
import BulkActions from '@/components/forms/BulkActions';
import BulkImportModal from '@/components/common/BulkImportModal';
import ExportMenu from '@/components/common/ExportMenu';
import PageHeader from '@/components/common/PageHeader';
import styles from './Users.module.css';

const Users = () => {
  const {
    users,
    stats,
    pagination,
    filters,
    sortConfig,
    loading,
    error,
    showModal,
    modalMode,
    formData,
    formErrors,
    bulkSelection,
    selectedUsers,
    canCreate,
    canUpdate,
    canDelete,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    bulkOperation,
    sendInvitation,
    resetPassword,
    applyFilters,
    clearFilters,
    changePage,
    changePageSize,
    sort,
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    setFormData,
    toggleSelection,
    selectAll,
    setBulkSelection,
    refreshData
  } = useUsers();

  const { churches, fetchChurches } = useChurches();
  const { roleOptions, roleLabels } = useCatalog();
  
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Cargar iglesias para los filtros
  useEffect(() => {
    fetchChurches();
  }, [fetchChurches]);

  // Configuración de columnas para la tabla
  const columns = [
    {
      key: 'selection',
      title: (
        <input
          type="checkbox"
          checked={bulkSelection.length === users.length && users.length > 0}
          onChange={selectAll}
          className={styles.checkbox}
        />
      ),
      render: (_, user) => (
        <input
          type="checkbox"
          checked={bulkSelection.includes(user.id)}
          onChange={() => toggleSelection(user.id)}
          className={styles.checkbox}
        />
      ),
      width: 40
    },
    {
      key: 'name',
      title: 'Nombre',
      render: (_, user) => (
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className={styles.userName}>{user.name}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'role',
      title: 'Rol',
      render: (_, user) => (
        <span className={`${styles.badge} ${styles[`badge${user.role}`]}`}>
          {getRoleLabel(user.role)}
        </span>
      ),
      sortable: true
    },
    {
      key: 'church',
      title: 'Iglesia',
      render: (_, user) => user.church?.name || 'Sin asignar',
      sortable: true
    },
    {
      key: 'status',
      title: 'Estado',
      render: (_, user) => (
        <span className={`${styles.status} ${styles[user.status]}`}>
          {getStatusLabel(user.status)}
        </span>
      ),
      sortable: true
    },
    {
      key: 'lastLogin',
      title: 'Último Acceso',
      render: (_, user) => user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca',
      sortable: true
    },
    {
      key: 'createdAt',
      title: 'Fecha Creación',
      render: (_, user) => new Date(user.createdAt).toLocaleDateString(),
      sortable: true
    },
    {
      key: 'actions',
      title: 'Acciones',
      render: (_, user) => (
        <div className={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openViewModal(user)}
            icon={<FaEye />}
            title="Ver detalles"
          />
          {canUpdate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditModal(user)}
              icon={<FaEdit />}
              title="Editar"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')}
            icon={user.status === 'active' ? <FaToggleOff /> : <FaToggleOn />}
            title={user.status === 'active' ? 'Desactivar' : 'Activar'}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => sendInvitation(user.id)}
            icon={<FaEnvelope />}
            title="Enviar invitación"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetPassword(user.id)}
            icon={<FaKey />}
            title="Resetear contraseña"
          />
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteUser(user.id)}
              icon={<FaTrash />}
              title="Eliminar"
              className={styles.deleteButton}
            />
          )}
        </div>
      ),
      width: 200
    }
  ];

  // Funciones auxiliares
  const getRoleLabel = (role) => roleLabels[role] || role;

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
      pending: 'Pendiente'
    };
    return statusLabels[status] || status;
  };

  // Exportar usuarios
  const handleExport = async (format) => {
    try {
      const params = { ...filters, format };
      // Aquí iría la lógica de exportación
      console.log('Exportando usuarios:', params);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  // Renderizar filtros
  const renderFilters = () => (
    <div className={styles.filtersPanel}>
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Buscar</label>
          <div className={styles.searchInput}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Nombre, email o teléfono..."
              value={filters.search}
              onChange={(e) => applyFilters({ search: e.target.value })}
            />
          </div>
        </div>
        
        <div className={styles.filterGroup}>
          <label>Rol</label>
          <select
            value={filters.role}
            onChange={(e) => applyFilters({ role: e.target.value })}
          >
            <option value="">Todos los roles</option>
            {roleOptions.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Estado</label>
          <select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
            <option value="suspended">Suspendido</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Iglesia</label>
          <select
            value={filters.church}
            onChange={(e) => applyFilters({ church: e.target.value })}
          >
            <option value="">Todas las iglesias</option>
            {churches.map(church => (
              <option key={church.id} value={church.id}>
                {church.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <label>Fecha desde</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => applyFilters({ dateFrom: e.target.value })}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Fecha hasta</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => applyFilters({ dateTo: e.target.value })}
          />
        </div>

        <div className={styles.filterActions}>
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.usersPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>
            <FaUsers className={styles.headerIcon} />
            Administración de Usuarios
          </h1>
          <p>Gestiona usuarios, roles y permisos del sistema</p>
        </div>
        
        <div className={styles.headerActions}>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            icon={<FaFilter />}
            className={showFilters ? styles.active : ''}
          >
            Filtros
          </Button>
          
          <ExportMenu
            formats={['xlsx', 'pdf']}
            onExport={handleExport}
          />

          {canCreate && (
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
              icon={<FaUpload />}
            >
              Importar
            </Button>
          )}

          {canCreate && (
            <Button
              variant="primary"
              onClick={openCreateModal}
              icon={<FaUserPlus />}
            >
              Nuevo Usuario
            </Button>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <UserStats stats={stats} />

      {/* Filtros */}
      {showFilters && renderFilters()}

      {/* Acciones en lote */}
      {bulkSelection.length > 0 && (
        <BulkActions
          selectedUsers={selectedUsers}
          onBulkOperation={bulkOperation}
          onClearSelection={() => setBulkSelection([])}
        />
      )}

      {/* Tabla de usuarios */}
      <div className={styles.tableContainer}>
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <Button variant="outline" onClick={refreshData}>
              Reintentar
            </Button>
          </div>
        )}

        {loading && users.length === 0 ? (
          <Loading message="Cargando usuarios..." />
        ) : (
          <DataTable
            data={users || []}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={changePage}
            onPageSizeChange={changePageSize}
            sortConfig={sortConfig}
            onSort={sort}
            emptyMessage="No se encontraron usuarios"
          />
        )}
      </div>

      {/* Modal de usuario */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          modalMode === 'create' ? 'Nuevo Usuario' :
          modalMode === 'edit' ? 'Editar Usuario' :
          'Detalles del Usuario'
        }
        size="large"
      >
        <UserForm
          mode={modalMode}
          data={formData}
          errors={formErrors}
          churches={churches}
          loading={loading}
          onChange={setFormData}
          onSubmit={modalMode === 'create' ? createUser : (data) => updateUser(formData.id, data)}
          onCancel={closeModal}
        />
      </Modal>

      <BulkImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        entity="users"
        onImported={refreshData}
      />
    </div>
  );
};

export default Users;