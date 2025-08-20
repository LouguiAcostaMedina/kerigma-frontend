import { VALIDATION_RULES, MARITAL_STATUS } from '@/constants';

// Utilidades para formateo de fechas
export const dateUtils = {
  // Formatear fecha a string legible
  formatDate: (date, options = {}) => {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return dateObj.toLocaleDateString('es-ES', { ...defaultOptions, ...options });
  },

  // Formatear fecha para inputs de tipo date
  formatDateForInput: (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0];
  },

  // Calcular edad basada en fecha de nacimiento
  calculateAge: (birthDate) => {
    if (!birthDate) return 0;
    
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Obtener fecha actual en formato ISO
  getCurrentDate: () => {
    return new Date().toISOString();
  },

  // Verificar si una fecha es válida
  isValidDate: (date) => {
    return date instanceof Date && !isNaN(date);
  }
};

// Utilidades para validación de formularios
export const validationUtils = {
  // Validar email
  isValidEmail: (email) => {
    return VALIDATION_RULES.EMAIL.test(email);
  },

  // Validar teléfono
  isValidPhone: (phone) => {
    return VALIDATION_RULES.PHONE.test(phone);
  },

  // Validar contraseña
  isValidPassword: (password) => {
    return password && password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;
  },

  // Validar nombre
  isValidName: (name) => {
    return name && name.trim().length >= VALIDATION_RULES.NAME_MIN_LENGTH;
  },

  // Validar edad
  isValidAge: (age) => {
    const numAge = parseInt(age);
    return numAge >= VALIDATION_RULES.MIN_AGE && numAge <= VALIDATION_RULES.MAX_AGE;
  },

  // Validar campo requerido
  isRequired: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },

  // Validar formulario completo
  validateForm: (formData, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field];
      const value = formData[field];
      
      // Verificar campo requerido
      if (rule.required && !validationUtils.isRequired(value)) {
        errors[field] = `${rule.label || field} es requerido`;
        return;
      }
      
      // Si el campo no es requerido y está vacío, no validar
      if (!rule.required && !validationUtils.isRequired(value)) {
        return;
      }
      
      // Validaciones específicas
      if (rule.type === 'email' && !validationUtils.isValidEmail(value)) {
        errors[field] = 'Email inválido';
      } else if (rule.type === 'phone' && !validationUtils.isValidPhone(value)) {
        errors[field] = 'Teléfono inválido';
      } else if (rule.type === 'password' && !validationUtils.isValidPassword(value)) {
        errors[field] = `La contraseña debe tener al menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`;
      } else if (rule.type === 'name' && !validationUtils.isValidName(value)) {
        errors[field] = `${rule.label || field} debe tener al menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres`;
      } else if (rule.type === 'age' && !validationUtils.isValidAge(value)) {
        errors[field] = 'Edad inválida';
      }
      
      // Validación de longitud mínima y máxima
      if (rule.minLength && value.length < rule.minLength) {
        errors[field] = `${rule.label || field} debe tener al menos ${rule.minLength} caracteres`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[field] = `${rule.label || field} no puede tener más de ${rule.maxLength} caracteres`;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Utilidades para formateo de texto
export const textUtils = {
  // Capitalizar primera letra
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Capitalizar cada palabra
  capitalizeWords: (str) => {
    if (!str) return '';
    return str.split(' ').map(word => textUtils.capitalize(word)).join(' ');
  },

  // Truncar texto
  truncate: (str, maxLength = 100) => {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
  },

  // Formatear estado civil
  formatMaritalStatus: (status) => {
    const statusMap = {
      [MARITAL_STATUS.SINGLE]: 'Soltero/a',
      [MARITAL_STATUS.MARRIED]: 'Casado/a',
      [MARITAL_STATUS.DIVORCED]: 'Divorciado/a',
      [MARITAL_STATUS.WIDOWED]: 'Viudo/a'
    };
    return statusMap[status] || status;
  },

  // Generar iniciales
  getInitials: (fullName) => {
    if (!fullName) return '';
    return fullName.split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }
};

// Utilidades para números y cálculos
export const numberUtils = {
  // Formatear número como moneda
  formatCurrency: (amount, currency = 'PEN') => {
    if (amount === null || amount === undefined) return '0.00';
    
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Formatear número con separadores de miles
  formatNumber: (number) => {
    if (number === null || number === undefined) return '0';
    return new Intl.NumberFormat('es-PE').format(number);
  },

  // Calcular porcentaje
  calculatePercentage: (part, total) => {
    if (!total || total === 0) return 0;
    return Math.round((part / total) * 100 * 100) / 100;
  },

  // Calcular promedio
  calculateAverage: (numbers) => {
    if (!Array.isArray(numbers) || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + (parseFloat(num) || 0), 0);
    return Math.round((sum / numbers.length) * 100) / 100;
  },

  // Sumar array de números
  sumArray: (numbers) => {
    if (!Array.isArray(numbers)) return 0;
    return numbers.reduce((acc, num) => acc + (parseFloat(num) || 0), 0);
  },

  // Validar si es un número válido
  isValidNumber: (value) => {
    return !isNaN(value) && isFinite(value);
  }
};

// Utilidades para arrays y objetos
export const dataUtils = {
  // Agrupar array por campo
  groupBy: (array, key) => {
    if (!Array.isArray(array)) return {};
    
    return array.reduce((groups, item) => {
      const groupKey = item[key];
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {});
  },

  // Ordenar array por campo
  sortBy: (array, key, ascending = true) => {
    if (!Array.isArray(array)) return [];
    
    return [...array].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue < bValue) return ascending ? -1 : 1;
      if (aValue > bValue) return ascending ? 1 : -1;
      return 0;
    });
  },

  // Filtrar array por múltiples criterios
  filterBy: (array, filters) => {
    if (!Array.isArray(array) || !filters) return array;
    
    return array.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key];
        const itemValue = item[key];
        
        if (filterValue === null || filterValue === undefined || filterValue === '') {
          return true;
        }
        
        if (typeof filterValue === 'string') {
          return itemValue?.toString().toLowerCase().includes(filterValue.toLowerCase());
        }
        
        return itemValue === filterValue;
      });
    });
  },

  // Buscar en array por texto
  searchInArray: (array, searchTerm, searchFields) => {
    if (!Array.isArray(array) || !searchTerm) return array;
    
    const term = searchTerm.toLowerCase();
    
    return array.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return value?.toString().toLowerCase().includes(term);
      });
    });
  },

  // Paginar array
  paginate: (array, page, pageSize) => {
    if (!Array.isArray(array)) return { items: [], totalPages: 0, currentPage: 1 };
    
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      items: array.slice(startIndex, endIndex),
      totalPages: Math.ceil(array.length / pageSize),
      currentPage: page,
      totalItems: array.length
    };
  }
};

