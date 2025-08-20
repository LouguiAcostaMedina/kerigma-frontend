/**
 * Página de Perfil de Usuario
 * Muestra y permite editar la información del usuario, incluyendo código QR
 */

import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaBuilding, 
  FaDownload, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaLock,
  FaQrcode 
} from 'react-icons/fa';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef(null);
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || ''
  });
  
  const [errors, setErrors] = useState({});

  if (isLoading || !user) {
    return <Loading fullScreen />;
  }

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono
    });
    setErrors({});
    setIsEditing(false);
  };

  // Descargar QR como imagen
  const downloadQR = async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `perfil-${user.nombre}-${user.apellido}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error al descargar QR:', error);
    }
  };

  // Datos para el QR (información básica del usuario)
  const qrData = JSON.stringify({
    id: user.id,
    nombre: `${user.nombre} ${user.apellido}`,
    email: user.email,
    rol: user.rol,
    iglesia: user.iglesia?.nombre || 'N/A',
    fecha: new Date().toISOString()
  });

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span className={styles.avatarText}>
                {user.nombre.charAt(0)}{user.apellido.charAt(0)}
              </span>
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.userName}>
                {user.nombre} {user.apellido}
              </h1>
              <span className={styles.userRole}>{user.rol}</span>
              <span className={styles.userChurch}>
                {user.iglesia?.nombre || 'Sin iglesia asignada'}
              </span>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            {!isEditing ? (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setShowQR(!showQR)}
                  icon={<FaQrcode />}
                >
                  {showQR ? 'Ocultar QR' : 'Mostrar QR'}
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setIsEditing(true)}
                  icon={<FaEdit />}
                >
                  Editar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  icon={<FaTimes />}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleSave}
                  loading={isUpdating}
                  disabled={isUpdating}
                  icon={<FaSave />}
                >
                  Guardar
                </Button>
              </>
            )}
          </div>
        </div>

        {showQR && (
          <div className={styles.qrSection}>
            <div className={styles.qrContainer} ref={qrRef}>
              <QRCode
                value={qrData}
                size={200}
                level="M"
                includeMargin={true}
                renderAs="canvas"
              />
              <div className={styles.qrInfo}>
                <h3>Código QR del Perfil</h3>
                <p>Escanea para ver información del usuario</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={downloadQR}
              icon={<FaDownload />}
            >
              Descargar QR
            </Button>
          </div>
        )}

        <div className={styles.profileContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Información Personal</h2>
            
            <div className={styles.fieldGroup}>
              <div className={styles.field}>
                <label className={styles.label}>Nombre</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={errors.nombre}
                    icon={<FaUser />}
                  />
                ) : (
                  <div className={styles.fieldValue}>
                    <FaUser className={styles.fieldIcon} />
                    <span>{user.nombre}</span>
                  </div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Apellido</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    error={errors.apellido}
                    icon={<FaUser />}
                  />
                ) : (
                  <div className={styles.fieldValue}>
                    <FaUser className={styles.fieldIcon} />
                    <span>{user.apellido}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Correo Electrónico</label>
              {isEditing ? (
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={<FaEnvelope />}
                />
              ) : (
                <div className={styles.fieldValue}>
                  <FaEnvelope className={styles.fieldIcon} />
                  <span>{user.email}</span>
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              {isEditing ? (
                <Input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={errors.telefono}
                  icon={<FaPhone />}
                />
              ) : (
                <div className={styles.fieldValue}>
                  <FaPhone className={styles.fieldIcon} />
                  <span>{user.telefono}</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Información de la Organización</h2>
            
            <div className={styles.field}>
              <label className={styles.label}>Rol</label>
              <div className={styles.fieldValue}>
                <FaUser className={styles.fieldIcon} />
                <span className={styles.roleValue}>{user.rol}</span>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Iglesia</label>
              <div className={styles.fieldValue}>
                <FaBuilding className={styles.fieldIcon} />
                <span>{user.iglesia?.nombre || 'Sin iglesia asignada'}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Seguridad</h2>
            <div className={styles.securityActions}>
              <Link to="/change-password">
                <Button
                  variant="secondary"
                  size="medium"
                  icon={<FaLock />}
                >
                  Cambiar Contraseña
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;