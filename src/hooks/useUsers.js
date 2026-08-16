/**
 * Hook personalizado para gestión completa de usuarios
 * Proporciona operaciones CRUD, gestión de roles, estados y permisos
 * Incluye cache inteligente, optimizaciones y manejo de errores
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {usersService} from '../services/usersService';
import { useAuth } from './useAuth';
import { showNotification } from '../utils/notifications';

export const useUsers = (initialFilters = {}) => {
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: 'active',
    church: '',
    dateFrom: '',
    dateTo: '',
    ...initialFilters
  });

  // Estados para estadísticas y métricas
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {},
    byChurch: {},
    recentActivity: []
  });

  // Estados para operaciones
  const [bulkSelection, setBulkSelection] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc'
  });

  // Estados para formularios y modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create, edit, view
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  // Cache
  const [cache, setCache] = useState(new Map());
  const [lastFetch, setLastFetch] = useState(null);

  const { hasPermission } = useAuth();

  // Cargar usuarios con paginación y filtros
  const fetchUsers = useCallback(async (page = 1, customFilters = {}) => {
    if (!hasPermission('users.read')) {
      setError('No tienes permisos para ver usuarios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cacheKey = `users_${page}_${JSON.stringify({ ...filters, ...customFilters })}`;
      
      // Verificar cache (válido por 5 minutos)
      if (cache.has(cacheKey) && lastFetch && Date.now() - lastFetch < 300000) {
        const cachedData = cache.get(cacheKey);
        setUsers(cachedData.users);
        setPagination(cachedData.pagination);
        setStats(cachedData.stats);
        setLoading(false);
        return;
      }

      const params = {
        page,
        limit: pagination.limit,
        ...filters,
        ...customFilters,
        sortField: sortConfig.field,
        sortDirection: sortConfig.direction
      };

      const response = await usersService.getUsers(params);
      
      setUsers(response.users);
      setPagination(response.pagination);
      setStats(response.stats);
      
      // Actualizar cache
      const newCache = new Map(cache);
      newCache.set(cacheKey, response);
      setCache(newCache);
      setLastFetch(Date.now());
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message || 'Error al cargar usuarios');
      showNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, sortConfig, cache, lastFetch, hasPermission]);

  // Crear usuario
  const createUser = useCallback(async (userData) => {
    if (!hasPermission('users.create')) {
      showNotification('No tienes permisos para crear usuarios', 'error');
      return false;
    }

    setLoading(true);
    setFormErrors({});

    try {
      const newUser = await usersService.createUser(userData);
      
      // Actualizar lista local
      setUsers(prev => [newUser, ...prev]);
      
      // Limpiar cache para forzar recarga
      setCache(new Map());
      
      showNotification('Usuario creado exitosamente', 'success');
      setShowModal(false);
      setFormData({});
      
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.validationErrors) {
        setFormErrors(error.validationErrors);
      } else {
        showNotification(error.message || 'Error al crear usuario', 'error');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Actualizar usuario
  const updateUser = useCallback(async (id, userData) => {
    if (!hasPermission('users.update')) {
      showNotification('No tienes permisos para actualizar usuarios', 'error');
      return false;
    }

    setLoading(true);
    setFormErrors({});

    try {
      const updatedUser = await usersService.updateUser(id, userData);
      
      // Actualizar lista local
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      // Limpiar cache
      setCache(new Map());
      
      showNotification('Usuario actualizado exitosamente', 'success');
      setShowModal(false);
      setFormData({});
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      
      if (error.validationErrors) {
        setFormErrors(error.validationErrors);
      } else {
        showNotification(error.message || 'Error al actualizar usuario', 'error');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Eliminar usuario
  const deleteUser = useCallback(async (id) => {
    if (!hasPermission('users.delete')) {
      showNotification('No tienes permisos para eliminar usuarios', 'error');
      return false;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return false;
    }

    setLoading(true);

    try {
      await usersService.deleteUser(id);
      
      // Remover de lista local
      setUsers(prev => prev.filter(u => u.id !== id));
      
      // Limpiar cache
      setCache(new Map());
      
      showNotification('Usuario eliminado exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification(error.message || 'Error al eliminar usuario', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Cambiar estado de usuario (activar/desactivar)
  const toggleUserStatus = useCallback(async (id, status) => {
    if (!hasPermission('users.update')) {
      showNotification('No tienes permisos para cambiar el estado de usuarios', 'error');
      return false;
    }

    setLoading(true);

    try {
      const updatedUser = await usersService.updateUserStatus(id, status);
      
      // Actualizar lista local
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      
      const statusText = status === 'active' ? 'activado' : 'desactivado';
      showNotification(`Usuario ${statusText} exitosamente`, 'success');
      
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification(error.message || 'Error al cambiar estado del usuario', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Operaciones en lote
  const bulkOperation = useCallback(async (operation, userIds, data = {}) => {
    if (!hasPermission('users.bulk')) {
      showNotification('No tienes permisos para operaciones en lote', 'error');
      return false;
    }

    if (userIds.length === 0) {
      showNotification('Selecciona al menos un usuario', 'warning');
      return false;
    }

    setLoading(true);

    try {
      await usersService.bulkOperation(operation, userIds, data);
      
      // Recargar datos
      await fetchUsers();
      
      setBulkSelection([]);
      showNotification(`Operación en lote completada para ${userIds.length} usuarios`, 'success');
      
      return true;
    } catch (error) {
      console.error('Error in bulk operation:', error);
      showNotification(error.message || 'Error en operación en lote', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, hasPermission]);

  // Enviar email de invitación
  const sendInvitation = useCallback(async (userId) => {
    if (!hasPermission('users.invite')) {
      showNotification('No tienes permisos para enviar invitaciones', 'error');
      return false;
    }

    setLoading(true);

    try {
      await usersService.sendInvitation(userId);
      showNotification('Invitación enviada exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      showNotification(error.message || 'Error al enviar invitación', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Resetear contraseña
  const resetPassword = useCallback(async (userId) => {
    if (!hasPermission('users.reset_password')) {
      showNotification('No tienes permisos para resetear contraseñas', 'error');
      return false;
    }

    if (!window.confirm('¿Enviar email de recuperación de contraseña?')) {
      return false;
    }

    setLoading(true);

    try {
      await usersService.resetPassword(userId);
      showNotification('Email de recuperación enviado exitosamente', 'success');
      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      showNotification(error.message || 'Error al resetear contraseña', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  }, [hasPermission]);

  // Funciones de utilidad
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      role: '',
      status: 'active',
      church: '',
      dateFrom: '',
      dateTo: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changePageSize = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const sort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Funciones para modales y formularios
  const openCreateModal = useCallback(() => {
    setFormData({});
    setFormErrors({});
    setModalMode('create');
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((userData) => {
    setFormData(userData);
    setFormErrors({});
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const openViewModal = useCallback((userData) => {
    setFormData(userData);
    setModalMode('view');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setFormData({});
    setFormErrors({});
  }, []);

  // Selección múltiple
  const toggleSelection = useCallback((userId) => {
    setBulkSelection(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const selectAll = useCallback(() => {
    const allIds = users.map(user => user.id);
    setBulkSelection(prev => 
      prev.length === allIds.length ? [] : allIds
    );
  }, [users]);

  // Valores computados
  const filteredUsersCount = useMemo(() => users.length, [users]);
  
  const selectedUsers = useMemo(() => 
    users.filter(user => bulkSelection.includes(user.id)),
    [users, bulkSelection]
  );

  const canCreate = useMemo(() => hasPermission('users.create'), [hasPermission]);
  const canUpdate = useMemo(() => hasPermission('users.update'), [hasPermission]);
  const canDelete = useMemo(() => hasPermission('users.delete'), [hasPermission]);

  // Efectos
  useEffect(() => {
    fetchUsers(pagination.page, filters);
  }, [fetchUsers, pagination.page, filters]);

  // Limpiar cache cada 10 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      setCache(new Map());
      setLastFetch(null);
    }, 600000);

    return () => clearInterval(interval);
  }, []);

  return {
    // Datos
    users,
    stats,
    pagination,
    filters,
    sortConfig,
    
    // Estados
    loading,
    error,
    showModal,
    modalMode,
    formData,
    formErrors,
    bulkSelection,
    selectedUsers,
    filteredUsersCount,
    
    // Permisos
    canCreate,
    canUpdate,
    canDelete,
    
    // Operaciones CRUD
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    
    // Operaciones especiales
    bulkOperation,
    sendInvitation,
    resetPassword,
    
    // Filtros y navegación
    applyFilters,
    clearFilters,
    changePage,
    changePageSize,
    sort,
    
    // Modales y formularios
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal,
    setFormData,
    
    // Selección múltiple
    toggleSelection,
    selectAll,
    setBulkSelection,
    
    // Utilidades
    refreshData: () => {
      setCache(new Map());
      fetchUsers(pagination.page, filters);
    }
  };
};