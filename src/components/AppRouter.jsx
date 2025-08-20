/**
 * Configuración de rutas de la aplicación
 * Define todas las rutas protegidas y públicas con sus respectivos roles
 */

import { BrowserRouter as Router,Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Componente de Loading para lazy loading
import Layout from '@/components/layout/Layout';
import Loading from '@/components/common/Loading';
import { Suspense } from 'react';

// Páginas de autenticación
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ChangePassword from '@/pages/ChangePassword';
import Profile from '@/pages/Profile';

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
            <ProtectedRoute roles={['Lector', 'Líder', 'Director', 'Administrador']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* Perfil y cambio de contraseña - Todos los usuarios */}
        <Route 
          path="profile" 
          element={
            <ProtectedRoute roles={['Lector', 'Líder', 'Director', 'Administrador']}>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="change-password" 
          element={
            <ProtectedRoute roles={['Lector', 'Líder', 'Director', 'Administrador']}>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />

        {/* Miembros - Líder, Director y Administrador */}
        <Route 
          path="members" 
          element={
            <ProtectedRoute roles={['Líder', 'Director', 'Administrador']}>
              <Members />
            </ProtectedRoute>
          } 
        />

        {/* Grupos - Líder, Director y Administrador */}
        <Route 
          path="groups" 
          element={
            <ProtectedRoute roles={['Líder', 'Director', 'Administrador']}>
              <Groups />
            </ProtectedRoute>
          } 
        />

        {/* Estudiantes Bíblicos - Líder, Director y Administrador */}
        <Route 
          path="biblical-students" 
          element={
            <ProtectedRoute roles={['Líder', 'Director', 'Administrador']}>
              <BiblicalStudents />
            </ProtectedRoute>
          } 
        />

        {/* Reportes - Todos los roles */}
        <Route 
          path="reports" 
          element={
            <ProtectedRoute roles={['Lector', 'Líder', 'Director', 'Administrador']}>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* Iglesias - Solo Director y Administrador */}
        <Route 
          path="churches" 
          element={
            <ProtectedRoute roles={['Director', 'Administrador']}>
              <Churches />
            </ProtectedRoute>
          } 
        />

        {/* Usuarios - Solo Administrador */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute roles={['Administrador']}>
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