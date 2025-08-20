/**
 * Página de No Autorizado
 * Se muestra cuando un usuario intenta acceder a una ruta para la que no tiene permisos
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';
import styles from './Unauthorized.module.css';

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const requiredRoles = location.state?.requiredRoles || [];
  const fromPath = location.state?.from?.pathname || '/dashboard';

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.unauthorizedContainer}>
      <div className={styles.unauthorizedCard}>
        <div className={styles.iconContainer}>
          <FaExclamationTriangle className={styles.warningIcon} />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Acceso No Autorizado</h1>
          
          <p className={styles.message}>
            Lo sentimos, no tienes los permisos necesarios para acceder a esta página.
          </p>

          {requiredRoles.length > 0 && (
            <div className={styles.roleInfo}>
              <p className={styles.roleText}>
                <strong>Roles requeridos:</strong> {requiredRoles.join(', ')}
              </p>
              {user && (
                <p className={styles.userRole}>
                  <strong>Tu rol actual:</strong> {user.rol}
                </p>
              )}
            </div>
          )}

          <div className={styles.suggestions}>
            <h3>¿Qué puedes hacer?</h3>
            <ul>
              <li>Contacta a tu administrador para solicitar los permisos necesarios</li>
              <li>Verifica que estás usando la cuenta correcta</li>
              <li>Regresa al dashboard para acceder a las funciones disponibles para tu rol</li>
            </ul>
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="medium"
            onClick={handleGoBack}
            icon={<FaArrowLeft />}
          >
            Volver Atrás
          </Button>
          
          <Button
            variant="primary"
            size="medium"
            onClick={handleGoHome}
            icon={<FaHome />}
          >
            Ir al Dashboard
          </Button>
        </div>

        {fromPath && fromPath !== '/dashboard' && (
          <div className={styles.attemptedPath}>
            <small>
              Intentaste acceder a: <code>{fromPath}</code>
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default Unauthorized;