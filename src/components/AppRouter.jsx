/**
 * Configuración de rutas de la aplicación
 * Define todas las rutas protegidas y públicas con sus respectivos roles
 */

import { BrowserRouter as Router,Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants';

// Componente de Loading para lazy loading
import Layout from '@/components/layout/Layout';
import Loading from '@/components/common/Loading';
import { Suspense } from 'react';

// Páginas de autenticación
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ChangePassword from '@/pages/ChangePassword';
import Profile from '@/pages/Profile';
import Configuration from '@/pages/Configuration';

// Dashboard
import Dashboard from '@/pages/Dashboard';

// CRUD Pages
import Members from '@/pages/Members';
import Groups from '@/pages/Groups';
import BiblicalStudents from '@/pages/BiblicalStudents';


import Reports from '@/pages/Reports';
import Churches from '@/pages/Churches';
import Users from '@/pages/Users';

// Páginas de error
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';


// Roles que acceden a cada módulo (valores idénticos al ENUM del backend)
const ALL_AUTHENTICATED = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER];
const MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER];
const HIGHER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR];
const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];

const AppRouter = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }
  return (
    <Routes>
      {/* Rutas públicas (sin autenticación) */}
      <Route 
        path="/login" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/forgot-password"
        element={
          <ProtectedRoute requireAuth={false}>
            <ForgotPassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reset-password/:token"
        element={
          <ProtectedRoute requireAuth={false}>
            <ResetPassword />
          </ProtectedRoute>
        }
      />

      {/* Rutas protegidas con Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Ruta raíz redirige al dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - Accesible para todos los roles autenticados */}
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Perfil y cambio de contraseña - Todos los usuarios */}
        <Route 
          path="profile" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="change-password" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />
<Route 
  path="configuration" 
  element={
    <ProtectedRoute roles={ADMIN_ROLES}>
      <Configuration />
    </ProtectedRoute>
  } 
/>
        {/* Miembros - Líder, Director y Administrador */}
        <Route 
          path="members" 
          element={
            <ProtectedRoute roles={MANAGE_ROLES}>
              <Members />
            </ProtectedRoute>
          } 
        />

        {/* Grupos - Líder, Director y Administrador */}
        <Route 
          path="groups" 
          element={
            <ProtectedRoute roles={MANAGE_ROLES}>
              <Groups />
            </ProtectedRoute>
          } 
        />

        {/* Estudiantes Bíblicos - Líder, Director y Administrador */}
        <Route 
          path="biblical-students" 
          element={
            <ProtectedRoute roles={MANAGE_ROLES}>
              <BiblicalStudents />
            </ProtectedRoute>
          } 
        />

        {/* Reportes - Todos los roles */}
        <Route 
          path="reports" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* Iglesias - Solo Director y Administrador */}
        <Route 
          path="churches" 
          element={
            <ProtectedRoute roles={HIGHER_ROLES}>
              <Churches />
            </ProtectedRoute>
          } 
        />

        {/* Usuarios - Solo Administrador */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute roles={ADMIN_ROLES}>
              <Users />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Páginas de error */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRouter;