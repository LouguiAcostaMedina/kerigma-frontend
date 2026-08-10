/**
 * Página de recuperación de contraseña
 * Solicita el envío de un enlace de restablecimiento al correo del usuario
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '@/services/authService';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import styles from './ForgotPassword.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setError('El email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setError('El email no es válido');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(email.trim());
      const token = result?.data?.resetToken ?? result?.resetToken ?? null;
      if (token) {
        const base = window.location.origin;
        setResetLink(`${base}/reset-password/${token}`);
      }
      setSubmitted(true);
    } catch (err) {
      console.error('Error en recuperación de contraseña:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Ocurrió un error al solicitar la recuperación. Inténtalo nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Solicitud enviada</h1>
            <p className={styles.subtitle}>Recuperación de contraseña</p>
          </div>
          <div className={styles.successBox}>
            Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.
          </div>
          {resetLink && (
            <div className={styles.devBox}>
              <strong>Modo desarrollo:</strong> como el sistema aún no envía correos, usa este enlace
              temporal: <br />
              <a href={resetLink}>{resetLink}</a>
            </div>
          )}
          <div className={styles.footer}>
            <Link to="/login" className={styles.link}>
              Volver al inicio de sesión
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
          <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
          <p className={styles.subtitle}>
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.inputGroup}>
            <Input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              error={error}
              icon={<FaEnvelope />}
              autoComplete="email"
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" variant="primary" size="large" fullWidth loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
        </form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>
            <FaArrowLeft /> Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
