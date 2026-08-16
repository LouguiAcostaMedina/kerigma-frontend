/**
 * Componente de formulario para crear y editar usuarios
 * Incluye validación, manejo de archivos y diferentes modos de visualización
 */

import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaUpload, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { ROLE_OPTIONS } from '@/constants/roles';
import styles from './UserForm.module.css';

const UserForm = ({
  mode = 'create', // create, edit, view
  data = {},
  errors = {},
  churches = [],
  loading = false,
  onChange,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'reader',
    status: 'active',
    churchId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    occupation: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    password: '',
    confirmPassword: '',
    ...data
  });

  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(data.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);

  const isReadOnly = mode === 'view';
  const isCreate = mode === 'create';

  // Actualizar formData cuando cambian los datos
  useEffect(() => {
    setFormData(prev => ({ ...prev, ...data }));
    setAvatarPreview(data.avatar || null);
  }, [data]);

  // Manejar cambios en los campos
  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    onChange && onChange(newFormData);
  };

  // Manejar carga de avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
      
      handleChange('avatar', file);
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isReadOnly) return;

    // Validación básica
    if (!formData.name.trim()) {
      return;
    }

    if (isCreate && formData.password !== formData.confirmPassword) {
      return;
    }

    const submitData = { ...formData };
    if (avatarFile) {
      submitData.avatar = avatarFile;
    }

    // Limpiar campos de contraseña si no se están usando
    if (!isCreate && !submitData.password) {
      delete submitData.password;
      delete submitData.confirmPassword;
    }

    onSubmit && await onSubmit(submitData);
  };

  // Obtener error de campo
  const getFieldError = (field) => errors[field];

  // Renderizar campo de input
  const renderInput = ({ field, label, type = 'text', icon, required = false, placeholder, ...props }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {icon && <span className={styles.labelIcon}>{icon}</span>}
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div className={styles.inputWrapper}>
        <input
          type={type}
          value={formData[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          placeholder={placeholder}
          disabled={isReadOnly}
          className={`${styles.input} ${getFieldError(field) ? styles.inputError : ''}`}
          {...props}
        />
        {field === 'password' || field === 'confirmPassword' ? (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isReadOnly}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        ) : null}
      </div>
      {getFieldError(field) && (
        <span className={styles.errorMessage}>{getFieldError(field)}</span>
      )}
    </div>
  );

  // Renderizar campo select
  const renderSelect = ({ field, label, options, icon, required = false, placeholder }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {icon && <span className={styles.labelIcon}>{icon}</span>}
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        disabled={isReadOnly}
        className={`${styles.input} ${getFieldError(field) ? styles.inputError : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {getFieldError(field) && (
        <span className={styles.errorMessage}>{getFieldError(field)}</span>
      )}
    </div>
  );

  // Renderizar textarea
  const renderTextarea = ({ field, label, icon, placeholder, rows = 4 }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {icon && <span className={styles.labelIcon}>{icon}</span>}
        {label}
      </label>
      <textarea
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={isReadOnly}
        className={`${styles.textarea} ${getFieldError(field) ? styles.inputError : ''}`}
      />
      {getFieldError(field) && (
        <span className={styles.errorMessage}>{getFieldError(field)}</span>
      )}
    </div>
  );

  const roleOptions = ROLE_OPTIONS;

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'suspended', label: 'Suspendido' },
    { value: 'pending', label: 'Pendiente' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'other', label: 'Otro' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Soltero/a' },
    { value: 'married', label: 'Casado/a' },
    { value: 'divorced', label: 'Divorciado/a' },
    { value: 'widowed', label: 'Viudo/a' }
  ];

  const churchOptions = churches.map(church => ({
    value: church.id,
    label: church.name
  }));

  return (
    <form onSubmit={handleSubmit} className={styles.userForm}>
      {loading && <Loading overlay />}
      
      {/* Avatar */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className={styles.avatarPreview} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <FaUser />
            </div>
          )}
          {!isReadOnly && (
            <div className={styles.avatarOverlay}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.avatarInput}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className={styles.avatarUpload}>
                <FaUpload />
              </label>
            </div>
          )}
        </div>
        <div className={styles.avatarInfo}>
          <h3>Foto de perfil</h3>
          <p>Recomendado: 400x400px, máximo 2MB</p>
        </div>
      </div>

      <div className={styles.formContent}>
        {/* Información básica */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Básica</h3>
          <div className={styles.formGrid}>
            {renderInput({
              field: 'name',
              label: 'Nombre completo',
              icon: <FaUser />,
              required: true,
              placeholder: 'Ingresa el nombre completo'
            })}

            {renderInput({
              field: 'email',
              label: 'Correo electrónico',
              type: 'email',
              icon: <FaEnvelope />,
              required: true,
              placeholder: 'correo@ejemplo.com'
            })}

            {renderInput({
              field: 'phone',
              label: 'Teléfono',
              type: 'tel',
              icon: <FaPhone />,
              placeholder: '+1 234 567 8900'
            })}

            {renderSelect({
              field: 'role',
              label: 'Rol',
              options: roleOptions,
              required: true
            })}

            {renderSelect({
              field: 'status',
              label: 'Estado',
              options: statusOptions,
              required: true
            })}

            {renderSelect({
              field: 'churchId',
              label: 'Iglesia',
              options: churchOptions,
              placeholder: 'Seleccionar iglesia'
            })}
          </div>
        </div>

        {/* Información personal */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Personal</h3>
          <div className={styles.formGrid}>
            {renderInput({
              field: 'dateOfBirth',
              label: 'Fecha de nacimiento',
              type: 'date'
            })}

            {renderSelect({
              field: 'gender',
              label: 'Género',
              options: genderOptions,
              placeholder: 'Seleccionar género'
            })}

            {renderSelect({
              field: 'maritalStatus',
              label: 'Estado civil',
              options: maritalStatusOptions,
              placeholder: 'Seleccionar estado civil'
            })}

            {renderInput({
              field: 'occupation',
              label: 'Ocupación',
              placeholder: 'Profesión u ocupación'
            })}
          </div>
        </div>

        {/* Dirección */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Dirección</h3>
          <div className={styles.formGrid}>
            {renderInput({
              field: 'address',
              label: 'Dirección',
              icon: <FaMapMarkerAlt />,
              placeholder: 'Calle, número, colonia'
            })}

            {renderInput({
              field: 'city',
              label: 'Ciudad',
              placeholder: 'Ciudad'
            })}

            {renderInput({
              field: 'state',
              label: 'Estado/Provincia',
              placeholder: 'Estado o provincia'
            })}

            {renderInput({
              field: 'zipCode',
              label: 'Código postal',
              placeholder: '12345'
            })}
          </div>
        </div>

        {/* Contacto de emergencia */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Contacto de Emergencia</h3>
          <div className={styles.formGrid}>
            {renderInput({
              field: 'emergencyContact',
              label: 'Nombre del contacto',
              placeholder: 'Nombre completo'
            })}

            {renderInput({
              field: 'emergencyPhone',
              label: 'Teléfono del contacto',
              type: 'tel',
              placeholder: '+1 234 567 8900'
            })}
          </div>
        </div>

        {/* Contraseña (solo en creación) */}
        {isCreate && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Credenciales</h3>
            <div className={styles.formGrid}>
              {renderInput({
                field: 'password',
                label: 'Contraseña',
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Mínimo 8 caracteres'
              })}

              {renderInput({
                field: 'confirmPassword',
                label: 'Confirmar contraseña',
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Repite la contraseña'
              })}
            </div>
          </div>
        )}

        {/* Notas */}
        <div className={styles.section}>
          {renderTextarea({
            field: 'notes',
            label: 'Notas adicionales',
            placeholder: 'Información adicional sobre el usuario...',
            rows: 3
          })}
        </div>
      </div>

      {/* Acciones */}
      {!isReadOnly && (
        <div className={styles.formActions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
          >
            {isCreate ? 'Crear Usuario' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default UserForm;