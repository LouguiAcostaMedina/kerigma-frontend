import { useState, useEffect, useMemo, useCallback } from 'react';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Loading from '@/components/common/Loading';
import { showToast } from '@/utils/notifications';
import { FaPrayingHands, FaHome, FaPlus, FaTrash } from 'react-icons/fa';
import styles from './PastoralCare.module.css';

const TABS = [{ key: 'prayers', label: 'Peticiones de Oración' }, { key: 'visits', label: 'Visitas Pastorales' }];
const PRIORITY_COLORS = { low: 'info', medium: 'warning', high: 'danger', urgent: 'danger' };
const STATUS_COLORS = { pending: 'pending', in_progress: 'inProgress', answered: 'answered', closed: 'closed' };
const STATUS_LABELS = { pending: 'Pendiente', in_progress: 'En Progreso', answered: 'Respondida', closed: 'Cerrada' };
const VISIT_TYPES = ['home', 'hospital', 'office', 'other'];
const VISIT_LABELS = { home: 'Domicilio', hospital: 'Hospital', office: 'Oficina', other: 'Otro' };
const EMPTY_PRAYER = { requesterName: '', subject: '', description: '', priority: 'medium', status: 'pending', isAnonymous: false };
const EMPTY_VISIT = { visitorName: '', visitDate: '', visitType: 'home', reason: '', notes: '', outcome: '', followUpNeeded: false };

