// Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaBuilding } from 'react-icons/fa';
import { churchesService } from '@/services/churchesService';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    iglesiaId: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [churches, setChurches] = useState([]);
  const [loadingChurches, setLoadingChurches] = useState(true);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchChurches = async () => {
      try {
        setLoadingChurches(true);
        const response = await churchesService.getPublicChurches(controller.signal);
        const data = response?.data || response;
        setChurches(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          console.error('Error cargando iglesias:', err);
        }
      } finally {
        setLoadingChurches(false);
      }
    };
    fetchChurches();
    return () => controller.abort();
  }, []);

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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    } else if (formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{8,15}$/.test(formData.telefono.replace(/[\s\-()]/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener entre 8 y 15 dígitos';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.iglesiaId) {
      newErrors.iglesiaId = 'Debes seleccionar una iglesia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const userData = {
        firstName: formData.nombre.trim(),
        lastName: formData.apellido.trim(),
        email: formData.email.trim(),
        phone: formData.telefono.trim(),
        password: formData.password,
        churchId: formData.iglesiaId
      };

      const result = await register(userData);

      if (result.success) {
        navigate('/login', { 
          state: { 
            message: 'Tu cuenta fue creada y está pendiente de aprobación por un administrador. Te notificaremos cuando puedas iniciar sesión.' 
          } 
        });
      }
    } catch (error) {
      console.error('Error en registro:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <div className={styles.registerCard}>
        <div className={styles.registerHeader}>
          <div className={styles.churchLogo}>
            <img
              src="/src/assets/LOGO-ADVENTISTA.png"
              alt="Logo Iglesia Adventista"
              className={styles.logoImage}
            />
          </div>
          <h1 className={styles.title}>Registro de Usuario</h1>
          <p className={styles.subtitle}>Únete al sistema de gestión misionera</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <Input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={errors.nombre}
                icon={<FaUser />}
                autoComplete="given-name"
                autoFocus
              />
            </div>
            <div className={styles.inputGroup}>
              <Input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleChange}
                error={errors.apellido}
                icon={<FaUser />}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<FaEnvelope />}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <Input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              error={errors.telefono}
              icon={<FaPhone />}
              autoComplete="tel"
            />
          </div>

          <div className={styles.row}>
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
                  autoComplete="new-password"
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

            <div className={styles.inputGroup}>
              <div className={styles.passwordContainer}>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  icon={<FaLock />}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Iglesia</label>
            <div className={styles.selectWrapper}>
              <FaBuilding className={styles.selectIcon} />
              <select
                name="iglesiaId"
                value={formData.iglesiaId}
                onChange={handleChange}
                className={styles.select}
                disabled={loadingChurches}
              >
                <option value="">
                  {loadingChurches ? 'Cargando iglesias...' : '-- Selecciona tu iglesia --'}
                </option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id}>
                    {church.name}{church.city ? ` - ${church.city}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {errors.iglesiaId && <span className={styles.error}>{errors.iglesiaId}</span>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting || loadingChurches}
          >
            {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
          </Button>
        </form>

        <div className={styles.registerFooter}>
          <p className={styles.loginLink}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className={styles.link}>
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
      
      <div className={styles.inspirationText}>
        "Y les dijo: Id por todo el mundo y predicad el evangelio a toda criatura"
        <span>Marcos 16:15</span>
      </div>
      
      <div className={styles.natureElements}>
        <div className={`${styles.leaf} ${styles.leaf1}`}></div>
        <div className={`${styles.leaf} ${styles.leaf2}`}></div>
        <div className={`${styles.leaf} ${styles.leaf3}`}></div>
      </div>
    </div>
  );
};

export default Register;
