// Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaBuilding } from 'react-icons/fa';
import { ROLES } from '@/constants/roles';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    rol: 'Lector',
    iglesiaId: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

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
    } else if (!/^\d{8,15}$/.test(formData.telefono.replace(/[\s\-\(\)]/g, ''))) {
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
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        password: formData.password,
        rol: formData.rol,
        iglesiaId: parseInt(formData.iglesiaId)
      };

      const result = await register(userData);

      if (result.success) {
        navigate('/login', { 
          state: { 
            message: 'Registro exitoso. Puedes iniciar sesión ahora.' 
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
            <div className={styles.cross}></div>
            <div className={styles.circle}></div>
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

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Rol del usuario</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className={styles.select}
              >
                {Object.entries(ROLES).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.rol && <span className={styles.error}>{errors.rol}</span>}
            </div>

            <div className={styles.inputGroup}>
              <Input
                type="number"
                name="iglesiaId"
                placeholder="ID de Iglesia"
                value={formData.iglesiaId}
                onChange={handleChange}
                error={errors.iglesiaId}
                icon={<FaBuilding />}
                min="1"
              />
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