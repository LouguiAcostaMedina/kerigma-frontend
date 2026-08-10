/**
 * Formulario para crear, editar y ver miembros de la iglesia
 * Incluye validación básica, selectores de grupo y modo de visualización
 */

import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaUsers } from 'react-icons/fa';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { groupsService } from '../../services/groupsService';
import { cleanParams } from '../../services/usersService';
import { useAuth } from '../../hooks/useAuth';
import styles from './MemberForm.module.css';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
];

const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Soltero/a' },
  { value: 'married', label: 'Casado/a' },
  { value: 'divorced', label: 'Divorciado/a' },
  { value: 'widowed', label: 'Viudo/a' },
  { value: 'other', label: 'Otro' }
];

const SPIRITUAL_STATUS_OPTIONS = [
  { value: 'new_believer', label: 'Nuevo creyente' },
  { value: 'growing', label: 'En crecimiento' },
  { value: 'mature', label: 'Maduro' },
  { value: 'leader', label: 'Líder' },
  { value: 'teacher', label: 'Maestro' },
  { value: 'visitor', label: 'Visitante' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'other', label: 'Otro' }
];

const EDUCATION_OPTIONS = [
  { value: 'elementary', label: 'Primaria' },
  { value: 'high_school', label: 'Secundaria' },
  { value: 'technical', label: 'Técnico' },
  { value: 'university', label: 'Universidad' },
  { value: 'graduate', label: 'Posgrado' },
  { value: 'other', label: 'Otro' },
  { value: 'not_specified', label: 'No especificado' }
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'suspended', label: 'Suspendido' },
  { value: 'transferred', label: 'Transferido' },
  { value: 'graduated', label: 'Graduado' }
];

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  address: '',
  city: '',
  district: '',
  baptized: false,
  baptismDate: '',
  conversionDate: '',
  spiritualStatus: '',
  joinDate: '',
  status: 'active',
  occupation: '',
  education: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: '',
  groupId: ''
};