const PastoralCare = () => {
  const [tab, setTab] = useState('prayers');
  const [prayers, setPrayers] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_PRAYER);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        fetch('/api/prayer-requests').then(r => r.json()),
        fetch('/api/pastoral-visits').then(r => r.json()),
      ]);
      setPrayers(Array.isArray(pRes) ? pRes : pRes.data || []);
      setVisits(Array.isArray(vRes) ? vRes : vRes.data || []);
    } catch { showToast('Error al cargar datos', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredPrayers = useMemo(() => {
    if (!search) return prayers;
    const q = search.toLowerCase();
    return prayers.filter(p => p.requesterName?.toLowerCase().includes(q) || p.subject?.toLowerCase().includes(q));
  }, [prayers, search]);

  const filteredVisits = useMemo(() => {
    if (!search) return visits;
    const q = search.toLowerCase();
    return visits.filter(v => v.visitorName?.toLowerCase().includes(q) || v.reason?.toLowerCase().includes(q));
  }, [visits, search]);

  const prayerColumns = useMemo(() => [
    { key: 'requesterName', title: 'Solicitante', sortable: true, render: (v, item) => item.isAnonymous ? 'Anónimo' : (v || '—') },
    { key: 'subject', title: 'Asunto', sortable: true },
    { key: 'priority', title: 'Prioridad', render: (v) => <span className={`${styles.badge} ${styles[PRIORITY_COLORS[v] || 'info']}`}>{v}</span> },
    { key: 'status', title: 'Estado', render: (v) => <span className={`${styles.badge} ${styles[STATUS_COLORS[v] || 'pending']}`}>{STATUS_LABELS[v]}</span> },
    { key: 'createdAt', title: 'Fecha', type: 'date' },
  ], []);

  const visitColumns = useMemo(() => [
    { key: 'visitorName', title: 'Visitador', sortable: true },
    { key: 'visitDate', title: 'Fecha', sortable: true, type: 'date' },
    { key: 'visitType', title: 'Tipo', render: (v) => VISIT_LABELS[v] || v },
    { key: 'reason', title: 'Motivo' },
    { key: 'followUpNeeded', title: 'Seguimiento', render: (v) => <span className={`${styles.badge} ${v ? styles.pending : styles.answered}`}>{v ? 'Sí' : 'No'}</span> },
  ], []);

  const openCreate = () => { setForm(tab === 'prayers' ? { ...EMPTY_PRAYER } : { ...EMPTY_VISIT }); setModalMode('create'); setSelected(null); setShowModal(true); };
  const openEdit = (item) => { setForm({ ...item }); setModalMode('edit'); setSelected(item); setShowModal(true); };
  const handleDelete = (item) => { setDeleteTarget(item); setShowDelete(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ep = tab === 'prayers' ? 'prayer-requests' : 'pastoral-visits';
    try { await fetch(`/api/${ep}/${deleteTarget.id}`, { method: 'DELETE' }); showToast('Eliminado', 'success'); loadData(); }
    catch { showToast('Error al eliminar', 'error'); }
    setShowDelete(false); setDeleteTarget(null);
  };

  const cycleStatus = async (prayer) => {
    const order = ['pending', 'in_progress', 'answered', 'closed'];
    const next = order[(order.indexOf(prayer.status) + 1) % order.length];
    try {
      await fetch(`/api/prayer-requests/${prayer.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
      showToast(`Estado cambiado a ${STATUS_LABELS[next]}`, 'success'); loadData();
    } catch { showToast('Error al cambiar estado', 'error'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ep = tab === 'prayers' ? 'prayer-requests' : 'pastoral-visits';
    const isEdit = modalMode === 'edit';
    try {
      await fetch(isEdit ? `/api/${ep}/${selected.id}` : `/api/${ep}`, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      showToast(isEdit ? 'Actualizado' : 'Creado correctamente', 'success'); setShowModal(false); loadData();
    } catch { showToast('Error al guardar', 'error'); }
  };

  const h = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  if (loading) return <Loading message="Cargando datos pastorales..." />;
  const currentData = tab === 'prayers' ? filteredPrayers : filteredVisits;
  const columns = tab === 'prayers' ? prayerColumns : visitColumns;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><FaPrayingHands className={styles.titleIcon} /> Cuidado Pastoral</h1>
        <p className={styles.subtitle}>Gestiona peticiones de oración y visitas pastorales</p>
      </div>
      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`} onClick={() => { setTab(t.key); setSearch(''); }}>
            {t.key === 'prayers' ? <FaPrayingHands /> : <FaHome />} {t.label}
          </button>
        ))}
      </div>
      <div className={styles.toolbar}>
        <input className={styles.searchInput} placeholder={`Buscar ${tab === 'prayers' ? 'peticiones' : 'visitas'}...`} value={search} onChange={e => setSearch(e.target.value)} />
        <button className={styles.addBtn} onClick={openCreate}><FaPlus /> Nuevo</button>
      </div>
      <DataTable data={currentData} columns={columns} onEdit={openEdit} onDelete={handleDelete} actions={['edit', 'delete']}
        customActions={tab === 'prayers' ? (item) => (
          <button className={styles.statusBtn} onClick={() => cycleStatus(item)} title="Cambiar estado">{STATUS_LABELS[item.status]}</button>
        ) : null} />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === 'create' ? (tab === 'prayers' ? 'Nueva Petición' : 'Nueva Visita') : 'Editar'} size="medium">
        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'prayers' ? (<>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nombre del Solicitante</label>
              <input className={styles.input} value={form.requesterName || ''} onChange={e => h('requesterName', e.target.value)} disabled={form.isAnonymous} />
            </div>
            <label className={styles.checkLabel}><input type="checkbox" checked={form.isAnonymous || false} onChange={e => h('isAnonymous', e.target.checked)} /> Petición anónima</label>
            <div className={styles.formGroup}>
              <label className={styles.label}>Asunto</label>
              <input className={styles.input} value={form.subject || ''} onChange={e => h('subject', e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Descripción</label>
              <textarea className={styles.textarea} value={form.description || ''} onChange={e => h('description', e.target.value)} rows={3} />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Prioridad</label>
                <select className={styles.select} value={form.priority || 'medium'} onChange={e => h('priority', e.target.value)}>
                  <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="urgent">Urgente</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Estado</label>
                <select className={styles.select} value={form.status || 'pending'} onChange={e => h('status', e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          </>) : (<>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Visitador</label>
                <input className={styles.input} value={form.visitorName || ''} onChange={e => h('visitorName', e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Fecha</label>
                <input className={styles.input} type="date" value={form.visitDate || ''} onChange={e => h('visitDate', e.target.value)} required />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Visita</label>
                <select className={styles.select} value={form.visitType || 'home'} onChange={e => h('visitType', e.target.value)}>
                  {VISIT_TYPES.map(v => <option key={v} value={v}>{VISIT_LABELS[v]}</option>)}
                </select>
              </div>
              <label className={styles.checkLabel}><input type="checkbox" checked={form.followUpNeeded || false} onChange={e => h('followUpNeeded', e.target.checked)} /> Requiere seguimiento</label>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Motivo</label>
              <input className={styles.input} value={form.reason || ''} onChange={e => h('reason', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Notas</label>
              <textarea className={styles.textarea} value={form.notes || ''} onChange={e => h('notes', e.target.value)} rows={2} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Resultado</label>
              <input className={styles.input} value={form.outcome || ''} onChange={e => h('outcome', e.target.value)} />
            </div>
          </>)}
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>{modalMode === 'create' ? 'Crear' : 'Guardar'}</button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Confirmar Eliminación" size="small">
        <p className={styles.deleteMsg}>¿Eliminar este registro? Esta acción no se puede deshacer.</p>
        <div className={styles.modalActions}>
          <button className={styles.cancelBtn} onClick={() => setShowDelete(false)}>Cancelar</button>
          <button className={styles.deleteBtn} onClick={confirmDelete}><FaTrash /> Eliminar</button>
        </div>
      </Modal>
    </div>
  );
};

export default PastoralCare;
