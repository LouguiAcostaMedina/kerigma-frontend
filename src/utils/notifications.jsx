/**
 * Sistema de notificaciones personalizadas
 * Proporciona funciones para mostrar diferentes tipos de notificaciones
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';
import styles from './notifications.module.css';

// Contexto para las notificaciones
const NotificationContext = createContext();

// Hook para usar las notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
};

// Tipos de notificación
const NOTIFICATION_TYPES = {
  success: {
    icon: FaCheckCircle,
    className: 'success'
  },
  error: {
    icon: FaExclamationTriangle,
    className: 'error'
  },
  warning: {
    icon: FaExclamationTriangle,
    className: 'warning'
  },
  info: {
    icon: FaInfoCircle,
    className: 'info'
  }
};

// Componente individual de notificación
const Toast = ({ id, type, message, duration, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const notificationType = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;
  const IconComponent = notificationType.icon;

  useEffect(() => {
    // Mostrar la notificación
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-remover después de la duración especificada
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(id);
    }, 300);
  };

  return (
    <div
      className={`${styles.toast} ${styles[notificationType.className]} ${
        isVisible ? styles.visible : ''
      } ${isExiting ? styles.exiting : ''}`}
    >
      <div className={styles.toastContent}>
        <IconComponent className={styles.toastIcon} />
        <span className={styles.toastMessage}>{message}</span>
        <button
          className={styles.toastClose}
          onClick={handleClose}
          aria-label="Cerrar notificación"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  duration: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired
};

// Contenedor de notificaciones
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, message, duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  // Exponer funciones globalmente
  useEffect(() => {
    window.showToast = addToast;
    window.removeToast = removeToast;
    window.removeAllToasts = removeAllToasts;

    return () => {
      delete window.showToast;
      delete window.removeToast;
      delete window.removeAllToasts;
    };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.toastContainer}>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onRemove={removeToast}
        />
      ))}
    </div>,
    document.body
  );
};

// Funciones de conveniencia para mostrar notificaciones
export const showToast = (message, type = 'info', duration = 5000) => {
  if (typeof window !== 'undefined' && window.showToast) {
    return window.showToast(type, message, duration);
  }
};

export const showSuccess = (message, duration) => showToast(message, 'success', duration);
export const showError = (message, duration) => showToast(message, 'error', duration);
export const showWarning = (message, duration) => showToast(message, 'warning', duration);
export const showInfo = (message, duration) => showToast(message, 'info', duration);

// 🚀 Nueva función para mantener compatibilidad con Dashboard.jsx
export const showNotification = ({ type = 'info', title, message, duration = 5000 }) => {
  // Concatenamos title y message si se envían ambos
  const fullMessage = title ? `${title}: ${message}` : message;
  return showToast(fullMessage, type, duration);
};

// Provider de notificaciones (opcional para uso con Context)
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (type, message, duration = 5000) => {
    const id = Date.now().toString();
    const notification = { id, type, message, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remover
    setTimeout(() => {
      removeNotification(id);
    }, duration);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess: (msg, duration) => addNotification('success', msg, duration),
    showError: (msg, duration) => addNotification('error', msg, duration),
    showWarning: (msg, duration) => addNotification('warning', msg, duration),
    showInfo: (msg, duration) => addNotification('info', msg, duration)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};
