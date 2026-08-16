/**
 * Hook personalizado para la gestión de iglesias
 * Maneja el estado y operaciones CRUD de iglesias, filtros y paginación
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { churchesService } from '@/services/churchesService';
import { showNotification } from '@/utils/notifications';
import { useAuth } from './useAuth';

export const useChurches = () => {
  // ===================== ESTADO PRINCIPAL =====================
  const [churches, setChurches] = useState([]);

  // ===================== ESTADO DE UI =====================
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===================== PAGINACIÓN =====================
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    from: 0,
    to: 0
  });

  // ===================== ESTADO DE MODALES =====================
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit | view
  const [formData, setFormData] = useState({});

  // ===================== FILTROS, ORDEN Y PAGINACIÓN DE LISTA =====================
  const filtersRef = useRef({ search: '', status: '', city: '', state: '', minMembers: '', maxMembers: '' });
  const [filters, setFilters] = useState(filtersRef.current);
  const sortConfigRef = useRef({ key: 'name', direction: 'asc' });
  const [sortConfig, setSortConfig] = useState(sortConfigRef.current);
  const pageRef = useRef(1);
  const pageSizeRef = useRef(10);

  // ===================== REFERENCIAS Y CACHE =====================
  const abortControllerRef = useRef(null);
  const cacheRef = useRef(new Map());
  const lastParamsRef = useRef(null);

  // ===================== OPERACIONES CRUD BÁSICAS =====================

  /**
   * Obtener lista de iglesias con filtros
   */
  const fetchChurches = useCallback(async (params = {}) => {
    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Evitar llamadas duplicadas
    const paramsString = JSON.stringify(params);
    if (paramsString === lastParamsRef.current) {
      return;
    }
    lastParamsRef.current = paramsString;

    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.getChurches(params, abortControllerRef.current.signal);
      if (!response) return;

      setChurches(response.data || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        total: response.total || 0,
        from: response.from || 0,
        to: response.to || 0
      });

      return response;
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('Error fetching churches:', err);
      setError(err.message || 'Error al cargar las iglesias');
      showNotification({
        type: 'error',
        title: 'Error',
        message: 'Error al cargar las iglesias'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nueva iglesia
   */
  const createChurch = useCallback(async (churchData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.createChurch(churchData);

      // Actualizar lista local
      setChurches(current => [response, ...current]);

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia creada correctamente'
      });

      // Limpiar cache
      cacheRef.current.clear();

      return response;
    } catch (err) {
      console.error('Error creating church:', err);
      setError(err.message || 'Error al crear la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al crear la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar iglesia existente
   */
  const updateChurch = useCallback(async (id, churchData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await churchesService.updateChurch(id, churchData);

      // Actualizar lista local
      setChurches(current =>
        current.map(church => church.id === id ? response : church)
      );

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia actualizada correctamente'
      });

      // Limpiar cache
      cacheRef.current.delete(`church_${id}`);

      return response;
    } catch (err) {
      console.error('Error updating church:', err);
      setError(err.message || 'Error al actualizar la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al actualizar la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar iglesia
   */
  const deleteChurch = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      await churchesService.deleteChurch(id);

      // Actualizar lista local
      setChurches(current => current.filter(church => church.id !== id));

      showNotification({
        type: 'success',
        title: 'Éxito',
        message: 'Iglesia eliminada correctamente'
      });

      // Limpiar cache
      cacheRef.current.delete(`church_${id}`);

      return true;
    } catch (err) {
      console.error('Error deleting church:', err);
      setError(err.message || 'Error al eliminar la iglesia');
      showNotification({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Error al eliminar la iglesia'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===================== MODALES Y PERMISOS =====================

  const { hasPermission } = useAuth();

  const canCreate = useMemo(() => hasPermission('churches.create'), [hasPermission]);
  const canUpdate = useMemo(() => hasPermission('churches.update'), [hasPermission]);
  const canDelete = useMemo(() => hasPermission('churches.delete'), [hasPermission]);

  const openCreateModal = useCallback(() => {
    setFormData({});
    setModalMode('create');
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((churchData) => {
    setFormData(churchData || {});
    setModalMode('edit');
    setShowModal(true);
  }, []);

  const openViewModal = useCallback((churchData) => {
    setFormData(churchData || {});
    setModalMode('view');
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setFormData({});
  }, []);

  // ===================== FILTROS, ORDEN Y PAGINACIÓN =====================

  const buildParams = useCallback((overrides = {}) => ({
    page: overrides.page ?? pageRef.current,
    limit: overrides.limit ?? pageSizeRef.current,
    search: filtersRef.current.search || undefined,
    status: filtersRef.current.status || undefined,
    city: filtersRef.current.city || undefined,
    state: filtersRef.current.state || undefined,
    minMembers: filtersRef.current.minMembers || undefined,
    maxMembers: filtersRef.current.maxMembers || undefined,
    sortField: sortConfigRef.current.key || undefined,
    sortDirection: sortConfigRef.current.direction || undefined,
    ...overrides
  }), []);

  const applyFilters = useCallback((partial) => {
    const next = { ...filtersRef.current, ...partial };
    filtersRef.current = next;
    setFilters(next);
    pageRef.current = 1;
    fetchChurches(buildParams({ page: 1 }));
  }, [fetchChurches, buildParams]);

  const clearFilters = useCallback(() => {
    const next = { search: '', status: '', city: '', state: '', minMembers: '', maxMembers: '' };
    filtersRef.current = next;
    setFilters(next);
    pageRef.current = 1;
    fetchChurches(buildParams({ page: 1 }));
  }, [fetchChurches, buildParams]);

  const sort = useCallback((key, direction) => {
    const nextSort = { key, direction: direction || 'asc' };
    sortConfigRef.current = nextSort;
    setSortConfig(nextSort);
    fetchChurches(buildParams({ sortField: key, sortDirection: nextSort.direction }));
  }, [fetchChurches, buildParams]);

  const changePage = useCallback((page) => {
    const p = Math.max(1, Number(page) || 1);
    pageRef.current = p;
    fetchChurches(buildParams({ page: p }));
  }, [fetchChurches, buildParams]);

  const changePageSize = useCallback((size) => {
    const nextSize = Number(size) || 10;
    pageSizeRef.current = nextSize;
    pageRef.current = 1;
    fetchChurches(buildParams({ page: 1, limit: nextSize }));
  }, [fetchChurches, buildParams]);

  const refreshData = useCallback(() => {
    lastParamsRef.current = null;
    fetchChurches(buildParams());
  }, [fetchChurches, buildParams]);

  // ===================== RETURN HOOK =====================
  return {
    // ===================== ESTADO =====================
    churches,
    pagination,
    filters,
    sortConfig,

    // ===================== ESTADO DE MODALES =====================
    showModal,
    modalMode,
    formData,

    // ===================== PERMISOS =====================
    canCreate,
    canUpdate,
    canDelete,

    // ===================== ESTADOS DE CARGA =====================
    loading,
    error,

    // ===================== OPERACIONES CRUD =====================
    fetchChurches,
    createChurch,
    updateChurch,
    deleteChurch,

    // ===================== FILTROS, ORDEN Y PAGINACIÓN =====================
    applyFilters,
    clearFilters,
    sort,
    changePage,
    changePageSize,
    refreshData,

    // ===================== MANEJO DE MODALES =====================
    openCreateModal,
    openEditModal,
    openViewModal,
    closeModal
  };
};
