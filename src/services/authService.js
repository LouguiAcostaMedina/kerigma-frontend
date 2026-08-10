import { apiService } from './api';

// Servicio de autenticación basado en cookies HttpOnly (withCredentials).
// No se guardan tokens ni usuario en localStorage; la sesión se recupera vía GET /auth/me.
class AuthService {
  constructor() {
    this.endpoints = {
      LOGIN: '/auth/login',
      REGISTER: '/auth/signup',
      REFRESH_TOKEN: '/auth/refresh',
      ME: '/auth/me',
      LOGOUT: '/auth/logout',
      CHANGE_PASSWORD: '/auth/change-password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      PROFILE: '/auth/profile'
    };

    // Sesión en memoria: se pierde al recargar, se restaura con checkAuthStatus -> GET /auth/me
    this.currentUser = null;
  }

  // Iniciar sesión con email y contraseña
  async login(credentials) {
    try {
      const response = await apiService.post(this.endpoints.LOGIN, {
        email: credentials.email,
        password: credentials.password
      });

      // Envelope del backend: { success, data: { user }, message }
      const data = response?.data || response;
      const user = data?.user || (data?.email ? data : null);

      if (user) {
        this.currentUser = user;
        return {
          success: true,
          user,
          message: response?.message || 'Inicio de sesión exitoso'
        };
      }

      return { success: false, error: 'Respuesta del servidor incompleta' };
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await apiService.post(this.endpoints.REGISTER, userData);
      const data = response?.data || response;
      const user = data?.user || null;
      if (user) {
        this.currentUser = user;
      }
      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Cerrar sesión (limpia las cookies HttpOnly en el servidor)
  async logout() {
    try {
      await apiService.post(this.endpoints.LOGOUT);
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.currentUser = null;
    }
  }

  // Obtener token actual: no se almacena en el cliente, las cookies son HttpOnly
  getToken() {
    return null;
  }

  // Obtener datos del usuario actual (solo memoria)
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar si el usuario está autenticado (sesión en memoria)
  isAuthenticated() {
    return Boolean(this.currentUser);
  }

  // 🛠️ CORRECCIÓN DE ROL: Soporta tanto single-role como multi-role, singular y plural
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Extrae de forma segura el rol independientemente de si viene como 'role' o 'roles'
    const userRole = user.role || user.roles;
    if (!userRole) return false;

    const userRolesArray = Array.isArray(userRole) ? userRole : [userRole];

    // Normalizador idéntico al del contexto para evitar falsos negativos ingles/español
    const normalize = (r) => {
      if (!r) return '';
      const clean = r.toLowerCase().trim();
      if (clean === 'admin') return 'administrador';
      if (clean === 'reader') return 'lector';
      if (clean === 'leader') return 'lider';
      return clean;
    };

    return userRolesArray.some(r => normalize(r) === normalize(requiredRole));
  }

  // Verificar si el usuario tiene cualquiera de los roles especificados
  hasAnyRole(roles) {
    if (!roles) return false;
    if (!Array.isArray(roles)) {
      return this.hasRole(roles);
    }

    return roles.some(role => this.hasRole(role));
  }

  // Cambiar contraseña
  async changePassword(passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;
      const response = await apiService.post(this.endpoints.CHANGE_PASSWORD, {
        currentPassword,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  }

  // Solicitar restablecimiento de contraseña
  async forgotPassword(email) {
    try {
      const response = await apiService.post(this.endpoints.FORGOT_PASSWORD, {
        email
      });
      return response;
    } catch (error) {
      console.error('Error en forgot password:', error);
      throw error;
    }
  }

  // Restablecer contraseña con token
  async resetPassword(resetData) {
    try {
      const { token, newPassword } = resetData;
      const response = await apiService.post(this.endpoints.RESET_PASSWORD, {
        token,
        newPassword
      });
      return response;
    } catch (error) {
      console.error('Error en reset password:', error);
      throw error;
    }
  }

  // Renovar sesión: el refresh token viaja en la cookie HttpOnly
  async refreshToken() {
    try {
      const response = await apiService.post(this.endpoints.REFRESH_TOKEN);
      return response;
    } catch (error) {
      console.error('Error renovando token:', error);
      this.currentUser = null;
      throw error;
    }
  }

  // Obtener información del perfil del usuario (GET /auth/me con cookies)
  async getProfile() {
    try {
      const response = await apiService.get(this.endpoints.ME);
      const data = response?.data || response;
      const user = data?.user || null;
      if (user) {
        this.currentUser = { ...user, church: data?.church || user.church || null };
      }
      return response;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData) {
    try {
      const response = await apiService.put(this.endpoints.PROFILE, profileData);
      const data = response?.data || response;
      const user = data?.user || (data?.email ? data : null);
      if (user) {
        this.currentUser = user;
      }
      return response;
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }
}

// Crear instancia única del servicio de autenticación
const authService = new AuthService();

export default authService;
