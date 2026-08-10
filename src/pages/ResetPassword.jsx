/**
 * Página de restablecimiento de contraseña
 * Valida el token recibido por correo y permite definir una nueva contraseña
 */

import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import authService from '@/services/authService';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './ResetPassword.module.css';

const ResetPassword = () => {
  const { token } = useParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (!token) {
      newErrors.token = 'El enlace de recuperación no es válido o ha expirado';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await authService.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'No se pudo restablecer la contraseña. El enlace pudo haber expirado.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Contraseña actualizada</h1>
            <p className={styles.subtitle}>Tu contraseña fue restablecida exitosamente</p>
          </div>
          <div className={styles.successBox}>
            Ya puedes iniciar sesión con tu nueva contraseña.
          </div>
          <div className={styles.footer}>
            <Link to="/login" className={styles.link}>
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Nueva contraseña</h1>
          <p className={styles.subtitle}>Define una nueva contraseña para tu cuenta</p>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                error={errors.newPassword}
                icon={<FaLock />}
                autoComplete="new-password"
                autoFocus
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Alternar visibilidad de la nueva contraseña"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                error={errors.confirmPassword}
                icon={<FaLock />}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label="Alternar visibilidad de la confirmación de contraseña"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {errors.token && <div className={styles.errorBox}>{errors.token}</div>}

          <p className={styles.requirements}>
            La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula y un número.
          </p>

          <Button type="submit" variant="primary" size="large" fullWidth loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Restablecer contraseña'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
