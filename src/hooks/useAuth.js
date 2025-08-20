/**
 * Hook personalizado para manejar la autenticación
 * Proporciona métodos para login, logout, registro y verificación de roles
 */

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import authService  from '@/services/authService';
import { showToast } from '@/utils/notifications';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const { user, isAuthenticated, isLoading, login: setLogin, logout: setLogout, updateUser } = context;

  // Función de login
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      const { token, user: userData } = response.data;
      
      setLogin(token, userData);
      showToast('Inicio de sesión exitoso', 'success');
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Función de registro
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      showToast('Usuario registrado exitosamente', 'success');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar usuario';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Función de logout
  const logout = () => {
    setLogout();
    showToast('Sesión cerrada exitosamente', 'info');
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (requiredRole) => {
    if (!user || !user.rol) return false;
    
    const roleHierarchy = {
      'Administrador': 4,
      'Director': 3,
      'Líder': 2,
      'Lector': 1
    };
    
    const userRoleLevel = roleHierarchy[user.rol];
    const requiredRoleLevel = roleHierarchy[requiredRole];
    
    return userRoleLevel >= requiredRoleLevel;
  };

  // Verificar si el usuario tiene al menos uno de los roles especificados
  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  };

  // Cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      await authService.changePassword(passwordData);
      showToast('Contraseña cambiada exitosamente', 'success');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Actualizar perfil de usuario
  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      updateUser(response.data);
      showToast('Perfil actualizado exitosamente', 'success');
      return { success: true, user: response.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar perfil';
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
    changePassword,
    updateProfile
  };
};