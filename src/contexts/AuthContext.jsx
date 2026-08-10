/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '@/services/authService';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, STORAGE_KEYS, ROLE_PERMISSIONS } from '@/constants';

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

export const AuthContext = createContext(null);

// La sesión viaja en cookies HttpOnly (no legibles por JS). Para no disparar
// GET /auth/me (401) en cada arranque sin sesión, se persiste un marcador simple
// en localStorage tras un login/registro exitoso y se limpia al cerrar sesión.
const setSessionMarker = () => localStorage.setItem(STORAGE_KEYS.SESSION_MARKER, '1');
const clearSessionMarker = () => localStorage.removeItem(STORAGE_KEYS.SESSION_MARKER);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();

    // Sesión inválida/expirada detectada por el interceptor de axios (evento de api.js).
    // Cierra sesión en el contexto y deja que ProtectedRoute redirija al login sin recargar la página.
    const handleUnauthorized = () => {
      clearSessionMarker();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const checkAuthStatus = async () => {
    // Sin marcador de sesión no hay cookie que validar: no llamar a /auth/me.
    if (!localStorage.getItem(STORAGE_KEYS.SESSION_MARKER)) {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return;
    }

    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // La sesión se valida contra el backend vía GET /auth/me (cookies HttpOnly)
      const response = await authService.getProfile();
      const user = authService.getCurrentUser() || response?.data?.user || null;

      if (user) {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      } else {
        clearSessionMarker();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch {
      clearSessionMarker();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const result = await authService.login(credentials);

      if (result.success && result.user) {
        setSessionMarker();
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: result.user });
        return {
          success: true,
          user: result.user,
          message: result.message || SUCCESS_MESSAGES.LOGIN_SUCCESS
        };
      }

      const errorMessage = result.error || ERROR_MESSAGES.INVALID_CREDENTIALS;
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, message: errorMessage };
    } catch (error) {
      const errorMessage = error.message || ERROR_MESSAGES.INVALID_CREDENTIALS;
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      await authService.register(userData);
      setSessionMarker();
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (error) {
      const errorMessage = error.message || 'Error al registrar usuario';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      clearSessionMarker();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

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

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      const response = await authService.updateProfile(profileData);
      const updatedUser = response?.data?.user || response?.data || null;
      if (updatedUser) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: { ...updatedUser, church: state.user?.church || updatedUser.church || null },
        });
      }
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return { success: true, message: SUCCESS_MESSAGES.UPDATE_SUCCESS };
    } catch (error) {
      const errorMessage = error.message || 'Error al actualizar perfil';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // 🛠️ MODIFICACIÓN DE ROL POR JERARQUÍA REHABILITADA (Reconoce tanto 'role' como 'roles')
  const hasRole = (role) => {
    if (!state.user) return false;
    const userRole = state.user.role || state.user.roles || state.user.rol;
    if (!userRole) return false;

    const userRolesArray = Array.isArray(userRole) ? userRole : [userRole];

    const normalize = (r) => {
      if (!r) return '';
      const clean = r.toLowerCase().trim();
      if (clean === 'super_admin') return 'superadministrador';
      if (clean === 'admin') return 'administrador';
      if (clean === 'reader') return 'lector';
      if (clean === 'leader') return 'lider';
      return clean;
    };

    // Estructura jerárquica idéntica para validar accesos por umbral (ej: super_admin tiene nivel 5, accede a todo)
    const roleHierarchy = {
      'superadministrador': 5,
      'administrador': 4,
      'director': 3,
      'lider': 2,
      'lector': 1
    };

    const targetNormalized = normalize(role);
    const targetLevel = roleHierarchy[targetNormalized] || 0;

    return userRolesArray.some(r => {
      const currentNormalized = normalize(r);
      // Retorna true si coincide el rol exacto o si tiene un nivel jerárquico superior al requerido
      return currentNormalized === targetNormalized || (roleHierarchy[currentNormalized] || 0) >= targetLevel;
    });
  };

  const hasAnyRole = (roles) => {
    if (!state.user || !roles) return false;
    return roles.some(role => hasRole(role));
  };

  // Normaliza el rol del usuario a la clave canónica del ENUM del backend
  const getUserRoles = () => {
    if (!state.user) return [];
    const userRole = state.user.role || state.user.roles || state.user.rol;
    if (!userRole) return [];

    const normalize = (r) => {
      const clean = String(r).toLowerCase().trim();
      if (clean === 'super_admin' || clean === 'superadministrador') return 'super_admin';
      if (clean === 'admin' || clean === 'administrador') return 'admin';
      if (clean === 'director') return 'director';
      if (clean === 'leader' || clean === 'lider') return 'leader';
      if (clean === 'reader' || clean === 'lector') return 'reader';
      return clean;
    };

    return (Array.isArray(userRole) ? userRole : [userRole]).map(normalize);
  };

  const hasPermission = (required = []) => {
    if (!state.user) return false;

    const roles = getUserRoles();
    if (roles.includes('super_admin')) return true;

    // Acumula los permisos declarados para los roles del usuario
    const permSet = new Set();
    roles.forEach((r) => {
      (ROLE_PERMISSIONS[r] || []).forEach((p) => permSet.add(p));
    });

    const can = (permission) => {
      if (permSet.has('*') || permSet.has(permission)) return true;
      const dot = permission.lastIndexOf('.');
      return dot > 0 && permSet.has(`${permission.slice(0, dot + 1)}*`);
    };

    const requiredList = Array.isArray(required) ? required : [required];
    return requiredList.length > 0 && requiredList.every((p) => can(p));
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const contextValue = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    authState: state.authState,
    login,
    register,
    logout,
    changePassword,
    updateProfile,
    hasRole,
    hasAnyRole,
    hasPermission,
    clearError,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const useRole = (requiredRole) => {
  const { hasRole, user } = useAuth();
  return {
    hasRole: hasRole(requiredRole),
    userRole: user?.role || user?.roles || user?.rol,
    user
  };
};

export const useRoles = (requiredRoles) => {
  const { hasAnyRole, user } = useAuth();
  return {
    hasAnyRole: hasAnyRole(requiredRoles),
    userRoles: user?.role ? [user.role] : (user?.roles || (user?.rol ? [user.rol] : [])),
    user
  };
};

export default AuthContext;