const MemberForm = ({
  mode = 'create',
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isReadOnly = mode === 'view';
  const { user } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [groupOptions, setGroupOptions] = useState([]);

  // Sincronizar datos al cambiar el miembro seleccionado
  useEffect(() => {
    if (!initialData) {
      setFormData(EMPTY_FORM);
      setErrors({});
      return;
    }

    setFormData({
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      dateOfBirth: initialData.dateOfBirth ? String(initialData.dateOfBirth).split('T')[0] : '',
      gender: initialData.gender || '',
      maritalStatus: initialData.maritalStatus || '',
      address: initialData.address || '',
      city: initialData.city || '',
      district: initialData.district || '',
      baptized: !!initialData.baptized,
      baptismDate: initialData.baptismDate ? String(initialData.baptismDate).split('T')[0] : '',
      conversionDate: initialData.conversionDate ? String(initialData.conversionDate).split('T')[0] : '',
      spiritualStatus: initialData.spiritualStatus || '',
      joinDate: initialData.joinDate ? String(initialData.joinDate).split('T')[0] : '',
      status: initialData.status || 'active',
      occupation: initialData.occupation || '',
      education: initialData.education || '',
      emergencyContact: initialData.emergencyContact?.name || initialData.emergencyContact || '',
      emergencyPhone: initialData.emergencyContact?.phone || '',
      notes: initialData.notes || '',
      groupId: initialData.groupId || ''
    });
    setErrors({});
  }, [initialData]);

  // Cargar grupos para el selector
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await groupsService.getGroups(cleanParams({ page: 1, limit: 100, church: user?.churchId }));
        if (cancelled) return;
        const list = result?.data || result?.groups || [];
        setGroupOptions(list);
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.churchId]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName.trim()) newErrors.lastName = 'El apellido es requerido';
    if (!formData.groupId) newErrors.groupId = 'Selecciona un grupo';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const submitData = { ...formData };
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
        delete submitData[key];
      }
    });
    if (formData.emergencyContact) {
      submitData.emergencyContact = { name: formData.emergencyContact, phone: formData.emergencyPhone };
    }

    onSubmit && await onSubmit(submitData);
  };

  const renderInput = ({ field, label, type = 'text', required = false, placeholder }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <input
        type={type}
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        disabled={isReadOnly}
        className={`${styles.input} ${errors[field] ? styles.inputError : ''}`}
      />
      {errors[field] && <span className={styles.errorMessage}>{errors[field]}</span>}
    </div>
  );

  const renderSelect = ({ field, label, options, required = false, placeholder }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <select
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        disabled={isReadOnly}
        className={`${styles.input} ${errors[field] ? styles.inputError : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[field] && <span className={styles.errorMessage}>{errors[field]}</span>}
    </div>
  );

  const renderTextarea = ({ field, label, placeholder, rows = 4 }) => (
    <div className={styles.formGroup}>
      <label className={styles.label}>{label}</label>
      <textarea
        value={formData[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={isReadOnly}
        className={`${styles.textarea} ${errors[field] ? styles.inputError : ''}`}
      />
      {errors[field] && <span className={styles.errorMessage}>{errors[field]}</span>}
    </div>
  );

  const renderCheckbox = ({ field, label }) => (
    <div className={styles.formGroup}>
      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          checked={!!formData[field]}
          onChange={(e) => handleChange(field, e.target.checked)}
          disabled={isReadOnly}
        />
        <span>{label}</span>
      </label>
    </div>
  );

  const groupSelectOptions = groupOptions.map(group => ({
    value: group.id,
    label: group.name
  }));

  return (
    <form onSubmit={handleSubmit} className={styles.memberForm}>
      {isLoading && <Loading overlay />}

      <div className={styles.formContent}>
        {/* Información personal */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información Personal</h3>
          <div className={styles.formGrid}>
            {renderInput({
              field: 'firstName',
              label: 'Nombre',
              required: true,
              placeholder: 'Ingresa el nombre'
            })}
            {renderInput({
              field: 'lastName',
              label: 'Apellido',
              required: true,
              placeholder: 'Ingresa el apellido'
            })}
            {renderInput({
              field: 'email',
              label: 'Correo electrónico',
              type: 'email',
              placeholder: 'correo@ejemplo.com'
            })}
            {renderInput({
              field: 'phone',
              label: 'Teléfono',
              type: 'tel',
              placeholder: '+51 999 999 999'
            })}
            {renderInput({
              field: 'dateOfBirth',
              label: 'Fecha de nacimiento',
              type: 'date'
            })}
            {renderSelect({
              field: 'gender',
              label: 'Género',
              options: GENDER_OPTIONS,
              placeholder: 'Seleccionar género'
            })}
            {renderSelect({
              field: 'maritalStatus',
              label: 'Estado civil',
              options: MARITAL_STATUS_OPTIONS,
              placeholder: 'Seleccionar estado civil'
            })}
            {renderInput({
              field: 'occupation',
              label: 'Ocupación',
              placeholder: 'Profesión u ocupación'
            })}
            {renderSelect({
              field: 'education',
              label: 'Nivel educativo',
              options: EDUCATION_OPTIONS,
              placeholder: 'Seleccionar nivel'
            })}
          </div>
        </div>

        {/* Grupo y estado espiritual */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Grupo y Estado Espiritual</h3>
          <div className={styles.formGrid}>
            {renderSelect({
              field: 'groupId',
              label: 'Grupo',
              required: true,
              options: groupSelectOptions,
              placeholder: 'Seleccionar grupo'
            })}
            {renderSelect({
              field: 'spiritualStatus',
              label: 'Estado espiritual',
              options: SPIRITUAL_STATUS_OPTIONS,
              placeholder: 'Seleccionar estado'
            })}
            {renderInput({
              field: 'joinDate',
              label: 'Fecha de ingreso',
              type: 'date'
            })}
            {renderInput({
              field: 'conversionDate',
              label: 'Fecha de conversión',
              type: 'date'
            })}
            {renderInput({
              field: 'baptismDate',
              label: 'Fecha de bautismo',
              type: 'date'
            })}
            {renderSelect({
              field: 'status',
              label: 'Estado',
              options: STATUS_OPTIONS,
              required: true
            })}
            {renderCheckbox({
              field: 'baptized',
              label: 'Bautizado'
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
              placeholder: 'Calle, número, urbanización'
            })}
            {renderInput({
              field: 'city',
              label: 'Ciudad',
              placeholder: 'Ciudad'
            })}
            {renderInput({
              field: 'district',
              label: 'Distrito',
              placeholder: 'Distrito'
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
              placeholder: '+51 999 999 999'
            })}
          </div>
        </div>

        {/* Notas */}
        <div className={styles.section}>
          {renderTextarea({
            field: 'notes',
            label: 'Notas adicionales',
            placeholder: 'Información adicional sobre el miembro...',
            rows: 3
          })}
        </div>
      </div>

      {!isReadOnly && (
        <div className={styles.formActions}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} loading={isLoading}>
            {mode === 'create' ? 'Crear Miembro' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default MemberForm;
