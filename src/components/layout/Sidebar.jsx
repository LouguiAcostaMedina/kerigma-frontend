import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/constants';
import './Sidebar.css';

// Componente de sidebar con navegación basada en roles
const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole, hasAnyRole } = useAuth();

  // Configuración de menús por rol
  const menuItems = [
    // Dashboard - Todos los roles
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    
    // Gestión de Usuarios - Solo Admin
    {
      id: 'users',
      title: 'Usuarios',
      icon: '👥',
      path: '/usuarios',
      roles: [ROLES.ADMIN]
    },
    
    // Gestión de Iglesias - Admin y Director
    {
      id: 'churches',
      title: 'Iglesias',
      icon: '⛪',
      path: '/iglesias',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR]
    },
    
    // Gestión de Grupos - Admin, Director y Líder
    {
      id: 'groups',
      title: 'Grupos',
      icon: '👨‍👩‍👧‍👦',
      path: '/grupos',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER]
    },
    
    // Gestión de Miembros - Todos menos Reader solo lectura
    {
      id: 'members',
      title: 'Miembros',
      icon: '👤',
      path: '/miembros',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    
    // Tabla Misionera - Todos los roles
    {
      id: 'missionary',
      title: 'Tabla Misionera',
      icon: '📋',
      path: '/tabla-misionera',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    
    // Estudiantes Bíblicos - Todos los roles
    {
      id: 'bible-students',
      title: 'Estudiantes Bíblicos',
      icon: '📖',
      path: '/estudiantes-biblicos',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR, ROLES.LEADER, ROLES.READER]
    },
    
    // Reportes - Admin y Director
    {
      id: 'reports',
      title: 'Reportes',
      icon: '📈',
      path: '/reportes',
      roles: [ROLES.ADMIN, ROLES.DIRECTOR]
    },
    
    // Configuración - Solo Admin
    {
      id: 'settings',
      title: 'Configuración',
      icon: '⚙️',
      path: '/configuracion',
      roles: [ROLES.ADMIN]
    }
  ];

  // Filtrar menús según el rol del usuario
  const getFilteredMenuItems = () => {
    if (!user || !user.roles) return [];
    
    return menuItems.filter(item => {
      return hasAnyRole(item.roles);
    });
  };

  // Manejar navegación
  const handleNavigation = (path) => {
    window.location.href = path;
    onClose(); // Cerrar sidebar en móvil
  };

  // Obtener la ruta actual para marcar el item activo
  const getCurrentPath = () => {
    return window.location.pathname;
  };

  const filteredMenuItems = getFilteredMenuItems();

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Header del sidebar */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-icon">⛪</div>
            <div className="logo-text">
              <h3>SGE</h3>
              <p>Sistema de Gestión Eclesiástica</p>
            </div>
          </div>
          
          {/* Botón de cerrar para móviles */}
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
        
        {/* Navegación */}
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {filteredMenuItems.map((item) => {
              const isActive = getCurrentPath() === item.path || 
                              getCurrentPath().startsWith(item.path + '/');
              
              return (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-text">{item.title}</span>
                    {isActive && <span className="nav-indicator"></span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Footer del sidebar */}
        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar-small">
              {user?.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-info-small">
              <p className="user-name-small">{user?.nombre || 'Usuario'}</p>
              <p className="user-role-small">
                {Array.isArray(user?.roles) ? user.roles[0] : user?.roles || 'usuario'}
              </p>
            </div>
          </div>
          
          <div className="sidebar-version">
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;