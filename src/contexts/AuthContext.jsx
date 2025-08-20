import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '@/services/authService';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';

// Estados posibles de autenticación
const AUTH_STATES = {
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated'
};

// Acciones del reducer de autenticación
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Estado inicial del contexto de autenticación
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  authState: AUTH_STATES.LOADING
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authState: AUTH_STATES.AUTHENTICATED
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        authState: AUTH_STATES.UNAUTHENTICATED
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        authState: AUTH_STATES.UNAUTHENTICATED
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Crear el contexto de autenticación
export const AuthContext = createContext(null);

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar el estado de autenticación actual
  const checkAuthStatus = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user) {
          dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
        } else {
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Función para iniciar sesión
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.login(credentials);
      
      if (response.user) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.user });
        return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Función para registrar nuevo usuario
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const response = await authService.register(userData);
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (error) {
      const errorMessage = error.message || 'Error al registrar usuario';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    try {
      authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Función para cambiar contraseña
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      await authService.changePassword(passwordData);
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: SUCCESS_MESSAGES.PASSWORD_CHANGED };
    } catch (error) {
      const errorMessage = error.message || 'Error al cambiar contraseña';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const updatedUser = await authService.updateProfile(profileData);
      
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });
      return { success: true, message: SUCCESS_MESSAGES.UPDATE_SUCCESS };
    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar perfil';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return authService.hasRole(role);
  };

  // Verificar si el usuario tiene cualquiera de los roles especificados
  const hasAnyRole = (roles) => {
    return authService.hasAnyRole(roles);
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Valor del contexto que se proporcionará a los componentes hijos
  const contextValue = {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    authState: state.authState,

    // Funciones
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    hasRole,
    hasAnyRole,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

// Hook para verificar roles
export const useRole = (requiredRole) => {
  const { hasRole, user } = useAuth();
  
  return {
    hasRole: hasRole(requiredRole),
    userRole: user?.roles,
    user
  };
};

// Hook para verificar múltiples roles
export const useRoles = (requiredRoles) => {
  const { hasAnyRole, user } = useAuth();
  
  return {
    hasAnyRole: hasAnyRole(requiredRoles),
    userRoles: user?.roles,
    user
  };
};

export default AuthContext;