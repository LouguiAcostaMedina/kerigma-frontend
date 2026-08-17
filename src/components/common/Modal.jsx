/**
 * Componente Modal Reutilizable
 * Modal genérico con diferentes tamaños y funcionalidades
 */

import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import PropTypes from 'prop-types';
import styles from './Modal.module.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = ''
}) => {
  // Manejar tecla Escape
  const handleEscape = useCallback((e) => {
    if (closeOnEscape && e.key === 'Escape') {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  // Manejar clic en backdrop
  const handleBackdropClick = useCallback((e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  // Efectos para manejar el modal
  useEffect(() => {
    if (isOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
      
      // Agregar event listener para Escape
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscape);
      }
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscape);
      }
    };
  }, [isOpen, closeOnEscape, handleEscape]);

  // No renderizar si el modal no está abierto
  if (!isOpen) return null;

  // Normalizar tamaños: aceptar 'fullscreen' y 'full-screen', mapear 'xl'/'md'/'sm' a válidos
  const SIZE_ALIASES = { fullscreen: 'full-screen', xl: 'extra-large', md: 'medium', sm: 'small' };
  const normalizedSize = SIZE_ALIASES[size] || size;
  const isFullScreen = normalizedSize === 'full-screen';
  const sizeClass = isFullScreen ? '' : normalizedSize === 'extra-large' ? styles.extraLarge : styles[normalizedSize] || '';

  // Contenido del modal
  const modalContent = (
    <div
      className={styles.modalOverlay}
      data-size={isFullScreen ? 'full-screen' : undefined}
      onClick={handleBackdropClick}
    >
      <div 
        className={`${styles.modalContainer} ${sizeClass} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        {(title || showCloseButton) && (
          <div className={styles.modalHeader}>
            {title && (
              <h2 className={styles.modalTitle}>{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Cerrar modal"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}

        {/* Contenido del modal */}
        <div className={styles.modalContent}>
          {children}
        </div>
      </div>
    </div>
  );

  // Renderizar usando portal
  return createPortal(modalContent, document.body);
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'sm', 'medium', 'md', 'large', 'xl', 'extra-large', 'fullscreen', 'full-screen']),
  showCloseButton: PropTypes.bool,
  closeOnBackdrop: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  className: PropTypes.string
};

export default Modal;