import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

// Layout principal que contiene la estructura base de la aplicación
const Layout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Si no está autenticado, no mostrar el layout
  if (!isAuthenticated) {
    return (
      <div className="app-container">
        {children}
      </div>
    );
  }

  // Toggle del sidebar para móviles
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Overlay para móviles cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="main-content">
        {/* Header */}
        <Header 
          onMenuClick={toggleSidebar}
          user={user}
        />
        
        {/* Área de contenido */}
        <main className="content-area">
          {children}
        </main>
        
        {/* Footer */}
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