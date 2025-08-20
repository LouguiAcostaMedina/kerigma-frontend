// Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import styles from './Login.module.css'; // Importamos el módulo CSS

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await login({
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Error en login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.churchLogo}>
            <div className={styles.cross}></div>
            <div className={styles.circle}></div>
          </div>
          <h1 className={styles.title}>Iglesia Adventista</h1>
          <p className={styles.subtitle}>Sistema de Gestión Misionera</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<FaUser />}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<FaLock />}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.registerLink}>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className={styles.link}>
              Regístrate aquí
            </Link>
          </p>
          <Link to="/forgot-password" className={styles.forgotLink}>
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
      
      <div className={styles.inspirationText}>
        "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, 
        para que todo aquel que en él cree, no se pierda, mas tenga vida eterna" 
        <span>Juan 3:16</span>
      </div>
      
      <div className={styles.natureElements}>
        <div className={`${styles.leaf} ${styles.leaf1}`}></div>
        <div className={`${styles.leaf} ${styles.leaf2}`}></div>
        <div className={`${styles.leaf} ${styles.leaf3}`}></div>
      </div>
    </div>
  );
};

export default Login;