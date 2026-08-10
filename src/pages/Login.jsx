// Login.jsx
import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import styles from "./Login.module.css"; 

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const submittingRef = useRef(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";
  const infoMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Cambiado a callback funcional estricto para evitar pérdidas de caracteres en hilos de React
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. 🛑 CONTROL CRÍTICO SÍNCRONO: Freno de mano instantáneo a nivel de CPU
    if (submittingRef.current || isSubmitting) {
      return false;
    }

    // 2. Ejecutar validaciones locales
    if (!validateForm()) return false;

    // 3. CAPTURA SEGURA INMUTABLE: Extraemos y congelamos los datos en este milisegundo exacto
    const emailToSend = formData.email ? formData.email.trim() : "";
    const passwordToSend = formData.password || "";

    // 4. SALVAGUARDA ABSOLUTA: Si por desfase de renderizado los datos están vacíos,
    // matamos el proceso en el cliente ANTES de que toque Axios y genere el Error 400
    if (!emailToSend || !passwordToSend) {
      return false;
    }

    // 5. Encendemos ambos bloqueos en paralelo de forma segura
    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      // Pasamos los datos congelados limpios a la API
      const result = await login({
        email: emailToSend,
        password: passwordToSend,
      });

      if (result && result.success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.churchLogo}>
            <img
              src="/src/assets/LOGO-ADVENTISTA.png"
              alt="Logo Iglesia Adventista"
              className={styles.logoImage}
            />
          </div>
          <h1 className={styles.title}>Iglesia Adventista</h1>
          <p className={styles.subtitle}>Sistema de Gestión Misionera</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className={styles.form} noValidate>
          {infoMessage && (
            <div className={styles.infoBanner}>
              {infoMessage}
            </div>
          )}

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
              disabled={isSubmitting} // Deshabilitar inputs durante el envío
            />
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.passwordContainer}>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<FaLock />}
                autoComplete="current-password"
                disabled={isSubmitting} // Deshabilitar inputs durante el envío
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                disabled={isSubmitting}
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
            disabled={isSubmitting} // 🛡️ Congela físicamente el botón para evitar clics dobles
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.registerLink}>
            ¿No tienes cuenta?{" "}
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
        "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo
        unigénito, para que todo aquel que en él cree, no se pierda, mas tenga
        vida eterna"
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