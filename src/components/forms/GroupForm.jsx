/**
 * Formulario para crear, editar y ver grupos de la iglesia
 * Incluye selección de maestros (líderes/pastores) y modo de visualización
 */

import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Loading from '../common/Loading';
import { usersService } from '../../services/usersService';
import { TEACHER_ROLES } from '@/constants/roles';
import styles from './GroupForm.module.css';

const TYPE_OPTIONS = [
  { value: 'youth', label: 'Juventud' },
  { value: 'adults', label: 'Adultos' },
  { value: 'children', label: 'Niños' },
  { value: 'seniors', label: 'Mayores' },
  { value: 'couples', label: 'Matrimonios' },
  { value: 'singles', label: 'Solteros' },
  { value: 'women', label: 'Mujeres' },
  { value: 'men', label: 'Varones' },
  { value: 'students', label: 'Estudiantes' },
  { value: 'professionals', label: 'Profesionales' },
  { value: 'mixed', label: 'Mixto' }
];

const CATEGORY_OPTIONS = [
  { value: 'bible_study', label: 'Estudio Bíblico' },
  { value: 'prayer', label: 'Oración' },
  { value: 'evangelism', label: 'Evangelismo' },
  { value: 'discipleship', label: 'Discipulado' },
  { value: 'worship', label: 'Adoración' },
  { value: 'service', label: 'Servicio' },
  { value: 'fellowship', label: 'Comunión' },
  { value: 'training', label: 'Capacitación' },
  { value: 'mission', label: 'Misión' }
];

const MEETING_DAY_OPTIONS = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planificando' },
  { value: 'active', label: 'Activo' },
  { value: 'paused', label: 'En pausa' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' }
];

const EMPTY_FORM = {
  name: '',
  description: '',
  type: '',
  category: '',
  meetingDay: '',
  meetingTime: '',
  meetingLocation: '',
  maxCapacity: '',
  mainTeacherId: '',
  associateTeacherId: '',
  isOpenToNewMembers: true,
  status: 'active'
};

const GroupForm = ({
  mode = 'create',
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isReadOnly = mode === 'view';
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [teacherOptions, setTeacherOptions] = useState([]);

  // Sincronizar datos al cambiar el grupo seleccionado
  useEffect(() => {
    if (!initialData) {
      setFormData(EMPTY_FORM);
      setErrors({});
      return;
    }

    setFormData({
      name: initialData.name || '',
      description: initialData.description || '',
      type: initialData.type || '',
      category: initialData.category || '',
      meetingDay: initialData.meetingDay || '',
      meetingTime: initialData.meetingTime || '',
      meetingLocation: initialData.meetingLocation || '',
      maxCapacity: initialData.maxCapacity ?? '',
      mainTeacherId: initialData.mainTeacherId || '',
      associateTeacherId: initialData.associateTeacherId || '',
      isOpenToNewMembers: initialData.isOpenToNewMembers !== false,
      status: initialData.status || 'active'
    });
    setErrors({});
  }, [initialData]);

  // Cargar maestros potenciales (líderes/pastores)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await usersService.getUsers({ page: 1, limit: 100 });
        if (cancelled) return;
        const list = Array.isArray(result) ? result : (result?.users || []);
        const teachers = list.filter(user => TEACHER_ROLES.includes(user?.role));
        setTeacherOptions(teachers);
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading teachers:', error);
          setTeacherOptions([]);
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
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.meetingDay) newErrors.meetingDay = 'Selecciona el día de reunión';
    if (!formData.meetingTime) newErrors.meetingTime = 'Indica la hora de reunión';
    if (formData.maxCapacity && Number(formData.maxCapacity) < 1) {
      newErrors.maxCapacity = 'La capacidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const submitData = { ...formData };
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
        delete submitData[key];
      }
    });
    if (submitData.maxCapacity) {
      submitData.maxCapacity = Number(submitData.maxCapacity);
    }
    if (mode === 'create') {
      delete submitData.status;
    }

    onSubmit && await onSubmit(submitData);
  };

  const teacherSelectOptions = teacherOptions.map(user => ({
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
    <form onSubmit={handleSubmit} className={styles.groupForm}>
      {isLoading && <Loading overlay />}

      <div className={styles.formContent}>
        {/* Información general */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Información del Grupo</h3>
          <div className={styles.formGrid}>
            {renderInput({
              field: 'name',
              label: 'Nombre del grupo',
              required: true,
              placeholder: 'Ingresa el nombre del grupo'
            })}
            {renderSelect({
              field: 'type',
              label: 'Tipo',
              options: TYPE_OPTIONS,
              placeholder: 'Seleccionar tipo'
            })}
            {renderSelect({
              field: 'category',
              label: 'Categoría',
              options: CATEGORY_OPTIONS,
              placeholder: 'Seleccionar categoría'
            })}
            {renderInput({
              field: 'maxCapacity',
              label: 'Capacidad máxima',
              type: 'number',
              placeholder: 'Número de miembros'
            })}
          </div>
          {renderTextarea({
            field: 'description',
            label: 'Descripción',
            placeholder: 'Describe el propósito del grupo...',
            rows: 3
          })}
        </div>

        {/* Reuniones */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Reuniones</h3>
          <div className={styles.formGrid}>
            {renderSelect({
              field: 'meetingDay',
              label: 'Día de reunión',
              required: true,
              options: MEETING_DAY_OPTIONS,
              placeholder: 'Seleccionar día'
            })}
            {renderInput({
              field: 'meetingTime',
              label: 'Hora',
              type: 'time',
              required: true
            })}
            {renderInput({
              field: 'meetingLocation',
              label: 'Ubicación',
              placeholder: 'Lugar de reunión'
            })}
          </div>
        </div>

        {/* Maestros */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Maestros</h3>
          <div className={styles.formGrid}>
            {renderSelect({
              field: 'mainTeacherId',
              label: 'Maestro principal',
              options: teacherSelectOptions,
              placeholder: 'Seleccionar maestro'
            })}
            {renderSelect({
              field: 'associateTeacherId',
              label: 'Maestro asociado',
              options: teacherSelectOptions,
              placeholder: 'Seleccionar maestro'
            })}
          </div>
          {renderCheckbox({
            field: 'isOpenToNewMembers',
            label: 'Abierto a nuevos miembros'
          })}
        </div>

        {mode === 'edit' && (
          <div className={styles.section}>
            {renderSelect({
              field: 'status',
              label: 'Estado',
              options: STATUS_OPTIONS,
              required: true
            })}
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className={styles.formActions}>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} loading={isLoading}>
            {mode === 'create' ? 'Crear Grupo' : 'Guardar Cambios'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default GroupForm;
