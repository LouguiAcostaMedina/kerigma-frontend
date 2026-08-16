/**
 * Componente para realizar acciones en lote sobre usuarios seleccionados
 * Incluye operaciones de activar, desactivar, cambiar rol, eliminar, etc.
 */

import React, { useState } from 'react';
import { FaTimes, FaCheck, FaBan, FaTrash, FaUserTag, FaEnvelope, FaDownload, FaChevronDown } from 'react-icons/fa';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { ROLE_OPTIONS } from '@/constants/roles';
import styles from './BulkActions.module.css';

const BulkActions = ({ 
  selectedUsers = [], 
  onBulkOperation, 
  onClearSelection,
  loading = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [operationData, setOperationData] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCount = selectedUsers.length;

  // Configuraciones de operaciones
  const operations = [
    {
      key: 'activate',
      label: 'Activar usuarios',
      icon: <FaCheck />,
      color: 'success',
      description: 'Los usuarios seleccionados serán activados',
      requiresConfirmation: true,
      confirmText: `¿Activar ${selectedCount} usuario${selectedCount > 1 ? 's' : ''}?`
    },
    {
      key: 'deactivate',
      label: 'Desactivar usuarios',
      icon: <FaBan />,
      color: 'warning',
      description: 'Los usuarios seleccionados serán desactivados',
      requiresConfirmation: true,
      confirmText: `¿Desactivar ${selectedCount} usuario${selectedCount > 1 ? 's' : ''}?`
    },
    {
      key: 'changeRole',
      label: 'Cambiar rol',
      icon: <FaUserTag />,
      color: 'primary',
      description: 'Cambiar el rol de los usuarios seleccionados',
      requiresForm: true,
      formFields: [
        {
          name: 'role',
          type: 'select',
          label: 'Nuevo rol',
          required: true,
          options: ROLE_OPTIONS
        }
      ]
    },
    {
      key: 'sendInvitation',
      label: 'Enviar invitaciones',
      icon: <FaEnvelope />,
      color: 'info',
      description: 'Enviar email de invitación a los usuarios seleccionados',
      requiresConfirmation: true,
      confirmText: `¿Enviar invitación a ${selectedCount} usuario${selectedCount > 1 ? 's' : ''}?`
    },
    {
      key: 'export',
      label: 'Exportar selección',
      icon: <FaDownload />,
      color: 'primary',
      description: 'Exportar datos de los usuarios seleccionados',
      requiresForm: true,
      formFields: [
        {
          name: 'format',
          type: 'select',
          label: 'Formato',
          required: true,
          options: [
            { value: 'excel', label: 'Excel (.xlsx)' },
            { value: 'csv', label: 'CSV (.csv)' },
            { value: 'pdf', label: 'PDF (.pdf)' }
          ]
        },
        {
          name: 'includeStats',
          type: 'checkbox',
          label: 'Incluir estadísticas'
        }
      ]
    },
    {
      key: 'delete',
      label: 'Eliminar usuarios',
      icon: <FaTrash />,
      color: 'error',
      description: 'ADVERTENCIA: Esta acción no se puede deshacer',
      requiresConfirmation: true,
      confirmText: `¿ELIMINAR PERMANENTEMENTE ${selectedCount} usuario${selectedCount > 1 ? 's' : ''}?`,
      isDangerous: true
    }
  ];

  // Manejar operación
  const handleOperation = (operation) => {
    setShowDropdown(false);
    
    if (operation.requiresForm) {
      setModalConfig({
        title: operation.label,
        description: operation.description,
        operation: operation.key,
        fields: operation.formFields || [],
        color: operation.color,
        isDangerous: operation.isDangerous
      });
      setOperationData({});
      setShowModal(true);
    } else if (operation.requiresConfirmation) {
      setModalConfig({
        title: operation.label,
        description: operation.description,
        confirmText: operation.confirmText,
        operation: operation.key,
        color: operation.color,
        isDangerous: operation.isDangerous,
        isConfirmation: true
      });
      setShowModal(true);
    } else {
      executeOperation(operation.key);
    }
  };

  // Ejecutar operación
  const executeOperation = async (operationKey, data = {}) => {
    const userIds = selectedUsers.map(user => user.id);
    const success = await onBulkOperation(operationKey, userIds, data);
    
    if (success) {
      setShowModal(false);
      onClearSelection();
    }
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    executeOperation(modalConfig.operation, operationData);
  };

  // Manejar confirmación
  const handleConfirm = () => {
    executeOperation(modalConfig.operation);
  };

  // Renderizar campo del formulario
  const renderFormField = (field) => {
    const { name, type, label, required, options } = field;
    
    switch (type) {
      case 'select':
        return (
          <div key={name} className={styles.formField}>
            <label className={styles.label}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <select
              value={operationData[name] || ''}
              onChange={(e) => setOperationData(prev => ({ ...prev, [name]: e.target.value }))}
              required={required}
              className={styles.select}
            >
              <option value="">Seleccionar {label.toLowerCase()}</option>
              {options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={name} className={styles.formField}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={operationData[name] || false}
                onChange={(e) => setOperationData(prev => ({ ...prev, [name]: e.target.checked }))}
                className={styles.checkbox}
              />
              {label}
            </label>
          </div>
        );
      
      default:
        return (
          <div key={name} className={styles.formField}>
            <label className={styles.label}>
              {label}
              {required && <span className={styles.required}>*</span>}
            </label>
            <input
              type={type}
              value={operationData[name] || ''}
              onChange={(e) => setOperationData(prev => ({ ...prev, [name]: e.target.value }))}
              required={required}
              className={styles.input}
            />
          </div>
        );
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={styles.bulkActions}>
        <div className={styles.selectionInfo}>
          <span className={styles.selectionCount}>
            {selectedCount} usuario{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            icon={<FaTimes />}
            className={styles.clearButton}
          >
            Limpiar selección
          </Button>
        </div>

        <div className={styles.actionButtons}>
          {/* Botones de acceso rápido */}
          <Button
            variant="success"
            size="sm"
            onClick={() => handleOperation(operations[0])}
            icon={operations[0].icon}
            disabled={loading}
          >
            Activar
          </Button>

          <Button
            variant="warning"
            size="sm"
            onClick={() => handleOperation(operations[1])}
            icon={operations[1].icon}
            disabled={loading}
          >
            Desactivar
          </Button>

          {/* Dropdown para más acciones */}
          <div className={styles.dropdown}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              icon={<FaChevronDown />}
              disabled={loading}
              className={`${styles.dropdownButton} ${showDropdown ? styles.active : ''}`}
            >
              Más acciones
            </Button>

            {showDropdown && (
              <div className={styles.dropdownMenu}>
                {operations.slice(2).map((operation) => (
                  <button
                    key={operation.key}
                    onClick={() => handleOperation(operation)}
                    className={`${styles.dropdownItem} ${operation.isDangerous ? styles.dangerous : ''}`}
                    disabled={loading}
                  >
                    <span className={styles.dropdownIcon}>{operation.icon}</span>
                    <span className={styles.dropdownLabel}>{operation.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para formularios y confirmaciones */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalConfig.title}
        size="medium"
      >
        <div className={styles.modalContent}>
          <p className={styles.modalDescription}>
            {modalConfig.description}
          </p>

          {modalConfig.isConfirmation ? (
            // Modal de confirmación
            <div className={styles.confirmationContent}>
              <div className={`${styles.confirmationIcon} ${styles[modalConfig.color]}`}>
                {operations.find(op => op.key === modalConfig.operation)?.icon}
              </div>
              <p className={`${styles.confirmText} ${modalConfig.isDangerous ? styles.dangerous : ''}`}>
                {modalConfig.confirmText}
              </p>
              {modalConfig.isDangerous && (
                <div className={styles.warningBox}>
                  <strong>⚠️ ADVERTENCIA:</strong> Esta acción no se puede deshacer.
                </div>
              )}
            </div>
          ) : (
            // Modal con formulario
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {modalConfig.fields?.map(renderFormField)}
            </form>
          )}

          <div className={styles.modalActions}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type={modalConfig.isConfirmation ? "button" : "submit"}
              variant={modalConfig.isDangerous ? "error" : modalConfig.color || "primary"}
              onClick={modalConfig.isConfirmation ? handleConfirm : undefined}
              disabled={loading}
              loading={loading}
            >
              {modalConfig.isDangerous ? 'Eliminar' : 'Confirmar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div 
          className={styles.dropdownOverlay}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  );
};

export default BulkActions;