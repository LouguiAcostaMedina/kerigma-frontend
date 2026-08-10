/**
 * Componente de protección de rutas
 * Verifica autenticación y roles antes de permitir el acceso a una ruta
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/common/Loading';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ 
  children, 
  roles = [], 
  requireAuth = true,
  fallbackPath = '/login' 
}) => {
  const { user, isAuthenticated, isLoading, hasAnyRole } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Si se requiere autenticación y el usuario no está autenticado
  if (requireAuth && !isAuthenticated) {
    return <Navigate 
      to={fallbackPath} 
      state={{ from: location }} 
      replace 
    />;
  }
// Si se especificaron roles y el usuario no pertenece a la lista autorizada
  if (roles.length > 0 && isAuthenticated) {
    const userRole = user?.role || user?.rol || '';
    const hasAccess = hasAnyRole(roles) || roles.some(r => r.toLowerCase() === userRole.toLowerCase());

    if (!hasAccess) {
      return <Navigate 
        to="/dashboard" 
        state={{ from: location }} 
        replace 
      />;
    }
  }

  // Si se requiere no estar autenticado (ej: página de login) y ya tienes sesión activa
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  requireAuth: PropTypes.bool,
  fallbackPath: PropTypes.string
};

export default ProtectedRoute;