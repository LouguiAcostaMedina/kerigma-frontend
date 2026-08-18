/**
 * Página Principal del Dashboard
 * Delega al dashboard apropiado según el rol del usuario autenticado
 */

import RoleDashboardRouter from '@/components/dashboard/RoleDashboardRouter';

const Dashboard = () => {
  return <RoleDashboardRouter />;
};

export default Dashboard;
