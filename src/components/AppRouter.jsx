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
import AuditLog from '@/pages/AuditLog';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TithesOfferings from '@/pages/TithesOfferings';
import OfficialReports from '@/pages/OfficialReports';
import Calendar from '@/pages/Calendar';
import Notifications from '@/pages/Notifications';
import Churches from '@/pages/Churches';
import Users from '@/pages/Users';
import Hierarchy from '@/pages/Hierarchy';
import Ministries from '@/pages/Ministries';
import PastoralCare from '@/pages/PastoralCare';
import BaptismPipeline from '@/pages/BaptismPipeline';
import ChurchDocuments from '@/pages/ChurchDocuments';

// Páginas de error
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';


// Roles que acceden a cada módulo (valores idénticos al ENUM del backend)
const ALL_AUTHENTICATED = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER, ROLES.TESORERO];
const MANAGE_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER];
const HIGHER_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR];
const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN];
const FINANCIAL_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.TESORERO];

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

        {/* Diezmos y Ofrendas - Tesorero, Director y Administrador */}
        <Route 
          path="tithes-offerings" 
          element={
            <ProtectedRoute roles={FINANCIAL_ROLES}>
              <TithesOfferings />
            </ProtectedRoute>
          } 
        />

        {/* Reportes Oficiales de Membresía - Director y Administrador */}
        <Route 
          path="official-reports" 
          element={
            <ProtectedRoute roles={HIGHER_ROLES}>
              <OfficialReports />
            </ProtectedRoute>
          } 
        />

        {/* Calendario de Actividades - Director, Líder y Administrador */}
        <Route 
          path="calendar" 
          element={
            <ProtectedRoute roles={MANAGE_ROLES}>
              <Calendar />
            </ProtectedRoute>
          } 
        />

        {/* Notificaciones - Director y Administrador */}
        <Route 
          path="notifications" 
          element={
            <ProtectedRoute roles={HIGHER_ROLES}>
              <Notifications />
            </ProtectedRoute>
          } 
        />

        {/* Jerarquía Organizacional - Solo Administrador */}
        <Route 
          path="hierarchy" 
          element={
            <ProtectedRoute roles={ADMIN_ROLES}>
              <Hierarchy />
            </ProtectedRoute>
          } 
        />

        {/* Ministerios - Todos los roles */}
        <Route 
          path="ministries" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <Ministries />
            </ProtectedRoute>
          } 
        />

        {/* Cuidado Pastoral - Director y Administrador */}
        <Route 
          path="pastoral-care" 
          element={
            <ProtectedRoute roles={HIGHER_ROLES}>
              <PastoralCare />
            </ProtectedRoute>
          } 
        />

        {/* Pipeline de Bautismo - Todos los roles */}
        <Route 
          path="baptism-pipeline" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <BaptismPipeline />
            </ProtectedRoute>
          } 
        />

        {/* Repositorio de Documentos - Todos los roles */}
        <Route 
          path="documents" 
          element={
            <ProtectedRoute roles={ALL_AUTHENTICATED}>
              <ChurchDocuments />
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

        {/* Bitácora de Auditoría - Solo Administrador */}
        <Route 
          path="audit-log" 
          element={
            <ProtectedRoute roles={ADMIN_ROLES}>
              <AuditLog />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Páginas de error */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRouter;