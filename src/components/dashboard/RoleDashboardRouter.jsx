/**
 * Router de Dashboard por Rol
 * Renderiza el dashboard apropiado según el rol del usuario autenticado
 * Sin duplicar backend — solo composición de vista según el rol.
 */

import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import TreasuryDashboard from './TreasuryDashboard';
import PastoralDashboard from './PastoralDashboard';
import SecretaryDashboard from './SecretaryDashboard';

const RoleDashboardRouter = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'super_admin' || role === 'admin') {
    return <AdminDashboard />;
  }

  if (role === 'tesorero') {
    return <TreasuryDashboard />;
  }

  if (role === 'director') {
    return <PastoralDashboard />;
  }

  // leader, reader, y otros roles
  return <SecretaryDashboard />;
};

export default RoleDashboardRouter;
