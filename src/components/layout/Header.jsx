import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { textUtils } from '@/utils';
import { ROLE_LABELS } from '@/constants';
import './Header.css';

// Componente de header con menú de usuario y navegación
const Header = ({ onMenuClick, user }) => {
  const { logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cerrar menú de usuario cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle del menú de usuario
  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Manejar logout
  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  // Obtener iniciales del usuario
  const userInitials = user ? textUtils.getInitials(user.nombre || user.fullName || 'Usuario') : 'U';

  // Obtener rol del usuario
  const userRole = user && user.roles ? 
    (Array.isArray(user.roles) ? user.roles[0] : user.roles) : 
    'usuario';

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Botón de menú móvil */}
        <button 
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Logo y título */}
        <div className="header-brand">
          <div className="brand-icon">
            ⛪
          </div>
          <div className="brand-info">
            <h1 className="brand-title">Sistema Eclesiástico</h1>
            <p className="brand-subtitle">Gestión Misionera</p>
          </div>
        </div>

        {/* Información del usuario y menú */}
        <div className="header-user" ref={userMenuRef}>
          {/* Info del usuario */}
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">
                {user ? textUtils.capitalizeWords(user.nombre || user.fullName || 'Usuario') : 'Usuario'}
              </span>
              <span className="user-role">
                {ROLE_LABELS[userRole] || textUtils.capitalize(userRole)}
              </span>
            </div>
            <div className="user-avatar" onClick={toggleUserMenu}>
              {userInitials}
            </div>
          </div>

          {/* Menú desplegable del usuario */}
          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {userInitials}
                </div>
                <div className="dropdown-info">
                  <p className="dropdown-name">
                    {user ? textUtils.capitalizeWords(user.nombre || user.fullName || 'Usuario') : 'Usuario'}
                  </p>
                  <p className="dropdown-email">
                    {user?.email || 'No email'}
                  </p>
                  <p className="dropdown-role">
                    {ROLE_LABELS[userRole] || textUtils.capitalize(userRole)}
                  </p>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <div className="dropdown-menu">
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    // Navegar al perfil
                    window.location.href = '/perfil';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Ver Perfil
                </button>
                
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setUserMenuOpen(false);
                    // Navegar a configuración
                    window.location.href = '/configuracion';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15C19.2 15.6 19.4 16.2 19.9 16.6L20 16.7C20.3 17 20.6 17.3 20.6 17.7C20.6 18.1 20.3 18.4 20 18.7C19.7 19 19.4 19 19 19H18.9C18.5 19 18.1 19.3 18.1 19.7V20C18.1 20.6 17.7 21 17.1 21C16.5 21 16.1 20.6 16.1 20V19.9C16.1 19.5 15.8 19.1 15.4 19.1H15.3C14.9 19.1 14.5 18.8 14.5 18.4C14.5 18 14.8 17.7 15.1 17.4C15.4 17.1 15.4 16.8 15.4 16.4V16.3C15.4 15.9 15.1 15.5 14.7 15.5H14.6C14 15.5 13.6 15.1 13.6 14.5C13.6 13.9 14 13.5 14.6 13.5H14.7C15.1 13.5 15.5 13.2 15.5 12.8V12.7C15.5 12.3 15.2 11.9 14.8 11.9H14.7C14.1 11.9 13.7 11.5 13.7 10.9C13.7 10.3 14.1 9.9 14.7 9.9H14.8C15.2 9.9 15.6 9.6 15.6 9.2V9.1C15.6 8.7 15.9 8.3 16.3 8.3C16.7 8.3 17 8.6 17.3 8.9C17.6 9.2 17.9 9.2 18.3 9.2H18.4C18.8 9.2 19.2 8.9 19.2 8.5C19.2 8.1 18.9 7.8 18.6 7.5C18.3 7.2 18.3 6.9 18.3 6.5V6.4C18.3 6 18.6 5.6 19 5.6C19.4 5.6 19.7 5.9 20 6.2C20.3 6.5 20.6 6.5 21 6.5H21.1C21.5 6.5 21.9 6.8 21.9 7.2C21.9 7.6 21.6 7.9 21.3 8.2C21 8.5 21 8.8 21 9.2V9.3C21 9.7 21.3 10.1 21.7 10.1H21.8C22.4 10.1 22.8 10.5 22.8 11.1C22.8 11.7 22.4 12.1 21.8 12.1H21.7C21.3 12.1 20.9 12.4 20.9 12.8V12.9C20.9 13.3 21.2 13.7 21.6 13.7H21.7C22.3 13.7 22.7 14.1 22.7 14.7C22.7 15.3 22.3 15.7 21.7 15.7H21.6C21.2 15.7 20.8 16 20.8 16.4V16.5C20.8 16.9 20.5 17.3 20.1 17.3C19.7 17.3 19.4 17 19.1 16.7C18.8 16.4 18.5 16.4 18.1 16.4H18C17.6 16.4 17.2 16.7 17.2 17.1C17.2 17.5 17.5 17.8 17.8 18.1C18.1 18.4 18.1 18.7 18.1 19.1V19.2C18.1 19.6 17.8 20 17.4 20C17 20 16.7 19.7 16.4 19.4C16.1 19.1 15.8 19.1 15.4 19.1H15.3C14.9 19.1 14.5 18.8 14.5 18.4C14.5 18 14.8 17.7 15.1 17.4C15.4 17.1 15.4 16.8 15.4 16.4V16.3C15.4 15.9 15.1 15.5 14.7 15.5H14.6C14 15.5 13.6 15.1 13.6 14.5C13.6 13.9 14 13.5 14.6 13.5H14.7C15.1 13.5 15.5 13.2 15.5 12.8V12.7C15.5 12.3 15.2 11.9 14.8 11.9H14.7C14.1 11.9 13.7 11.5 13.7 10.9C13.7 10.3 14.1 9.9 14.7 9.9H14.8C15.2 9.9 15.6 9.6 15.6 9.2V9.1C15.6 8.7 15.9 8.3 16.3 8.3C16.7 8.3 17 8.6 17.3 8.9C17.6 9.2 17.9 9.2 18.3 9.2H18.4C18.8 9.2 19.2 8.9 19.2 8.5C19.2 8.1 18.9 7.8 18.6 7.5C18.3 7.2 18.3 6.9 18.3 6.5V6.4C18.3 6 18.6 5.6 19 5.6C19.4 5.6 19.7 5.9 20 6.2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Configuración
                </button>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item dropdown-item--danger"
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;