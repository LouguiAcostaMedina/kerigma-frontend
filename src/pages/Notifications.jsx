import { useState, useEffect, useCallback } from 'react';
import { FaEnvelope, FaPhone, FaPlus, FaFilter, FaTimes, FaCheckCircle, FaExclamationCircle, FaClock, FaBan } from 'react-icons/fa';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import DataTable from '@/components/common/DataTable';
import { notificationService } from '@/services/notificationService';
import { showToast } from '@/utils/notifications';
import styles from './Notifications.module.css';

const channelConfig = {
  email: { icon: FaEnvelope, label: 'Email', color: '#3b82f6' },
  whatsapp: { icon: FaPhone, label: 'WhatsApp', color: '#22c55e' },
  both: { icon: FaEnvelope, label: 'Ambos', color: '#8b5cf6' },
};

const statusConfig = {
  sent: { icon: FaCheckCircle, label: 'Enviado', color: '#22c55e' },
  failed: { icon: FaExclamationCircle, label: 'Fallido', color: '#ef4444' },
  pending: { icon: FaClock, label: 'Pendiente', color: '#f59e0b' },
  cancelled: { icon: FaBan, label: 'Cancelado', color: '#6b7280' },
};

const emptyForm = { channel: 'email', recipientEmail: '', recipientPhone: '', subject: '', body: '', templateName: '' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ channel: '', status: '', dateFrom: '', dateTo: '' });
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, pending: 0 });

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.channel) params.channel = filters.channel;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const res = await notificationService.getNotifications(params);
      const list = res.data?.notifications || res.data || [];
      setNotifications(list);
      setStats({
        total: res.data?.total ?? list.length,
        sent: list.filter((n) => n.status === 'sent').length,
        failed: list.filter((n) => n.status === 'failed').length,
        pending: list.filter((n) => n.status === 'pending').length,
      });
    } catch {
      showToast('Error al cargar notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleCancel = async (id) => {
    try {
      await notificationService.cancelNotification(id);
      showToast('Notificación cancelada', 'success');
      fetchNotifications();
    } catch {
      showToast('Error al cancelar', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await notificationService.create(form);
      showToast('Notificación enviada', 'success');
      setShowModal(false);
      setForm(emptyForm);
      fetchNotifications();
    } catch {
      showToast('Error al enviar', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderChannelBadge = (ch) => {
    const cfg = channelConfig[ch] || channelConfig.email;
    const Icon = cfg.icon;
    return <span className={styles.channelBadge} style={{ color: cfg.color }}><Icon /> {cfg.label}</span>;
  };

  const renderStatusBadge = (st) => {
    const cfg = statusConfig[st] || statusConfig.pending;
    const Icon = cfg.icon;
    return <span className={styles.statusBadge} style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}><Icon /> {cfg.label}</span>;
  };

  const columns = [
    { key: 'createdAt', label: 'Fecha', render: (v) => new Date(v).toLocaleDateString('es-ES') },
    { key: 'channel', label: 'Canal', render: renderChannelBadge },
    { key: 'recipientEmail', label: 'Destinatario', render: (v, row) => v || row.recipientPhone || '-' },
    { key: 'subject', label: 'Asunto', render: (v) => v || '-' },
    { key: 'status', label: 'Estado', render: renderStatusBadge },
    { key: 'actions', label: '', render: (_, row) => row.status === 'pending' && <button className={styles.cancelBtn} onClick={() => handleCancel(row.id)}>Cancelar</button> },
  ];

  const statCards = [
    { key: 'total', label: 'Total', value: stats.total, color: 'var(--color-primary)' },
    { key: 'sent', label: 'Enviados', value: stats.sent, color: '#22c55e' },
    { key: 'failed', label: 'Fallidos', value: stats.failed, color: '#ef4444' },
    { key: 'pending', label: 'Pendientes', value: stats.pending, color: '#f59e0b' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notificaciones</h1>
          <p className={styles.subtitle}>Gestión central de comunicaciones</p>
        </div>
        <button className={styles.createButton} onClick={() => setShowModal(true)}><FaPlus /> Enviar Notificación</button>
      </div>

      <div className={styles.statsGrid}>
        {statCards.map((s) => (
          <div key={s.key} className={styles.statCard}>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.filtersBar}>
        <FaFilter className={styles.filterIcon} />
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect} value={filters.channel} onChange={(e) => setFilters((p) => ({ ...p, channel: e.target.value }))}>
            <option value="">Todos los canales</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="both">Ambos</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect} value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}>
            <option value="">Todos los estados</option>
            <option value="sent">Enviado</option>
            <option value="pending">Pendiente</option>
            <option value="failed">Fallido</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <input type="date" className={styles.filterInput} value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} />
          <span>-</span>
          <input type="date" className={styles.filterInput} value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {loading ? <Loading /> : <DataTable columns={columns} data={notifications} />}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enviar Notificación">
        <form className={styles.createForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Canal</label>
            <select className={styles.formSelect} value={form.channel} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))} required>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Correo del destinatario</label>
            <input className={styles.formInput} type="email" value={form.recipientEmail} onChange={(e) => setForm((p) => ({ ...p, recipientEmail: e.target.value }))} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Teléfono del destinatario</label>
            <input className={styles.formInput} type="tel" value={form.recipientPhone} onChange={(e) => setForm((p) => ({ ...p, recipientPhone: e.target.value }))} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Asunto (opcional)</label>
            <input className={styles.formInput} type="text" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Plantilla (opcional)</label>
            <select className={styles.formSelect} value={form.templateName} onChange={(e) => setForm((p) => ({ ...p, templateName: e.target.value }))}>
              <option value="">Sin plantilla</option>
              <option value="welcome">Bienvenida</option>
              <option value="event_reminder">Recordatorio de evento</option>
              <option value="birthday">Cumpleaños</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Mensaje *</label>
            <textarea className={styles.formTextarea} rows={4} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} required />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}><FaTimes /> Cancelar</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}><FaEnvelope /> {submitting ? 'Enviando...' : 'Enviar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
