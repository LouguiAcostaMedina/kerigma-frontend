// NotFound.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import { FaHome, FaArrowLeft, FaSearchMinus } from 'react-icons/fa';
import styles from './NotFound.module.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(isAuthenticated ? '/dashboard' : '/login');
    }
  };

  const handleGoHome = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundCard}>
        <div className={styles.churchLogo}>
         <img 
    src="/src/assets/LOGO-ADVENTISTA.png" 
    alt="Logo Iglesia Adventista" 
    className={styles.logoImage} 
  />
        </div>
        
        <div className={styles.iconContainer}>
          <div className={styles.errorCode}>404</div>
          <FaSearchMinus className={styles.searchIcon} />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Página No Encontrada</h1>
          
          <p className={styles.message}>
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          <div className={styles.suggestions}>
            <h3>¿Qué puedes hacer?</h3>
            <ul>
              <li>Verifica que la URL esté escrita correctamente</li>
              <li>Utiliza el menú de navegación para encontrar lo que buscas</li>
              <li>Regresa a la página anterior o al inicio</li>
              <li>Si crees que esto es un error, contacta al administrador</li>
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
            {isAuthenticated ? 'Ir al Dashboard' : 'Ir al Inicio'}
          </Button>
        </div>

        <div className={styles.helpText}>
          <small>
            Si necesitas ayuda, puedes contactar al soporte técnico
          </small>
        </div>
      </div>

      <div className={styles.inspirationText}>
        "Jesús le dijo: Yo soy el camino, y la verdad, y la vida; nadie viene al Padre, sino por mí"
        <span>Juan 14:6</span>
      </div>
      
      <div className={styles.natureElements}>
        <div className={`${styles.leaf} ${styles.leaf1}`}></div>
        <div className={`${styles.leaf} ${styles.leaf2}`}></div>
        <div className={`${styles.leaf} ${styles.leaf3}`}></div>
      </div>
    </div>
  );
};

export default NotFound;