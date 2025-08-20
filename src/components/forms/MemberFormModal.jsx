/**
 * Modal de Formulario para Crear/Editar Miembros
 * Formulario completo con validación para gestión de miembros
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMembers } from '@/hooks/useMembers';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { FaUser, FaUpload, FaTimes } from 'react-icons/fa';
import { showNotification } from '@/utils/notifications';
import PropTypes from 'prop-types';
import styles from './MemberFormModal.module.css';

const MemberFormModal = ({ 
  isOpen, 
  onClose, 
  member = null, 
  onSuccess = null 
}) => {
  const { user } = useAuth();
  const { createMember, updateMember, loading } = useMembers();

  const isEditing = !!member;

  // Estado del formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    document: '',
    documentType: 'DNI',
    birthDate: '',
    gender: '',
    address: '',
    city: '',
    country: 'Perú',
    churchId: '',
    groupId: '',
    position: '',
    joinDate: '',
    baptismDate: '',
    maritalStatus: 'single',
    profession: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    photo: null,
    status: 'active'
  });

  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  // Opciones para selects
  const documentTypes = ['DNI', 'Carnet de Extranjería', 'Pasaporte'];
  const genders = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' }
  ];
  const maritalStatuses = [
    { value: 'single', label: 'Soltero/a' },
    { value: 'married', label: 'Casado/a' },
    { value: 'divorced', label: 'Divorciado/a' },
    { value: 'widowed', label: 'Viudo/a' }
  ];
  const positions = [
    'Miembro',
    'Diácono',
    'Anciano',
    'Pastor Auxiliar',
    'Ministro',
    'Evangelista',
    'Maestro'
  ];

  // Cargar datos del miembro si está editando
  useEffect(() => {
    if (isEditing && member) {
      setFormData({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        document: member.document || '',
        documentType: member.documentType || 'DNI',
        birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
        gender: member.gender || '',
        address: member.address || '',
        city: member.city || '',
        country: member.country || 'Perú',
        churchId: member.churchId || '',
        groupId: member.groupId || '',
        position: member.position || '',
        joinDate: member.joinDate ? new Date(member.joinDate).toISOString().split('T')[0] : '',
        baptismDate: member.baptismDate ? new Date(member.baptismDate).toISOString().split('T')[0] : '',
        maritalStatus: member.maritalStatus || 'single',
        profession: member.profession || '',
        emergencyContact: member.emergencyContact || '',
        emergencyPhone: member.emergencyPhone || '',
        notes: member.notes || '',
        photo: null,
        status: member.status || 'active'
      });
      setPhotoPreview(member.photo);
    }
  }, [isEditing, member]);

  // Limpiar formulario al cerrar
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        document: '',
        documentType: 'DNI',
        birthDate: '',
        gender: '',
        address: '',
        city: '',
        country: 'Perú',
        churchId: '',
        groupId: '',
        position: '',
        joinDate: '',
        baptismDate: '',
        maritalStatus: 'single',
        profession: '',
        emergencyContact: '',
        emergencyPhone: '',
        notes: '',
        photo: null,
        status: 'active'
      });
      setErrors({});
      setPhotoPreview(null);
    }
  }, [isOpen]);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar carga de foto
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB límite
        showNotification({
          type: 'error',
          title: 'Error',
          message: 'La foto no puede ser mayor a 5MB'
        });
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Remover foto
  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photo: null }));
    setPhotoPreview(isEditing ? member?.photo : null);
    document.getElementById('photo-input').value = '';
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    // Campos requeridos
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.document.trim()) {
      newErrors.document = 'El documento es requerido';
    }
    if (!formData.gender) {
      newErrors.gender = 'El género es requerido';
    }
    if (!formData.joinDate) {
      newErrors.joinDate = 'La fecha de ingreso es requerida';
    }

    // Validar teléfono si se proporciona
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no es válido';
    }

    // Validar fechas
    if (formData.birthDate && formData.joinDate) {
      const birthDate = new Date(formData.birthDate);
      const joinDate = new Date(formData.joinDate);
      if (birthDate >= joinDate) {
        newErrors.joinDate = 'La fecha de ingreso debe ser posterior a la fecha de nacimiento';
      }
    }

    if (formData.baptismDate && formData.joinDate) {
      const baptismDate = new Date(formData.baptismDate);
      const joinDate = new Date(formData.joinDate);
      if (baptismDate < joinDate) {
        newErrors.baptismDate = 'La fecha de bautismo no puede ser anterior a la fecha de ingreso';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification({
        type: 'error',
        title: 'Error de validación',
        message: 'Por favor corrige los errores en el formulario'
      });
      return;
    }

    try {
      // Preparar datos para envío
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'photo' && formData[key]) {
          submitData.append('photo', formData[key]);
        } else if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      let result;
      if (isEditing) {
        result = await updateMember(member.id, submitData);
      } else {
        result = await createMember(submitData);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Miembro' : 'Nuevo Miembro'}
      size="large"
    >
      <form onSubmit={handleSubmit} className={styles.memberForm}>
        {/* Foto del miembro */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Foto del Miembro</label>
          <div className={styles.photoUpload}>
            {photoPreview && (
              <div className={styles.photoPreviewContainer}>
                <img 
                  src={photoPreview} 
                  alt="Vista previa" 
                  className={styles.photoPreview}
                />
                <button
                  type="button"
                  onClick={removePhoto}
                  className={styles.removePhotoButton}
                >
                  <FaTimes />
                </button>
              </div>
            )}
            <div className={styles.photoUploadButton}>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className={styles.fileInput}
              />
              <label htmlFor="photo-input" className={styles.uploadButton}>
                <FaUpload />
                {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
              </label>
              <span className={styles.photoHint}>
                JPG, PNG o GIF. Máximo 5MB.
              </span>
            </div>
          </div>
        </div>

        {/* Información personal */}
        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.required}`}>
            Nombre
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Nombre del miembro"
          />
          {errors.firstName && (
            <span className={styles.formError}>{errors.firstName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.required}`}>
            Apellido
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Apellido del miembro"
          />
          {errors.lastName && (
            <span className={styles.formError}>{errors.lastName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.required}`}>
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="correo@ejemplo.com"
          />
          {errors.email && (
            <span className={styles.formError}>{errors.email}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="+51 999 999 999"
          />
          {errors.phone && (
            <span className={styles.formError}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tipo de Documento</label>
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.required}`}>
            Número de Documento
          </label>
          <input
            type="text"
            name="document"
            value={formData.document}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="12345678"
          />
          {errors.document && (
            <span className={styles.formError}>{errors.document}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Fecha de Nacimiento</label>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleInputChange}
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.required}`}>
            Género
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            <option value="">Seleccionar género</option>
            {genders.map(gender => (
              <option key={gender.value} value={gender.value}>
                {gender.label}
              </option>
            ))}
          </select>
          {errors.gender && (
            <span className={styles.formError}>{errors.gender}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Estado Civil</label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            {maritalStatuses.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Profesión</label>
          <input
            type="text"
            name="profession"
            value={formData.profession}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Profesión u ocupación"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Dirección completa"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Ciudad</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Ciudad"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={`${styles.formLabel} ${styles.required}`}>
            Fecha de Ingreso
          </label>
          <input
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleInputChange}
            className={styles.formInput}
          />
          {errors.joinDate && (
            <span className={styles.formError}>{errors.joinDate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Fecha de Bautismo</label>
          <input
            type="date"
            name="baptismDate"
            value={formData.baptismDate}
            onChange={handleInputChange}
            className={styles.formInput}
          />
          {errors.baptismDate && (
            <span className={styles.formError}>{errors.baptismDate}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Posición/Cargo</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            <option value="">Seleccionar posición</option>
            {positions.map(position => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Contacto de Emergencia</label>
          <input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Nombre del contacto"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Teléfono de Emergencia</label>
          <input
            type="tel"
            name="emergencyPhone"
            value={formData.emergencyPhone}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="+51 999 999 999"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Estado</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>Notas</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={styles.formTextarea}
            placeholder="Notas adicionales sobre el miembro..."
            rows={3}
          />
        </div>

        {/* Acciones del modal */}
        <div className={`${styles.modalActions} ${styles.fullWidth}`}>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<FaUser />}
          >
            {isEditing ? 'Actualizar Miembro' : 'Crear Miembro'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

MemberFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  member: PropTypes.object,
  onSuccess: PropTypes.func
};

export default MemberFormModal;