import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/common/Button';
import Input, { Select } from '@/components/common/Input';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { ROLE_LABELS } from '@/constants';
import {
  FaUserCircle,
  FaShieldAlt,
  FaCog,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaKey,
  FaBuilding,
  FaDatabase,
  FaSave,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import styles from './Configuration.module.css';

const TABS = [
  { id: 'profile', label: 'Perfil de Usuario', icon: <FaUserCircle /> },
  { id: 'security', label: 'Seguridad', icon: <FaShieldAlt /> },
  { id: 'preferences', label: 'Preferencias del Sistema', icon: <FaCog /> }
];

const SETTINGS_KEY = 'app_settings';

const Configuration = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    systemName: 'Sistema Misionero',
    allowRegister: false,
    backupFrequency: 'daily'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Cargar preferencias guardadas localmente
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
      }
    } catch (error) {
      console.error('Error cargando preferencias:', error);
    }
  }, []);

  // Sincronizar el formulario de perfil con el usuario actual
  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  if (isLoading || !user) {
    return <Loading fullScreen />;
  }

  const roleLabel = ROLE_LABELS[user.role] || user.role || 'Usuario';
  const userFullName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ');
  const churchName = user.church?.name || 'Sin iglesia asignada';

  // ---------- Perfil ----------
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const nextErrors = {};
    if (!profileForm.firstName.trim()) nextErrors.firstName = 'El nombre es requerido';
    if (!profileForm.lastName.trim()) nextErrors.lastName = 'El apellido es requerido';
    if (profileForm.phone && !/^\d{7,20}$/.test(profileForm.phone.trim())) {
      nextErrors.phone = 'El teléfono debe contener entre 7 y 20 dígitos';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;
    setIsUpdating(true);
    try {
      const result = await updateProfile({
        firstName: profileForm.firstName.trim(),
        lastName: profileForm.lastName.trim(),
        phone: profileForm.phone
      });
      if (result.success) {
        showToast('Perfil actualizado correctamente', 'success');
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      showToast(error?.message || 'Error al actualizar el perfil', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // ---------- Preferencias ----------
  const handleSettingsChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      showToast('Preferencias guardadas correctamente', 'success');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      showToast('Error al guardar las preferencias', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  };

  const renderProfileTab = () => (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <FaUserCircle className={styles.cardTitleIcon} />
        Información del Perfil
      </h2>

      <div className={styles.avatarSection}>
        <div className={styles.avatar}>
          {user.firstName?.charAt(0)}
          {user.lastName?.charAt(0)}
        </div>
        <div>
          <p className={styles.avatarName}>{userFullName}</p>
          <p className={styles.avatarRole}>{roleLabel}</p>
          <p className={styles.avatarChurch}>
            <FaBuilding /> {churchName}
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        <Input
          label="Nombre"
          name="firstName"
          value={profileForm.firstName}
          onChange={handleProfileChange}
          error={errors.firstName}
          icon={<FaUser />}
        />
        <Input
          label="Apellido"
          name="lastName"
          value={profileForm.lastName}
          onChange={handleProfileChange}
          error={errors.lastName}
          icon={<FaUser />}
        />
      </div>

      <div className={styles.field}>
        <Input
          label="Correo Electrónico"
          name="email"
          value={user.email || ''}
          icon={<FaEnvelope />}
          readOnly
        />
        <p className={styles.helper}>El correo electrónico no se puede modificar.</p>
      </div>

      <div className={styles.field}>
        <Input
          label="Teléfono"
          name="phone"
          value={profileForm.phone}
          onChange={handleProfileChange}
          error={errors.phone}
          icon={<FaPhone />}
        />
      </div>

      <div className={styles.fieldActions}>
        <Button
          variant="primary"
          onClick={handleSaveProfile}
          loading={isUpdating}
          disabled={isUpdating}
          icon={<FaSave />}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaKey className={styles.cardTitleIcon} />
          Contraseña y Autenticación
        </h2>
        <p className={styles.description}>
          Cambia tu contraseña para mantener tu cuenta segura. Se recomienda una
          contraseña de al menos 8 caracteres con letras y números.
        </p>
        <div className={styles.fieldActions}>
          <Button
            variant="primary"
            onClick={() => navigate('/change-password')}
            icon={<FaKey />}
          >
            Cambiar Contraseña
          </Button>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <FaShieldAlt className={styles.cardTitleIcon} />
          Estado de la Cuenta
        </h2>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>
            <FaUser /> Rol
          </span>
          <span className={styles.statusValue}>{roleLabel}</span>
        </div>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>
            <FaBuilding /> Iglesia
          </span>
          <span className={styles.statusValue}>{churchName}</span>
        </div>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>
            <FaCheckCircle /> Cuenta activa
          </span>
          <span className={styles.statusValue}>
            {user.isActive ? 'Sí' : 'No'}
          </span>
        </div>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>
            <FaCheckCircle /> Cuenta aprobada
          </span>
          <span className={styles.statusValue}>
            {user.isApproved ? 'Sí' : 'No'}
          </span>
        </div>

        <div className={styles.statusRow}>
          <span className={styles.statusLabel}>
            <FaClock /> Último acceso
          </span>
          <span className={styles.statusValue}>{formatDate(user.lastLogin)}</span>
        </div>
      </div>
    </>
  );

  const renderPreferencesTab = () => (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        <FaCog className={styles.cardTitleIcon} />
        Preferencias del Sistema
      </h2>

      <div className={styles.field}>
        <Input
          label="Nombre de la Aplicación"
          name="systemName"
          value={settings.systemName}
          onChange={(e) => handleSettingsChange('systemName', e.target.value)}
          icon={<FaCog />}
        />
      </div>

      <div className={styles.switchRow}>
        <div>
          <p className={styles.switchTitle}>Permitir Nuevos Registros</p>
          <p className={styles.switchDescription}>
            Habilita o deshabilita el formulario público de registro para nuevos usuarios.
          </p>
        </div>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={settings.allowRegister}
            onChange={(e) => handleSettingsChange('allowRegister', e.target.checked)}
          />
          <span className={styles.toggleSlider}></span>
        </label>
      </div>

      <div className={styles.field}>
        <Select
          label="Frecuencia de Copias de Seguridad"
          name="backupFrequency"
          value={settings.backupFrequency}
          onChange={(e) => handleSettingsChange('backupFrequency', e.target.value)}
          options={[
            { value: 'daily', label: 'Cada 24 horas (Recomendado)' },
            { value: 'weekly', label: 'Semanal' },
            { value: 'monthly', label: 'Mensual' }
          ]}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.databaseRow}>
          <div>
            <p className={styles.switchTitle}>Base de Datos</p>
            <p className={styles.switchDescription}>
              PostgreSQL · Los respaldos automatizados se gestionan a nivel de infraestructura.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => showToast('El respaldo se gestiona en el proveedor de la base de datos', 'info')}
            icon={<FaDatabase />}
          >
            Respaldar Ahora
          </Button>
        </div>
      </div>

      <p className={styles.note}>
        Estas preferencias se guardan localmente en este navegador.
      </p>

      <div className={styles.fieldActions}>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
          loading={isSavingSettings}
          disabled={isSavingSettings}
          icon={<FaSave />}
        >
          Guardar Preferencias
        </Button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Configuración</h1>
        <p className={styles.subtitle}>
          Gestiona tu perfil, la seguridad de tu cuenta y las preferencias del sistema.
        </p>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'security' && renderSecurityTab()}
      {activeTab === 'preferences' && renderPreferencesTab()}
    </div>
  );
};

export default Configuration;
