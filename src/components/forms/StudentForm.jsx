/**
 * Formulario para crear, editar y ver estudiantes bíblicos
 * Incluye selección de grupo y mentor, y modo de visualización
 */

import React, { useState, useEffect } from 'react';
import Loading from '../common/Loading';
import { FormFooter } from '@/components/common/FormFooter';
import { groupsService } from '../../services/groupsService';
import { usersService, cleanParams } from '../../services/usersService';
import { useAuth } from '../../hooks/useAuth';
import styles from './StudentForm.module.css';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer_not_to_say', label: 'Prefiero no decir' }
];

const PROGRAM_OPTIONS = [
  { value: 'basic_bible', label: 'Biblia Básica' },
  { value: 'intermediate_bible', label: 'Biblia Intermedia' },
  { value: 'advanced_bible', label: 'Biblia Avanzada' },
  { value: 'theology', label: 'Teología' },
  { value: 'discipleship', label: 'Discipulado' },
  { value: 'leadership', label: 'Liderazgo' },
  { value: 'missions', label: 'Misiones' },
  { value: 'evangelism', label: 'Evangelismo' },
  { value: 'counseling', label: 'Consejería' },
  { value: 'other', label: 'Otro' }
];

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Principiante' },
  { value: 'intermediate', label: 'Intermedio' },
  { value: 'advanced', label: 'Avanzado' },
  { value: 'graduate', label: 'Graduado' }
];

const MENTOR_ROLES = ['leader', 'director', 'admin', 'super_admin'];

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  city: '',
  district: '',
  enrollmentDate: '',
  program: '',
  level: '',
  mentorId: '',
  groupId: '',
  isBeliever: false,
  baptized: false,
  churchMember: false,
  notes: ''
};

const StudentForm = ({
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
  const [mentorOptions, setMentorOptions] = useState([]);

  // Sincronizar datos al cambiar el estudiante seleccionado
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
      address: initialData.address || '',
      city: initialData.city || '',
      district: initialData.district || '',
      enrollmentDate: initialData.enrollmentDate ? String(initialData.enrollmentDate).split('T')[0] : '',
      program: initialData.program || '',
      level: initialData.level || '',
      mentorId: initialData.mentorId || '',
      groupId: initialData.groupId || '',
      isBeliever: !!initialData.isBeliever,
      baptized: !!initialData.baptized,
      churchMember: !!initialData.churchMember,
      notes: initialData.notes || ''
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

  // Cargar mentores potenciales (líderes/pastores)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await usersService.getUsers({ page: 1, limit: 100 });
        if (cancelled) return;
        const list = Array.isArray(result) ? result : (result?.users || []);
        const mentors = list.filter(user => MENTOR_ROLES.includes(user?.role));
        setMentorOptions(mentors);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading mentors:', error);
          setMentorOptions([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
    if (mode === 'create' && !formData.groupId) newErrors.groupId = 'Selecciona un grupo';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const submitData = { ...formData };
    if (mode === 'edit') {
      delete submitData.groupId;
    }
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    onSubmit && await onSubmit(submitData);
  };

  const groupSelectOptions = groupOptions.map(group => ({
    value: group.id,
    label: group.name
  }));

  const mentorSelectOptions = mentorOptions.map(user => ({
    value: user.id,
    label: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
  }));

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

  return (
    <form onSubmit={handleSubmit} className={styles.studentForm}>
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

        {/* Programa académico */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Programa Bíblico</h3>
          <div className={styles.formGrid}>
            {renderSelect({
              field: 'program',
              label: 'Programa',
              options: PROGRAM_OPTIONS,
              placeholder: 'Seleccionar programa'
            })}
            {renderSelect({
              field: 'level',
              label: 'Nivel',
              options: LEVEL_OPTIONS,
              placeholder: 'Seleccionar nivel'
            })}
            {renderInput({
              field: 'enrollmentDate',
              label: 'Fecha de inscripción',
              type: 'date'
            })}
            {renderSelect({
              field: 'groupId',
              label: 'Grupo',
              required: mode === 'create',
              options: groupSelectOptions,
              placeholder: 'Seleccionar grupo'
            })}
            {renderSelect({
              field: 'mentorId',
              label: 'Mentor',
              options: mentorSelectOptions,
              placeholder: 'Seleccionar mentor'
            })}
          </div>
        </div>

        {/* Estado espiritual */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Estado Espiritual</h3>
          <div className={styles.formGrid}>
            {renderCheckbox({
              field: 'isBeliever',
              label: 'Es creyente'
            })}
            {renderCheckbox({
              field: 'baptized',
              label: 'Bautizado'
            })}
            {renderCheckbox({
              field: 'churchMember',
              label: 'Miembro de la iglesia'
            })}
          </div>
        </div>

        {/* Notas */}
        <div className={styles.section}>
          {renderTextarea({
            field: 'notes',
            label: 'Notas adicionales',
            placeholder: 'Información adicional sobre el estudiante...',
            rows: 3
          })}
        </div>
      </div>

      <FormFooter
        onCancel={onCancel}
        saving={isLoading}
        hidden={isReadOnly}
        labels={{ submit: mode === 'create' ? 'Crear Estudiante' : 'Guardar Cambios' }}
      />
    </form>
  );
};

export default StudentForm;
