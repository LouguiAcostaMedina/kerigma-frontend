import React from 'react';
import './Loading.css';

// Componente de loading spinner reutilizable
const Loading = ({ 
  size = 'medium', 
  color = '#3B82F6', 
  text = 'Cargando...', 
  overlay = false,
  className = '' 
}) => {
  // Determinar el tamaño del spinner
  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'loading-spinner--small';
      case 'large':
        return 'loading-spinner--large';
      case 'medium':
      default:
        return 'loading-spinner--medium';
    }
  };

  // Contenido del spinner
  const spinnerContent = (
    <div className={`loading-container ${className}`}>
      <div 
        className={`loading-spinner ${getSizeClass()}`}
        style={{ borderTopColor: color }}
      >
      </div>
      {text && (
        <p className="loading-text" style={{ color }}>
          {text}
        </p>
      )}
    </div>
  );

  // Si es overlay, mostrar con fondo
  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Componente de loading para botones
export const ButtonLoading = ({ size = 'small', color = '#ffffff' }) => (
  <div 
    className={`loading-spinner loading-spinner--${size} loading-spinner--button`}
    style={{ borderTopColor: color }}
  >
  </div>
);

// Componente de loading para páginas completas
export const PageLoading = ({ text = 'Cargando página...' }) => (
  <Loading 
    size="large" 
    text={text} 
    overlay={true}
    className="page-loading"
  />
);

export default Loading;