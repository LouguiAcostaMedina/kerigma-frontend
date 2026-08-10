import React from 'react';
import { ButtonLoading } from './Loading';
import './Button.css';

// Componente de botón reutilizable con diferentes variantes y estados
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'medium',
  loading = false,
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  const isLoadingState = loading || isLoading;

  // Construir clases CSS basadas en las props
  const getButtonClasses = () => {
    let classes = ['btn', `btn--${variant}`, `btn--${size}`];
    
    if (fullWidth) classes.push('btn--full-width');
    if (isLoadingState) classes.push('btn--loading');
    if (disabled) classes.push('btn--disabled');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  // Manejar click del botón
  const handleClick = (e) => {
    if (isLoadingState || disabled) {
      e.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={getButtonClasses()}
      onClick={handleClick}
      disabled={disabled || isLoadingState}
      {...props}
    >
      {/* Icono a la izquierda */}
      {icon && iconPosition === 'left' && !isLoadingState && (
        <span className="btn__icon btn__icon--left">
          {icon}
        </span>
      )}
      
      {/* Spinner de carga */}
      {isLoadingState && (
        <span className="btn__loading">
          <ButtonLoading size="small" />
        </span>
      )}
      
      {/* Contenido del botón */}
      <span className={`btn__content ${isLoadingState ? 'btn__content--loading' : ''}`}>
        {children}
      </span>
      
      {/* Icono a la derecha */}
      {icon && iconPosition === 'right' && !isLoadingState && (
        <span className="btn__icon btn__icon--right">
          {icon}
        </span>
      )}
    </button>
  );
};

// Variantes específicas del botón para casos comunes
export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="secondary" {...props} />
);

export const DangerButton = (props) => (
  <Button variant="danger" {...props} />
);

export const SuccessButton = (props) => (
  <Button variant="success" {...props} />
);

export const OutlineButton = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton = (props) => (
  <Button variant="ghost" {...props} />
);

// Botón específico para formularios de envío
export const SubmitButton = ({ loading, isLoading = false, children, ...props }) => {
  const isLoadingState = loading || isLoading;

  return (
    <Button
      type="submit"
      variant="primary"
      loading={isLoadingState}
      {...props}
    >
      {isLoadingState ? 'Guardando...' : children || 'Guardar'}
    </Button>
  );
};

// Botón de cancelar
export const CancelButton = (props) => (
  <Button
    variant="outline"
    {...props}
  >
    {props.children || 'Cancelar'}
  </Button>
);

// Botón de eliminar
export const DeleteButton = (props) => (
  <Button
    variant="danger"
    {...props}
  >
    {props.children || 'Eliminar'}
  </Button>
);

export default Button;