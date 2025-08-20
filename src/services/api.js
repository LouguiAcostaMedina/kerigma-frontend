import axios from 'axios';
import { API_BASE_URL, ERROR_MESSAGES, STORAGE_KEYS } from '@/constants';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en response interceptor:', error);
    
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token inválido o expirado
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          window.location.href = '/login';
          return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
        
        case 403:
          return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
        
        case 400:
          return Promise.reject(new Error(data.message || ERROR_MESSAGES.VALIDATION_ERROR));
        
        case 500:
          return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
        
        default:
          return Promise.reject(new Error(data.message || 'Error desconocido'));
      }
    } else if (error.request) {
      // Error de red
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    } else {
      // Error en configuración de la request
      return Promise.reject(new Error('Error en la configuración de la petición'));
    }
  }
);

// Funciones auxiliares para diferentes tipos de requests
export const apiService = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // PATCH request
  patch: async (url, data = {}, config = {}) => {
    try {
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api;