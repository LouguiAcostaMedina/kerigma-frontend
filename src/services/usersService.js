/**
 * Servicio para la administración de usuarios del sistema misionero
 * Maneja operaciones CRUD, roles, permisos y configuraciones de usuarios
 */

import { apiClient } from './apiClient';

const unwrap = (response) => response?.data ?? response;

export const cleanParams = (params = {}) => Object.fromEntries(Object.entries(params).filter(([, val]) => val !== "" && val !== null && val !== undefined));

export const usersService = {
  // ===================== OPERACIONES CRUD BÁSICAS =====================
  
  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  getUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('/users', { params: cleanParams(params) });
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario específico por ID
   */
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario
   */
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return unwrap(response);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario existente
   */
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return unwrap(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return unwrap(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Eliminar múltiples usuarios
   */
  deleteMultipleUsers: async (ids) => {
    try {
      const response = await apiClient.delete('/users/bulk', {
        data: { ids }
      });
      return unwrap(response);
    } catch (error) {
      console.error('Error deleting multiple users:', error);
      throw error;
    }
  },

  /**
   * Operación en lote genérica (delete, activate, deactivate, suspend, reactivate)
   */
  bulkOperation: async (operation, userIds, data = {}) => {
    try {
      const response = await apiClient.post('/users/bulk', {
        operation,
        userIds,
        ...data
      });
      return unwrap(response);
    } catch (error) {
      console.error('Error in bulk operation:', error);
      throw error;
    }
  },

  /**
   * Enviar email de invitación
   */
  sendInvitation: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/invite`);
      return unwrap(response);
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  /**
   * Enviar email de recuperación de contraseña
   */
  resetPassword: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/reset-password`);
      return unwrap(response);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  // ===================== GESTIÓN DE ESTADOS Y ACTIVACIÓN =====================

  /**
   * Activar usuario
   */
  activateUser: async (id) => {
    try {
      const response = await apiClient.patch(`/users/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error('Error activating user:', error);
      throw error;
    }
  },

  /**
   * Desactivar usuario
   */
  deactivateUser: async (id) => {
    try {
      const response = await apiClient.patch(`/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.error('Error deactivating user:', error);
      throw error;
    }
  },

  /**
   * Suspender usuario temporalmente
   */
  suspendUser: async (id, suspensionData) => {
    try {
      const response = await apiClient.patch(`/users/${id}/suspend`, suspensionData);
      return response.data;
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  },

  /**
   * Reactivar usuario suspendido
   */
  reactivateUser: async (id) => {
    try {
      const response = await apiClient.patch(`/users/${id}/reactivate`);
      return response.data;
    } catch (error) {
      console.error('Error reactivating user:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de usuario
   */
  updateUserStatus: async (id, status, reason = null) => {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { status, reason });
      return unwrap(response);
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // ===================== GESTIÓN DE ROLES Y PERMISOS =====================

  /**
   * Obtener todos los roles disponibles
   */
  getRoles: async () => {
    try {
      const response = await apiClient.get('/users/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  },

  /**
   * Obtener permisos de un rol específico
   */
  getRolePermissions: async (roleId) => {
    try {
      const response = await apiClient.get(`/users/roles/${roleId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  },

  /**
   * Obtener roles de un usuario
   */
  getUserRoles: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      throw error;
    }
  },

  /**
   * Asignar rol a usuario
   */
  assignRoleToUser: async (userId, roleId, assignmentData = {}) => {
    try {
      const response = await apiClient.post(`/users/${userId}/roles`, {
        roleId,
        ...assignmentData
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  },

  /**
   * Remover rol de usuario
   */
  removeRoleFromUser: async (userId, roleId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw error;
    }
  },

  /**
   * Actualizar roles de usuario (reemplazar todos)
   */
  updateUserRoles: async (userId, roleIds) => {
    try {
      const response = await apiClient.put(`/users/${userId}/roles`, { roleIds });
      return response.data;
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  },

  /**
   * Obtener permisos efectivos de un usuario
   */
  getUserPermissions: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/permissions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  },

  /**
   * Verificar si usuario tiene permiso específico
   */
  checkUserPermission: async (userId, permission, resource = null) => {
    try {
      const response = await apiClient.post(`/users/${userId}/check-permission`, {
        permission,
        resource
      });
      return response.data;
    } catch (error) {
      console.error('Error checking user permission:', error);
      throw error;
    }
  },

  // ===================== ASIGNACIÓN A IGLESIAS =====================

  /**
   * Obtener iglesias asignadas a un usuario
   */
  getUserChurches: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/churches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user churches:', error);
      throw error;
    }
  },

  /**
   * Asignar usuario a iglesia
   */
  assignUserToChurch: async (userId, churchId, assignmentData) => {
    try {
      const response = await apiClient.post(`/users/${userId}/churches`, {
        churchId,
        ...assignmentData
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning user to church:', error);
      throw error;
    }
  },

  /**
   * Remover usuario de iglesia
   */
  removeUserFromChurch: async (userId, churchId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/churches/${churchId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing user from church:', error);
      throw error;
    }
  },

  /**
   * Actualizar asignaciones de iglesias para usuario
   */
  updateUserChurches: async (userId, churchAssignments) => {
    try {
      const response = await apiClient.put(`/users/${userId}/churches`, {
        assignments: churchAssignments
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user church assignments:', error);
      throw error;
    }
  },

  // ===================== PERFIL Y CONFIGURACIONES =====================

  /**
   * Obtener perfil completo de usuario
   */
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Actualizar perfil de usuario
   */
  updateUserProfile: async (userId, profileData) => {
    try {
      const response = await apiClient.put(`/users/${userId}/profile`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Subir avatar de usuario
   */
  uploadUserAvatar: async (userId, avatarFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading user avatar:', error);
      throw error;
    }
  },

  /**
   * Eliminar avatar de usuario
   */
  deleteUserAvatar: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/avatar`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user avatar:', error);
      throw error;
    }
  },

  /**
   * Obtener configuraciones de usuario
   */
  getUserSettings: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  },

  /**
   * Actualizar configuraciones de usuario
   */
  updateUserSettings: async (userId, settings) => {
    try {
      const response = await apiClient.put(`/users/${userId}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  },

  // ===================== AUTENTICACIÓN Y SEGURIDAD =====================

  /**
   * Forzar cambio de contraseña
   */
  forcePasswordChange: async (userId) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/force-password-change`);
      return response.data;
    } catch (error) {
      console.error('Error forcing password change:', error);
      throw error;
    }
  },

  /**
   * Resetear contraseña de usuario
   */
  resetUserPassword: async (userId, newPassword = null) => {
    try {
      const response = await apiClient.post(`/users/${userId}/reset-password`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  },

  /**
   * Generar token de restablecimiento de contraseña
   */
  generatePasswordResetToken: async (userId) => {
    try {
      const response = await apiClient.post(`/users/${userId}/generate-reset-token`);
      return response.data;
    } catch (error) {
      console.error('Error generating password reset token:', error);
      throw error;
    }
  },

  /**
   * Obtener sesiones activas de usuario
   */
  getUserSessions: async (userId) => {
    try {
      const response = await apiClient.get(`/users/${userId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  },

  /**
   * Terminar sesión específica de usuario
   */
  terminateUserSession: async (userId, sessionId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error terminating user session:', error);
      throw error;
    }
  },

  /**
   * Terminar todas las sesiones de usuario
   */
  terminateAllUserSessions: async (userId) => {
    try {
      const response = await apiClient.delete(`/users/${userId}/sessions`);
      return response.data;
    } catch (error) {
      console.error('Error terminating all user sessions:', error);
      throw error;
    }
  },

  // ===================== ACTIVIDAD Y AUDITORÍA =====================

  /**
   * Obtener historial de actividad de usuario
   */
  getUserActivity: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/activity`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  /**
   * Obtener logs de auditoría de usuario
   */
  getUserAuditLogs: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/audit-logs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      throw error;
    }
  },

  /**
   * Registrar acción de usuario
   */
  logUserAction: async (userId, actionData) => {
    try {
      const response = await apiClient.post(`/users/${userId}/log-action`, actionData);
      return response.data;
    } catch (error) {
      console.error('Error logging user action:', error);
      throw error;
    }
  },

  // ===================== ESTADÍSTICAS DE USUARIOS =====================

  /**
   * Obtener estadísticas de usuarios
   */
  getUsersStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/users/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users statistics:', error);
      throw error;
    }
  },

  /**
   * Obtener distribución de roles
   */
  getRoleDistribution: async () => {
    try {
      const response = await apiClient.get('/users/role-distribution');
      return response.data;
    } catch (error) {
      console.error('Error fetching role distribution:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios activos por período
   */
  getActiveUsersReport: async (period = 'month') => {
    try {
      const response = await apiClient.get('/users/active-report', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active users report:', error);
      throw error;
    }
  },

  /**
   * Obtener métricas de rendimiento de usuarios
   */
  getUserPerformanceMetrics: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/performance-metrics`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user performance metrics:', error);
      throw error;
    }
  },

  // ===================== NOTIFICACIONES =====================

  /**
   * Obtener notificaciones de usuario
   */
  getUserNotifications: async (userId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/${userId}/notifications`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  /**
   * Marcar notificación como leída
   */
  markNotificationAsRead: async (userId, notificationId) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  markAllNotificationsAsRead: async (userId) => {
    try {
      const response = await apiClient.patch(`/users/${userId}/notifications/read-all`);
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Enviar notificación a usuario
   */
  sendNotificationToUser: async (userId, notificationData) => {
    try {
      const response = await apiClient.post(`/users/${userId}/notifications`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  },

  /**
   * Enviar notificación masiva
   */
  sendBulkNotification: async (userIds, notificationData) => {
    try {
      const response = await apiClient.post('/users/notifications/bulk', {
        userIds,
        ...notificationData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      throw error;
    }
  },

  // ===================== BÚSQUEDA Y FILTROS =====================

  /**
   * Buscar usuarios por criterios
   */
  searchUsers: async (searchParams) => {
    try {
      const response = await apiClient.post('/users/search', searchParams);
      return response.data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  /**
   * Obtener filtros disponibles para usuarios
   */
  getUserFilters: async () => {
    try {
      const response = await apiClient.get('/users/filters');
      return response.data;
    } catch (error) {
      console.error('Error fetching user filters:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios por rol
   */
  getUsersByRole: async (roleId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/by-role/${roleId}`, { params: cleanParams(params) });
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  /**
   * Obtener usuarios por iglesia
   */
  getUsersByChurch: async (churchId, params = {}) => {
    try {
      const response = await apiClient.get(`/users/by-church/${churchId}`, { params: cleanParams(params) });
      return response.data;
    } catch (error) {
      console.error('Error fetching users by church:', error);
      throw error;
    }
  },

  // ===================== EXPORTACIÓN E IMPORTACIÓN =====================

  /**
   * Exportar usuarios a Excel
   */
  exportUsers: async (filters = {}) => {
    try {
      const response = await apiClient.post('/users/export/excel', filters, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  },

  /**
   * Exportar reporte de usuarios a PDF
   */
  exportUsersReport: async (reportType = 'summary', filters = {}) => {
    try {
      const response = await apiClient.post('/users/export/pdf', {
        reportType,
        filters
      }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users report:', error);
      throw error;
    }
  },

  /**
   * Importar usuarios desde Excel
   */
  importUsers: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  },

  // ===================== COMUNICACIÓN =====================

  /**
   * Enviar email a usuario
   */
  sendEmailToUser: async (userId, emailData) => {
    try {
      const response = await apiClient.post(`/users/${userId}/send-email`, emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending email to user:', error);
      throw error;
    }
  },

  /**
   * Enviar email masivo
   */
  sendBulkEmail: async (userIds, emailData) => {
    try {
      const response = await apiClient.post('/users/send-bulk-email', {
        userIds,
        ...emailData
      });
      return response.data;
    } catch (error) {
      console.error('Error sending bulk email:', error);
      throw error;
    }
  },

  /**
   * Obtener plantillas de email
   */
  getEmailTemplates: async () => {
    try {
      const response = await apiClient.get('/users/email-templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching email templates:', error);
      throw error;
    }
  },

  // ===================== VALIDACIÓN Y VERIFICACIÓN =====================

  /**
   * Verificar si email está disponible
   */
  checkEmailAvailability: async (email, excludeUserId = null) => {
    try {
      const response = await apiClient.post('/users/check-email', {
        email,
        excludeUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error checking email availability:', error);
      throw error;
    }
  },

  /**
   * Verificar si username está disponible
   */
  checkUsernameAvailability: async (username, excludeUserId = null) => {
    try {
      const response = await apiClient.post('/users/check-username', {
        username,
        excludeUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
  },

  /**
   * Validar datos de usuario
   */
  validateUserData: async (userData, userId = null) => {
    try {
      const response = await apiClient.post('/users/validate', {
        userData,
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error validating user data:', error);
      throw error;
    }
  },

  // ===================== CONFIGURACIONES DEL SISTEMA =====================

  /**
   * Obtener configuraciones de usuario del sistema
   */
  getSystemUserConfig: async () => {
    try {
      const response = await apiClient.get('/users/system-config');
      return response.data;
    } catch (error) {
      console.error('Error fetching system user config:', error);
      throw error;
    }
  },

  /**
   * Actualizar configuraciones de usuario del sistema
   */
  updateSystemUserConfig: async (config) => {
    try {
      const response = await apiClient.put('/users/system-config', config);
      return response.data;
    } catch (error) {
      console.error('Error updating system user config:', error);
      throw error;
    }
  }
};