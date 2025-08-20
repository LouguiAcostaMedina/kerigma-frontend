import { apiService } from './api';
import { STORAGE_KEYS } from '@/constants';

// Servicio de autenticación para manejar login, registro y gestión de tokens
class AuthService {
  constructor() {
    this.endpoints = {
      LOGIN: '/auth/signin',
      REGISTER: '/auth/signup',
      REFRESH_TOKEN: '/auth/refresh',
      CHANGE_PASSWORD: '/auth/change-password',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password'
    };
  }

  // Iniciar sesión con email y contraseña
  async login(credentials) {
    try {
      const { email, password } = credentials;
      const response = await apiService.post(this.endpoints.LOGIN, {
        email,
        password
      });

      // Guardar token y datos del usuario
      if (response.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.accessToken);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const response = await apiService.post(this.endpoints.REGISTER, userData);
      return response;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Cerrar sesión
  logout() {
    try {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Error en logout:', error);
    }
  }

  // Obtener token actual
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Obtener datos del usuario actual
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) {
      return false;
    }

    // Verificar si el token no ha expirado (simple check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(requiredRole) {
    const user = this.getCurrentUser();
    if (!user || !user.roles) {
      return false;
    }

    // Si el usuario tiene múltiples roles, verificar si incluye el requerido
    if (Array.isArray(user.roles)) {
      return user.roles.includes(requiredRole);
    }

    // Si es un solo rol
    return user.roles === requiredRole;
  }

  // Verificar si el usuario tiene cualquiera de los roles especificados
  hasAnyRole(roles) {
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

  // Renovar token de acceso
  async refreshToken() {
    try {
      const response = await apiService.post(this.endpoints.REFRESH_TOKEN);
      
      if (response.accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.accessToken);
      }
      
      return response;
    } catch (error) {
      console.error('Error renovando token:', error);
      this.logout();
      throw error;
    }
  }

  // Obtener información del perfil del usuario
  async getProfile() {
    try {
      const response = await apiService.get('/auth/profile');
      
      // Actualizar datos del usuario en localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      throw error;
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(profileData) {
    try {
      const response = await apiService.put('/auth/profile', profileData);
      
      // Actualizar datos del usuario en localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
      
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