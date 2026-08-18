import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES, ROLE_LABELS } from '@/constants';
import { FiMenu } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'users',
      title: 'Usuarios',
      icon: '👥',
      path: '/users',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      id: 'churches',
      title: 'Iglesias',
      icon: '⛪',
      path: '/churches',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'groups',
      title: 'Grupos',
      icon: '👨‍👩‍👧‍👦',
      path: '/groups',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER]
    },
    {
      id: 'members',
      title: 'Miembros',
      icon: '👤',
      path: '/members',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'bible-students',
      title: 'Estudiantes Bíblicos',
      icon: '📖',
      path: '/biblical-students',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'calendar',
      title: 'Calendario',
      icon: '📅',
      path: '/calendar',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER]
    },
    {
      id: 'reports',
      title: 'Reportes',
      icon: '📈',
      path: '/reports',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'official-reports',
      title: 'Reportes Oficiales',
      icon: '📜',
      path: '/official-reports',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      icon: '🔔',
      path: '/notifications',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'tithes-offerings',
      title: 'Diezmos y Ofrendas',
      icon: '💰',
      path: '/tithes-offerings',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.TESORERO]
    },
    {
      id: 'audit-log',
      title: 'Bitácora',
      icon: '📋',
      path: '/audit-log',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      id: 'hierarchy',
      title: 'Jerarquía',
      icon: '🏛️',
      path: '/hierarchy',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      id: 'ministries',
      title: 'Ministerios',
      icon: '🙏',
      path: '/ministries',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'pastoral-care',
      title: 'Cuidado Pastoral',
      icon: '🐑',
      path: '/pastoral-care',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'baptism-pipeline',
      title: 'Pipeline de Bautismo',
      icon: '💧',
      path: '/baptism-pipeline',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'documents',
      title: 'Documentos',
      icon: '📂',
      path: '/documents',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: '⚙️',
      path: '/configuration',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    }
  ];

  const getFilteredMenuItems = () => {
    if (!user || (!user.roles && !user.role)) return [];
    return menuItems.filter(item => {
      const userRole = user.role || (Array.isArray(user.roles) ? user.roles[0] : user.roles);
      return hasAnyRole(item.roles) || item.roles.includes(userRole);
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const filteredMenuItems = getFilteredMenuItems();
  const currentPath = location.pathname;

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''} ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo" title={isCollapsed ? 'SGE - Sistema de Gestión Eclesiástica' : undefined}>
            <div className="logo-icon">⛪</div>
            {!isCollapsed && (
              <div className="logo-text">
                <h3>SGE</h3>
                <p>Sistema de Gestión Eclesiástica</p>
              </div>
            )}
          </div>

          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Desplegar menú' : 'Contraer menú'}
            title={isCollapsed ? 'Desplegar' : 'Contraer'}
          >
            <FiMenu size={20} />
          </button>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredMenuItems.map((item) => {
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!isCollapsed && <span className="nav-text">{item.title}</span>}
                    {isActive && <span className="nav-indicator"></span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-version">
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
