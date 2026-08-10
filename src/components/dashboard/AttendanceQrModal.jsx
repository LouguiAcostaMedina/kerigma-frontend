/**
 * Componente Modal de Códigos QR de Asistencia
 * Muestra un código QR por grupo que los miembros escanean para marcar asistencia
 * (apunta al endpoint público de check-in)
 */

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { groupsService } from '@/services/groupsService';
import { API_BASE_URL } from '@/constants';
import { showToast } from '@/utils/notifications';
import PropTypes from 'prop-types';
import styles from './AttendanceQrModal.module.css';

const AttendanceQrModal = ({ isOpen, onClose }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const loadGroups = async () => {
      setLoading(true);
      try {
        const response = await groupsService.getGroups({ limit: 100 });
        if (!cancelled) {
          setGroups(Array.isArray(response?.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching groups for QR:', error);
        showToast('Error al cargar los grupos', 'error');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadGroups();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const checkinUrl = (groupId) => `${API_BASE_URL}/attendance/checkin/${groupId}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Códigos QR de Asistencia por Grupo" size="large">
      <p className={styles.hint}>
        Escanee el código QR de un grupo para abrir la página de registro de asistencia
        (check-in público). Cada miembro toca su nombre al llegar.
      </p>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading size="medium" />
        </div>
      ) : groups.length === 0 ? (
        <p className={styles.empty}>No hay grupos registrados</p>
      ) : (
        <div className={styles.qrGrid}>
          {groups.map((group) => (
            <div key={group.id} className={styles.qrCard}>
              <QRCodeSVG
                value={checkinUrl(group.id)}
                size={140}
                level="M"
                marginSize={1}
                title={group.name}
              />
              <div className={styles.qrInfo}>
                <strong className={styles.qrName}>{group.name}</strong>
                <span className={styles.qrUrl}>{checkinUrl(group.id)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

AttendanceQrModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AttendanceQrModal;