// Utilidades para localStorage
export const storageUtils = {
  // Guardar dato en localStorage
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
    }
  },

  // Obtener dato de localStorage
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error obteniendo de localStorage:', error);
      return defaultValue;
    }
  },

  // Remover dato de localStorage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removiendo de localStorage:', error);
    }
  },

  // Limpiar localStorage
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
    }
  }
};

// Utilidades para archivos
export const fileUtils = {
  // Convertir archivo a base64
  toBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Validar tipo de archivo
  isValidFileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  },

  // Validar tamaño de archivo
  isValidFileSize: (file, maxSizeInMB) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  // Generar nombre único para archivo
  generateFileName: (originalName) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }
};

// Utilidades para URL
export const urlUtils = {
  // Construir URL con parámetros
  buildUrl: (baseUrl, params = {}) => {
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    return url.toString();
  },

  // Obtener parámetros de la URL actual
  getUrlParams: () => {
    const params = {};
    const urlSearchParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlSearchParams) {
      params[key] = value;
    }
    return params;
  }
};

// Utilidades para notificaciones toast
export const notificationUtils = {
  // Mostrar notificación de éxito
  showSuccess: (message) => {
    // Implementación básica con alert, se puede mejorar con una librería de toast
    console.log('Success:', message);
    // TODO: Implementar con react-toastify u otra librería
  },

  // Mostrar notificación de error
  showError: (message) => {
    console.error('Error:', message);
    // TODO: Implementar con react-toastify u otra librería
  },

  // Mostrar notificación de información
  showInfo: (message) => {
    console.info('Info:', message);
    // TODO: Implementar con react-toastify u otra librería
  },

  // Mostrar notificación de advertencia
  showWarning: (message) => {
    console.warn('Warning:', message);
    // TODO: Implementar con react-toastify u otra librería
  }
};

// Función para debounce (útil para búsquedas)
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};