import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { textUtils } from '@/utils';
import { ROLE_LABELS } from '@/constants';
import { getInitialTheme, applyTheme, toggleTheme } from '@/utils/theme';
import './Header.css';

const Header = ({ onMenuClick, onToggleCollapse, isCollapsed, user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(getInitialTheme());
  }, []);

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

  const handleToggleTheme = () => {
    setTheme(toggleTheme(theme));
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const getUserName = (u) =>
    u?.nombre || u?.fullName || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || 'Usuario';

  const userInitials = user ? textUtils.getInitials(getUserName(user)) : 'U';

  const userRole = user && (user.role || user.roles) ? 
    (Array.isArray(user.role || user.roles) ? (user.role || user.roles)[0] : (user.role || user.roles)) : 
    'usuario';

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button 
            className="mobile-menu-button"
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <button
            className="desktop-collapse-button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Desplegar menú' : 'Contraer menú'}
            title={isCollapsed ? 'Desplegar menú' : 'Contraer menú'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isCollapsed ? (
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>

          <button
            className="theme-toggle"
            onClick={handleToggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        <div className="header-user" ref={userMenuRef}>
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">
                {textUtils.capitalizeWords(getUserName(user))}
              </span>
              <span className="user-role">
                {ROLE_LABELS[userRole] || textUtils.capitalize(userRole)}
              </span>
            </div>
            <div className="user-avatar" onClick={toggleUserMenu}>
              {userInitials}
            </div>
          </div>

          {userMenuOpen && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {userInitials}
                </div>
                <div className="dropdown-info">
                  <p className="dropdown-name">
                    {textUtils.capitalizeWords(getUserName(user))}
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
                    navigate('/profile');
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
                    navigate('/configuration');
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15a2 2 0 01.5 1.6l.1.9a1 1 0 01-1 1.2l-1.7-.3a1 1 0 00-.9.5l-.5.9a1 1 0 01-1.8.1l-.5-.9a1 1 0 00-.9-.5l-1.7.3a1 1 0 01-1-1.2l.1-.9a2 2 0 01.5-1.6l.5-.7a1 1 0 00.4-1V13a1 1 0 00-.4-1l-.5-.7a2 2 0 01-.5-1.6l-.1-.9a1 1 0 011-1.2l1.7.3a1 1 0 00.9-.5l.5-.9a1 1 0 011.8-.1l.5.9a1 1 0 00.9.5l1.7-.3a1 1 0 011 1.2l-.1.9a2 2 0 01-.5 1.6l-.5.7a1 1 0 00-.4 1v.2a1 1 0 00.4 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
