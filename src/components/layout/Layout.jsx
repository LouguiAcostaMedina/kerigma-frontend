import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        {children}
      </div>
    );
  }

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`main-content ${isCollapsed ? 'main-content--collapsed' : ''}`}>
        <Header
          onMenuClick={toggleMobileSidebar}
          onToggleCollapse={toggleCollapse}
          isCollapsed={isCollapsed}
          user={user}
        />

        <main className="content-area">
          <Outlet />
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>&copy; 2025 Sistema de Gestión Eclesiástica. Todos los derechos reservados.</p>
            <p className="footer-version">Versión 1.0.0</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
