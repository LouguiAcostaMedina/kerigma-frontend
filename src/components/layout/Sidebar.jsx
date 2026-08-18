import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/constants';
import { FiMenu } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user, hasAnyRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const menuItems = [
    {
      id: 'dashboard',
      title: t('nav.dashboard'),
      icon: '📊',
      path: '/dashboard',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'users',
      title: t('nav.users'),
      icon: '👥',
      path: '/users',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      id: 'churches',
      title: t('nav.churches'),
      icon: '⛪',
      path: '/churches',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'groups',
      title: t('nav.groups'),
      icon: '👨‍👩‍👧‍👦',
      path: '/groups',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER]
    },
    {
      id: 'members',
      title: t('nav.members'),
      icon: '👤',
      path: '/members',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'bible-students',
      title: t('nav.bibleStudents'),
      icon: '📖',
      path: '/biblical-students',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'calendar',
      title: t('nav.calendar'),
      icon: '📅',
      path: '/calendar',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER]
    },
    {
      id: 'reports',
      title: t('nav.reports'),
      icon: '📈',
      path: '/reports',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'official-reports',
      title: t('nav.officialReports'),
      icon: '📜',
      path: '/official-reports',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'notifications',
      title: t('nav.notifications'),
      icon: '🔔',
      path: '/notifications',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'tithes-offerings',
      title: t('nav.tithesOfferings'),
      icon: '💰',
      path: '/tithes-offerings',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.TESORERO]
    },
    {
      id: 'audit-log',
      title: t('nav.auditLog'),
      icon: '📋',
      path: '/audit-log',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      id: 'hierarchy',
      title: t('nav.hierarchy'),
      icon: '🏛️',
      path: '/hierarchy',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    },
    {
      id: 'ministries',
      title: t('nav.ministries'),
      icon: '🙏',
      path: '/ministries',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'pastoral-care',
      title: t('nav.pastoralCare'),
      icon: '🐑',
      path: '/pastoral-care',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR]
    },
    {
      id: 'baptism-pipeline',
      title: t('nav.baptismPipeline'),
      icon: '💧',
      path: '/baptism-pipeline',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'documents',
      title: t('nav.documents'),
      icon: '📂',
      path: '/documents',
      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    {
      id: 'settings',
      title: t('nav.settings'),
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
          <div className="sidebar-logo" title={isCollapsed ? t('app.name') : undefined}>
            <div className="logo-icon">⛪</div>
            {!isCollapsed && (
              <div className="logo-text">
                <h3>SGM</h3>
                <p>{t('app.name')}</p>
              </div>
            )}
          </div>

          <button
            className="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? t('nav.dashboard') : t('nav.dashboard')}
            title={isCollapsed ? t('nav.dashboard') : t('nav.dashboard')}
          >
            <FiMenu size={20} />
          </button>

          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label={t('common.cancel')}
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
