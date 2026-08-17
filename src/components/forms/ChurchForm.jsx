import React, { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers';
import Modal from '../common/Modal';
import Button  from '../common/Button';
import Loading from '../common/Loading';
import { showNotification } from '../../utils/notifications';
import { useCatalog } from '@/hooks/useCatalog';
import styles from './ChurchForm.module.css';

export const ChurchForm = ({ 
  church = null, 
  isOpen = false, 
  onClose, 
  onSave,
  isLoading = false 
}) => {
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { pastorRoles, leaderRoles } = useCatalog();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'Perú',
    phone: '',
    email: '',
    foundedDate: '',
    pastorId: '',
    leaderId: '',
    description: '',
    status: 'active',
    capacity: '',
    services: {
      sunday: { enabled: true, time: '09:00' },
      wednesday: { enabled: false, time: '19:00' },
      friday: { enabled: false, time: '19:00' }
    },
    facilities: {
      parking: false,
      accessibility: false,
      audioVisual: false,
      kitchen: false,
      nursery: false,
      library: false
    },
    contact: {
      website: '',
      facebook: '',
      instagram: '',
      whatsapp: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  // Cargar usuarios (pastores y líderes) al abrir el modal
  useEffect(() => {
    if (isOpen && users.length === 0) {
      fetchUsers();
    }
  }, [isOpen, users.length, fetchUsers]);

  // Llenar formulario si estamos editando
  useEffect(() => {
    if (church) {
      setFormData({
        name: church.name || '',
        address: church.address || '',
        city: church.city || '',
        state: church.state || '',
        country: church.country || 'Perú',
        phone: church.phone || '',
        email: church.email || '',
        foundedDate: church.foundedDate?.split('T')[0] || '',
        pastorId: church.pastorId || '',
        leaderId: church.leaderId || '',
        description: church.description || '',
        status: church.status || 'active',
        capacity: church.capacity || '',
        services: {
          sunday: church.services?.sunday || { enabled: true, time: '09:00' },
          wednesday: church.services?.wednesday || { enabled: false, time: '19:00' },
          friday: church.services?.friday || { enabled: false, time: '19:00' }
        },
        facilities: {
          parking: church.facilities?.parking || false,
          accessibility: church.facilities?.accessibility || false,
          audioVisual: church.facilities?.audioVisual || false,
          kitchen: church.facilities?.kitchen || false,
          nursery: church.facilities?.nursery || false,
          library: church.facilities?.library || false
        },
        contact: {
          website: church.contact?.website || '',
          facebook: church.contact?.facebook || '',
          instagram: church.contact?.instagram || '',
          whatsapp: church.contact?.whatsapp || ''
        }
      });
    } else {
      resetForm();
    }
  }, [church]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      country: 'Perú',
      phone: '',
      email: '',
      foundedDate: '',
      pastorId: '',
      leaderId: '',
      description: '',
      status: 'active',
      capacity: '',
      services: {
        sunday: { enabled: true, time: '09:00' },
        wednesday: { enabled: false, time: '19:00' },
        friday: { enabled: false, time: '19:00' }
      },
      facilities: {
        parking: false,
        accessibility: false,
        audioVisual: false,
        kitchen: false,
        nursery: false,
        library: false
      },
      contact: {
        website: '',
        facebook: '',
        instagram: '',
        whatsapp: ''
      }
    });
    setErrors({});
    setActiveTab('basic');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child, subChild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subChild ? {
            ...prev[parent][child],
            [subChild]: type === 'checkbox' ? checked : value
          } : type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la iglesia es requerido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono no es válido';
    }

    if (formData.capacity && (isNaN(formData.capacity) || formData.capacity < 1)) {
      newErrors.capacity = 'La capacidad debe ser un número mayor a 0';
    }

    if (formData.foundedDate && new Date(formData.foundedDate) > new Date()) {
      newErrors.foundedDate = 'La fecha de fundación no puede ser futura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Por favor corrige los errores en el formulario', 'error');
      return;
    }

    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al guardar iglesia:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pastors = users.filter(user => pastorRoles.includes(user.role));
  const leaders = users.filter(user => leaderRoles.includes(user.role));

  const tabs = [
    { id: 'basic', label: 'Información Básica', icon: '🏛️' },
    { id: 'contact', label: 'Contacto', icon: '📞' },
    { id: 'services', label: 'Servicios', icon: '⛪' },
    { id: 'facilities', label: 'Instalaciones', icon: '🏗️' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="large">
      <div className={styles.formContainer}>
        <div className={styles.header}>
          <h2>{church ? 'Editar Iglesia' : 'Nueva Iglesia'}</h2>
          <Button variant="ghost" size="small" onClick={handleClose}>
            ✕
          </Button>
        </div>

        <div className={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {usersLoading && <Loading size="small" />}
          
          {/* Tab: Información Básica */}
          {activeTab === 'basic' && (
            <div className={styles.tabContent}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="name">Nombre de la Iglesia *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? styles.error : ''}
                    placeholder="Ej: Iglesia Central Lima"
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="status">Estado</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Activa</option>
                    <option value="inactive">Inactiva</option>
                    <option value="construction">En Construcción</option>
                    <option value="planning">En Planificación</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="address">Dirección *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? styles.error : ''}
                    placeholder="Ej: Av. Principal 123"
                  />
                  {errors.address && <span className={styles.errorText}>{errors.address}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="city">Ciudad *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? styles.error : ''}
                    placeholder="Ej: Lima"
                  />
                  {errors.city && <span className={styles.errorText}>{errors.city}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="state">Región/Estado</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Ej: Lima"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="country">País</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  >
                    <option value="Perú">Perú</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Brasil">Brasil</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Chile">Chile</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Venezuela">Venezuela</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="foundedDate">Fecha de Fundación</label>
                  <input
                    type="date"
                    id="foundedDate"
                    name="foundedDate"
                    value={formData.foundedDate}
                    onChange={handleInputChange}
                    className={errors.foundedDate ? styles.error : ''}
                  />
                  {errors.foundedDate && <span className={styles.errorText}>{errors.foundedDate}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="capacity">Capacidad (personas)</label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    className={errors.capacity ? styles.error : ''}
                    placeholder="Ej: 150"
                    min="1"
                  />
                  {errors.capacity && <span className={styles.errorText}>{errors.capacity}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="pastorId">Pastor</label>
                  <select
                    id="pastorId"
                    name="pastorId"
                    value={formData.pastorId}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar pastor...</option>
                    {pastors.map(pastor => (
                      <option key={pastor.id} value={pastor.id}>
                        {pastor.name || pastor.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label htmlFor="leaderId">Líder Asignado</label>
                  <select
                    id="leaderId"
                    name="leaderId"
                    value={formData.leaderId}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleccionar líder...</option>
                    {leaders.map(leader => (
                      <option key={leader.id} value={leader.id}>
                        {leader.name || leader.fullName} ({leader.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Descripción breve de la iglesia, historia, visión, etc."
                />
              </div>
            </div>
          )}

          {/* Tab: Contacto */}
          {activeTab === 'contact' && (
            <div className={styles.tabContent}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? styles.error : ''}
                    placeholder="Ej: +51 999 888 777"
                  />
                  {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                </div>

                <div className={styles.field}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? styles.error : ''}
                    placeholder="Ej: contacto@iglesia.com"
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="contact.website">Sitio Web</label>
                  <input
                    type="url"
                    id="contact.website"
                    name="contact.website"
                    value={formData.contact.website}
                    onChange={handleInputChange}
                    placeholder="https://www.iglesia.com"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact.whatsapp">WhatsApp</label>
                  <input
                    type="tel"
                    id="contact.whatsapp"
                    name="contact.whatsapp"
                    value={formData.contact.whatsapp}
                    onChange={handleInputChange}
                    placeholder="+51 999 888 777"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="contact.facebook">Facebook</label>
                  <input
                    type="url"
                    id="contact.facebook"
                    name="contact.facebook"
                    value={formData.contact.facebook}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/iglesia"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact.instagram">Instagram</label>
                  <input
                    type="url"
                    id="contact.instagram"
                    name="contact.instagram"
                    value={formData.contact.instagram}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/iglesia"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Servicios */}
          {activeTab === 'services' && (
            <div className={styles.tabContent}>
              <h3>Horarios de Servicios</h3>
              
              <div className={styles.serviceItem}>
                <div className={styles.serviceHeader}>
                  <label>
                    <input
                      type="checkbox"
                      name="services.sunday.enabled"
                      checked={formData.services.sunday.enabled}
                      onChange={handleInputChange}
                    />
                    <span>Domingo</span>
                  </label>
                  {formData.services.sunday.enabled && (
                    <input
                      type="time"
                      name="services.sunday.time"
                      value={formData.services.sunday.time}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className={styles.serviceItem}>
                <div className={styles.serviceHeader}>
                  <label>
                    <input
                      type="checkbox"
                      name="services.wednesday.enabled"
                      checked={formData.services.wednesday.enabled}
                      onChange={handleInputChange}
                    />
                    <span>Miércoles</span>
                  </label>
                  {formData.services.wednesday.enabled && (
                    <input
                      type="time"
                      name="services.wednesday.time"
                      value={formData.services.wednesday.time}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className={styles.serviceItem}>
                <div className={styles.serviceHeader}>
                  <label>
                    <input
                      type="checkbox"
                      name="services.friday.enabled"
                      checked={formData.services.friday.enabled}
                      onChange={handleInputChange}
                    />
                    <span>Viernes</span>
                  </label>
                  {formData.services.friday.enabled && (
                    <input
                      type="time"
                      name="services.friday.time"
                      value={formData.services.friday.time}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Instalaciones */}
          {activeTab === 'facilities' && (
            <div className={styles.tabContent}>
              <h3>Instalaciones Disponibles</h3>
              
              <div className={styles.facilitiesGrid}>
                <label className={styles.facilityItem}>
                  <input
                    type="checkbox"
                    name="facilities.parking"
                    checked={formData.facilities.parking}
                    onChange={handleInputChange}
                  />
                  <span className={styles.facilityIcon}>🚗</span>
                  <span>Estacionamiento</span>
                </label>

                <label className={styles.facilityItem}>
                  <input
                    type="checkbox"
                    name="facilities.accessibility"
                    checked={formData.facilities.accessibility}
                    onChange={handleInputChange}
                  />
                  <span className={styles.facilityIcon}>♿</span>
                  <span>Accesibilidad</span>
                </label>

                <label className={styles.facilityItem}>
                  <input
                    type="checkbox"
                    name="facilities.audioVisual"
                    checked={formData.facilities.audioVisual}
                    onChange={handleInputChange}
                  />
                  <span className={styles.facilityIcon}>🎤</span>
                  <span>Audio y Video</span>
                </label>

                <label className={styles.facilityItem}>
                  <input
                    type="checkbox"
                    name="facilities.kitchen"
                    checked={formData.facilities.kitchen}
                    onChange={handleInputChange}
                  />
                  <span className={styles.facilityIcon}>🍽️</span>
                  <span>Cocina</span>
                </label>

                <label className={styles.facilityItem}>
                  <input
                    type="checkbox"
                    name="facilities.nursery"
                    checked={formData.facilities.nursery}
                    onChange={handleInputChange}
                  />
                  <span className={styles.facilityIcon}>👶</span>
                  <span>Guardería</span>
                </label>

                <label className={styles.facilityItem}>
                  <input
                    type="checkbox"
                    name="facilities.library"
                    checked={formData.facilities.library}
                    onChange={handleInputChange}
                  />
                  <span className={styles.facilityIcon}>📚</span>
                  <span>Biblioteca</span>
                </label>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {church ? 'Actualizar' : 'Crear'} Iglesia
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};