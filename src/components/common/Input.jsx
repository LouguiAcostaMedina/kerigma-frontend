import React, { useState, forwardRef } from 'react';
import './Input.css';

// Componente de input reutilizable con validación y estilos
const Input = forwardRef(({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  icon = null,
  iconPosition = 'left',
  size = 'medium',
  variant = 'default',
  className = '',
  containerClassName = '',
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Construir clases CSS
  const getInputClasses = () => {
    let classes = ['input-field', `input-field--${size}`, `input-field--${variant}`];
    
    if (error) classes.push('input-field--error');
    if (disabled) classes.push('input-field--disabled');
    if (readOnly) classes.push('input-field--readonly');
    if (isFocused) classes.push('input-field--focused');
    if (icon) classes.push(`input-field--with-icon-${iconPosition}`);
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  const getContainerClasses = () => {
    let classes = ['input-container'];
    if (containerClassName) classes.push(containerClassName);
    return classes.join(' ');
  };

  // Manejar cambios en el input
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  // Manejar focus
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  // Manejar blur
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  // Toggle para mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determinar el tipo de input actual
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={getContainerClasses()}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-label--required">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div className="input-wrapper">
        {/* Icono izquierdo */}
        {icon && iconPosition === 'left' && (
          <div className="input-icon input-icon--left">
            {icon}
          </div>
        )}

        {/* Campo de input */}
        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          value={value || ''}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={getInputClasses()}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Icono derecho o botón de contraseña */}
        {type === 'password' ? (
          <button
            type="button"
            className="input-icon input-icon--right input-icon--password"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        ) : (
          icon && iconPosition === 'right' && (
            <div className="input-icon input-icon--right">
              {icon}
            </div>
          )
        )}
      </div>

      {/* Mensaje de error o ayuda */}
      {(error || helperText) && (
        <div className="input-message">
          {error ? (
            <span className="input-error">{error}</span>
          ) : (
            <span className="input-helper">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Componente de textarea
export const TextArea = forwardRef(({
  label,
  name,
  value,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  rows = 4,
  resize = 'vertical',
  className = '',
  containerClassName = '',
  onChange,
  onBlur,
  onFocus,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const getTextAreaClasses = () => {
    let classes = ['textarea-field'];
    
    if (error) classes.push('textarea-field--error');
    if (disabled) classes.push('textarea-field--disabled');
    if (readOnly) classes.push('textarea-field--readonly');
    if (isFocused) classes.push('textarea-field--focused');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className={`input-container ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-label--required">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        rows={rows}
        className={getTextAreaClasses()}
        style={{ resize }}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      {(error || helperText) && (
        <div className="input-message">
          {error ? (
            <span className="input-error">{error}</span>
          ) : (
            <span className="input-helper">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// Componente de select
export const Select = forwardRef(({
  label,
  name,
  value,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar...',
  className = '',
  containerClassName = '',
  onChange,
  ...props
}, ref) => {
  const getSelectClasses = () => {
    let classes = ['select-field'];
    
    if (error) classes.push('select-field--error');
    if (disabled) classes.push('select-field--disabled');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`input-container ${containerClassName}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="input-label--required">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={name}
        name={name}
        value={value || ''}
        disabled={disabled}
        required={required}
        className={getSelectClasses()}
        onChange={handleChange}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {(error || helperText) && (
        <div className="input-message">
          {error ? (
            <span className="input-error">{error}</span>
          ) : (
            <span className="input-helper">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

// Componente de checkbox
export const Checkbox = ({
  label,
  name,
  checked = false,
  error,
  disabled = false,
  className = '',
  onChange,
  ...props
}) => {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const getCheckboxClasses = () => {
    let classes = ['checkbox-field'];
    if (error) classes.push('checkbox-field--error');
    if (disabled) classes.push('checkbox-field--disabled');
    if (className) classes.push(className);
    return classes.join(' ');
  };

  return (
    <div className="checkbox-container">
      <label className="checkbox-label">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          className={getCheckboxClasses()}
          onChange={handleChange}
          {...props}
        />
        <span className="checkbox-checkmark"></span>
        {label && <span className="checkbox-text">{label}</span>}
      </label>
      {error && (
        <div className="input-message">
          <span className="input-error">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Input;