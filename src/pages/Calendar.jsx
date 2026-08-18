import { useState, useEffect, useCallback, useMemo } from 'react';
import { FaCalendarAlt, FaPlus, FaChevronLeft, FaChevronRight, FaClock, FaMapMarkerAlt, FaTrash } from 'react-icons/fa';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { activityService } from '@/services/activityService';
import { showToast } from '@/utils/notifications';
import styles from './Calendar.module.css';

const EVENT_TYPE_CONFIG = {
  worship: { color: '#3b82f6', label: 'Culto' },
  study: { color: '#22c55e', label: 'Estudio' },
  social: { color: '#f59e0b', label: 'Social' },
  outreach: { color: '#8b5cf6', label: 'Evangelismo' },
  meeting: { color: '#ef4444', label: 'Reunión' },
  other: { color: '#6b7280', label: 'Otro' },
};

const RECURRENCE_LABELS = {
  none: 'Sin recurrencia',
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  yearly: 'Anual',
};

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const INITIAL_FORM = {
  title: '',
  eventType: 'worship',
  recurrence: 'none',
  startDate: '',
  endDate: '',
  location: '',
  description: '',
};

function Calendar() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const res = await activityService.getActivities({ startDate, endDate, limit: 100, page: 1 });
      setActivities(res.data?.activities || res.activities || []);
    } catch {
      showToast('Error al cargar actividades', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push({ empty: true, key: `empty-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayActivities = activities.filter(a => {
        const start = a.startDate?.slice(0, 10) || a.start_date?.slice(0, 10);
        const end = a.endDate?.slice(0, 10) || a.end_date?.slice(0, 10);
        return start <= dateStr && dateStr <= (end || start);
      });
      days.push({ empty: false, day: d, dateStr, activities: dayActivities, key: dateStr });
    }
    return days;
  }, [currentDate, activities]);

  const navigateMonth = (dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate) { showToast('Título y fecha de inicio son requeridos', 'error'); return; }
    setSubmitting(true);
    try {
      await activityService.createActivity(form);
      showToast('Actividad creada', 'success');
      setShowCreateModal(false);
      setForm(INITIAL_FORM);
      loadActivities();
    } catch {
      showToast('Error al crear actividad', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;
    try {
      await activityService.deleteActivity(id);
      showToast('Actividad eliminada', 'success');
      setShowDetailModal(false);
      setSelectedActivity(null);
      loadActivities();
    } catch {
      showToast('Error al eliminar actividad', 'error');
    }
  };

  const openDetail = (activity) => { setSelectedActivity(activity); setShowDetailModal(true); };

  const formatDateTime = (dt) => {
    if (!dt) return '';
    return new Date(dt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const monthTitle = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const today = new Date().toISOString().slice(0, 10);

  if (loading) return <Loading />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}><FaCalendarAlt /> Calendario</h1>
          <p className={styles.subtitle}>Gestiona las actividades de la iglesia</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.viewToggle}>
            <button className={`${styles.viewBtn} ${viewMode === 'calendar' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('calendar')}>Calendario</button>
            <button className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`} onClick={() => setViewMode('list')}>Lista</button>
          </div>
          <button className={styles.createButton} onClick={() => { setForm(INITIAL_FORM); setShowCreateModal(true); }}><FaPlus /> Nuevo</button>
        </div>
      </div>

      <div className={styles.monthNav}>
        <button className={styles.navBtn} onClick={() => navigateMonth(-1)}><FaChevronLeft /></button>
        <h2 className={styles.monthTitle}>{monthTitle}</h2>
        <button className={styles.navBtn} onClick={() => navigateMonth(1)}><FaChevronRight /></button>
      </div>

      {viewMode === 'calendar' ? (
        <div className={styles.calendarGrid}>
          {DAY_LABELS.map(d => <div key={d} className={styles.dayHeader}>{d}</div>)}
          {calendarDays.map(cell =>
            cell.empty ? <div key={cell.key} className={styles.dayEmpty} /> : (
              <div key={cell.key} className={`${styles.dayCell} ${cell.dateStr === today ? styles.dayToday : ''}`} onClick={() => { if (cell.activities.length === 1) openDetail(cell.activities[0]); }}>
                <span className={styles.dayNumber}>{cell.day}</span>
                <div className={styles.dayEvents}>
                  {cell.activities.slice(0, 3).map(a => (
                    <div key={a.id || a._id} className={styles.eventDot} style={{ backgroundColor: EVENT_TYPE_CONFIG[a.eventType || a.event_type]?.color || EVENT_TYPE_CONFIG.other.color }} onClick={(e) => { e.stopPropagation(); openDetail(a); }} title={a.title}>
                      {a.title}
                    </div>
                  ))}
                  {cell.activities.length > 3 && <div className={styles.moreEvents}>+{cell.activities.length - 3} más</div>}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className={styles.listSection}>
          <h3 className={styles.sectionTitle}>Actividades del mes</h3>
          {activities.length === 0 ? <EmptyState icon={FaCalendarAlt} title="Sin actividades" description="No hay actividades este mes" /> : (
            <div className={styles.activityList}>
              {activities.sort((a, b) => new Date(a.startDate || a.start_date) - new Date(b.startDate || b.start_date)).map(a => (
                <div key={a.id || a._id} className={styles.activityCard} onClick={() => openDetail(a)}>
                  <div className={styles.activityTypeBar} style={{ backgroundColor: EVENT_TYPE_CONFIG[a.eventType || a.event_type]?.color || EVENT_TYPE_CONFIG.other.color }} />
                  <div className={styles.activityContent}>
                    <h4 className={styles.activityTitle}>{a.title}</h4>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityType}>{EVENT_TYPE_CONFIG[a.eventType || a.event_type]?.label || 'Otro'}</span>
                      <span><FaClock /> {formatDateTime(a.startDate || a.start_date)}</span>
                      {a.location && <span><FaMapMarkerAlt /> {a.location}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Nueva Actividad">
        <form className={styles.createForm} onSubmit={handleCreate}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Título *</label>
            <input className={styles.formInput} name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo</label>
              <select className={styles.formSelect} name="eventType" value={form.eventType} onChange={handleChange}>
                {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Recurrencia</label>
              <select className={styles.formSelect} name="recurrence" value={form.recurrence} onChange={handleChange}>
                {Object.entries(RECURRENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha inicio *</label>
              <input className={styles.formInput} type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha fin</label>
              <input className={styles.formInput} type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ubicación</label>
            <input className={styles.formInput} name="location" value={form.location} onChange={handleChange} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Descripción</label>
            <textarea className={styles.formTextarea} name="description" value={form.description} onChange={handleChange} rows={3} />
          </div>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? 'Creando...' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedActivity(null); }} title="Detalle de Actividad">
        {selectedActivity && (
          <div className={styles.detailContent}>
            <span className={styles.detailTypeBadge} style={{ backgroundColor: EVENT_TYPE_CONFIG[selectedActivity.eventType || selectedActivity.event_type]?.color || EVENT_TYPE_CONFIG.other.color }}>
              {EVENT_TYPE_CONFIG[selectedActivity.eventType || selectedActivity.event_type]?.label || 'Otro'}
            </span>
            <h3 className={styles.detailTitle}>{selectedActivity.title}</h3>
            <div className={styles.detailMeta}>
              <div className={styles.detailRow}><FaClock /> <span>{formatDateTime(selectedActivity.startDate || selectedActivity.start_date)}</span></div>
              {(selectedActivity.endDate || selectedActivity.end_date) && <div className={styles.detailRow}><FaClock /> <span>Hasta: {formatDateTime(selectedActivity.endDate || selectedActivity.end_date)}</span></div>}
              {selectedActivity.location && <div className={styles.detailRow}><FaMapMarkerAlt /> <span>{selectedActivity.location}</span></div>}
              <div className={styles.detailRow}>Recurrencia: <span>{RECURRENCE_LABELS[selectedActivity.recurrence] || RECURRENCE_LABELS.none}</span></div>
            </div>
            {selectedActivity.description && <p>{selectedActivity.description}</p>}
            <div className={styles.detailActions}>
              <button className={styles.deleteBtn} onClick={() => handleDelete(selectedActivity.id || selectedActivity._id)}><FaTrash /> Eliminar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Calendar;
