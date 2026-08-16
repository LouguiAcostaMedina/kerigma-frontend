/**
 * Cliente API para el Sistema de Gestión Misionera
 * Compatible con todos los servicios existentes
 * Reutiliza la configuración de api.js existente
 */

import api, { apiService } from './api';

// Re-exportar la instancia principal de axios
export default api;

// Re-exportar el servicio API con métodos auxiliares
export { apiService };

// Exportar métodos individuales para compatibilidad con servicios existentes
export const apiClient = {
  // Métodos HTTP básicos
  get: apiService.get,
  post: apiService.post,
  put: apiService.put,
  delete: apiService.delete,
  patch: apiService.patch,

  // Métodos específicos para diferentes tipos de contenido
  postForm: async (url, formData, config = {}) => {
    const response = await api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    });
    return response.data;
  },

  // Método para descargar archivos (Excel, PDF)
  downloadFile: async (url, config = {}) => {
    const response = await api.get(url, {
      ...config,
      responseType: 'blob'
    });
    return response.data; // Retorna el blob directamente
  },

  // Método para subir archivos
  uploadFile: async (url, file, config = {}) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config.headers
      }
    });
    return response.data;
  },

  // Método con cancelación para requests largos
  getWithCancel: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      // Si es un error de cancelación, no lo propagamos
      if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
        return null;
      }
      throw error;
    }
  }
};

// Función para crear requests con cancelación
export const createCancelableRequest = () => {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    cancel: () => controller.abort(),
    
    // Métodos con cancelación incluida
    get: (url, config = {}) => 
      apiClient.getWithCancel(url, { ...config, signal: controller.signal }),
    
    post: (url, data = {}, config = {}) => 
      apiService.post(url, data, { ...config, signal: controller.signal }),
    
    put: (url, data = {}, config = {}) => 
      apiService.put(url, data, { ...config, signal: controller.signal }),
    
    delete: (url, config = {}) => 
      apiService.delete(url, { ...config, signal: controller.signal })
  };
};

// Constantes de endpoints para mantener consistencia
export const ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile'
  },

  // Dashboard
  DASHBOARD: {
    BASE: '/dashboard',
    STATS: '/dashboard/stats',
    METRICS: '/dashboard/metrics',
    CHARTS: '/dashboard/charts'
  },

  // Iglesias
  CHURCHES: {
    BASE: '/churches'
  },

  // Usuarios
  USERS: {
    BASE: '/users',
    ROLES: (id) => `/users/${id}/roles`,
    STATUS: (id) => `/users/${id}/status`
  },

  // Reportes
  REPORTS: {
    BASE: '/reports',
    CUSTOM: '/reports/custom',
    TEMPLATES: '/reports/templates',
    GENERATE: '/reports/generate'
  }
};

// Función helper para construir URLs con parámetros
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Reemplazar parámetros en la URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Función helper para construir query strings
export const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(`${key}[]`, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Función para manejar respuestas de archivos
export const handleFileDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'archivo.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};