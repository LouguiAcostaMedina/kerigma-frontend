/**
 * Página de Cambio de Contraseña
 * Permite a los usuarios autenticados cambiar su contraseña
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import styles from './ChangePassword.module.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { changePassword } = useAuth();
  const navigate = useNavigate();

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores específicos del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Alternar visibilidad de contraseñas
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar contraseña actual
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    // Validar nueva contraseña
    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    // Validar confirmación de nueva contraseña
    if (!formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Confirma tu nueva contraseña';
    } else if (formData.newPassword !== formData.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (result.success) {
        navigate('/profile', { 
          state: { 
            message: 'Contraseña cambiada exitosamente' 
          } 
        });
      }
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.changePasswordContainer}>
      <div className={styles.changePasswordCard}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <FaArrowLeft />
          </button>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Cambiar Contraseña</h1>
            <p className={styles.subtitle}>Actualiza tu contraseña de acceso</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showPasswords.current ? 'text' : 'password'}
                name="currentPassword"
                placeholder="Contraseña actual"
                value={formData.currentPassword}
                onChange={handleChange}
                error={errors.currentPassword}
                icon={<FaLock />}
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => togglePasswordVisibility('current')}
                aria-label="Alternar visibilidad de contraseña actual"
              >
                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showPasswords.new ? 'text' : 'password'}
                name="newPassword"
                placeholder="Nueva contraseña"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                icon={<FaLock />}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => togglePasswordVisibility('new')}
                aria-label="Alternar visibilidad de nueva contraseña"
              >
                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showPasswords.confirm ? 'text' : 'password'}
                name="confirmNewPassword"
                placeholder="Confirmar nueva contraseña"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                error={errors.confirmNewPassword}
                icon={<FaLock />}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => togglePasswordVisibility('confirm')}
                aria-label="Alternar visibilidad de confirmación de contraseña"
              >
                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.passwordRequirements}>
            <h3>Requisitos de contraseña:</h3>
            <ul>
              <li className={formData.newPassword.length >= 6 ? styles.valid : styles.invalid}>
                Al menos 6 caracteres
              </li>
              <li className={formData.newPassword !== formData.currentPassword && formData.newPassword ? styles.valid : styles.invalid}>
                Diferente a la contraseña actual
              </li>
            </ul>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              type="button"
              variant="secondary"
              size="large"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="large"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;