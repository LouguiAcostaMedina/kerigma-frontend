/**
 * Hook personalizado para manejar la autenticación
 * Proporciona métodos para login, logout, registro y verificación de roles
 * Delega toda la lógica al AuthContext (autenticación por cookies HttpOnly)
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { showToast } from '@/utils/notifications';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const {
    user,
    isAuthenticated,
    isLoading,
    login: contextLogin,
    register: contextRegister,
    logout: contextLogout,
    hasRole: contextHasRole,
    hasAnyRole: contextHasAnyRole,
    hasPermission: contextHasPermission,
    changePassword: contextChangePassword,
    updateProfile: contextUpdateProfile
  } = context;

  // Función de login
  const login = async (credentials) => {
    try {
      const result = await contextLogin(credentials);

      if (result && result.success) {
        showToast(result.message || 'Inicio de sesión exitoso', 'success');
        return { success: true, user: result.user };
      }

      const message = result?.message || 'Error al iniciar sesión';
      showToast(message, 'error');
      return { success: false, message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al iniciar sesión';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      const result = await contextRegister(userData);
      if (result && result.success) {
        showToast(result.message || 'Usuario registrado exitosamente', 'success');
        return { success: true, data: result.data };
      }
      const message = result?.message || 'Error al registrar usuario';
      showToast(message, 'error');
      return { success: false, message };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al registrar usuario';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Función de logout
  const logout = () => {
    try {
      contextLogout();
      showToast('Sesión cerrada exitosamente', 'info');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (requiredRole) => contextHasRole(requiredRole);

  // Verificar si el usuario tiene al menos uno de los roles especificados
  const hasAnyRole = (roles) => contextHasAnyRole(roles);

  // Cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      const result = await contextChangePassword(passwordData);
      if (result && result.success) {
        showToast('Contraseña cambiada exitosamente', 'success');
      }
      return result;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al cambiar contraseña';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Actualizar perfil de usuario
  const updateProfile = async (profileData) => {
    try {
      const result = await contextUpdateProfile(profileData);
      if (result && result.success) {
        showToast('Perfil actualizado exitosamente', 'success');
      }
      return result;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al actualizar perfil';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    hasPermission: contextHasPermission,
    changePassword,
    updateProfile
  };
};
