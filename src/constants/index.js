// Constantes para el sistema de gestión de iglesia
// Importamos los roles desde su propio archivo para mantener el código DRY (Don't Repeat Yourself)
import { ROLES, ROLE_LABELS } from './roles';
// 2. Las exportamos inmediatamente para que Sidebar.jsx las pueda leer desde aquí
export { ROLES, ROLE_LABELS };
// 🔄 CAMBIO CLAVE: Ahora es dinámica. Si no existe la variable de entorno, usa el fallback local.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Configuración de semanas para reportes trimestrales
export const WEEKS_CONFIG = {
  TOTAL_WEEKS: 13,
  QUARTERS: [
    { name: 'Q1', weeks: [1, 2, 3, 4] },
    { name: 'Q2', weeks: [5, 6, 7, 8] },
    { name: 'Q3', weeks: [9, 10, 11, 12] },
    { name: 'Q4', weeks: [13] }
  ]
};

// Estados civiles para miembros
export const MARITAL_STATUS = {
  SINGLE: 'soltero',
  MARRIED: 'casado',
  DIVORCED: 'divorciado',
  WIDOWED: 'viudo'
};

// Configuración de indicadores espirituales
export const SPIRITUAL_INDICATORS = {
  ATTENDANCE: 'attendance_avg',
  STUDY: 'study_avg', 
  OFFERINGS: 'offerings_sum'
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  UNAUTHORIZED: 'No tiene permisos para realizar esta acción.',
  INVALID_CREDENTIALS: 'Credenciales inválidas.',
  SERVER_ERROR: 'Error del servidor. Inténtelo más tarde.',
  VALIDATION_ERROR: 'Por favor complete todos los campos requeridos.'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '¡Bienvenido al sistema!',
  SAVE_SUCCESS: 'Datos guardados correctamente.',
  UPDATE_SUCCESS: 'Datos actualizados correctamente.',
  DELETE_SUCCESS: 'Registro eliminado correctamente.',
  PASSWORD_CHANGED: 'Contraseña cambiada exitosamente.'
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50]
};

// Colores para gráficos
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  INFO: '#8B5CF6',
  GRAY: '#6B7280'
};

// Configuración de exportación
export const EXPORT_CONFIG = {
  FORMATS: {
    PDF: 'pdf',
    EXCEL: 'xlsx'
  },
  FILE_NAMES: {
    MISSIONARY_TABLE: 'tabla_misionera',
    BIBLE_STUDENTS: 'estudiantes_biblicos',
    GROUP_METRICS: 'metricas_grupales'
  }
};

// Validaciones de formularios
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]{10,}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  MAX_AGE: 120,
  MIN_AGE: 0
};

// Configuración de localStorage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  THEME: 'app_theme',
  LANGUAGE: 'app_language'
};